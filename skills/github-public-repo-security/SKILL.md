---
name: github-public-repo-security
description: Hardens public GitHub repos with Dependabot, CI, CodeQL, dependency review, SECURITY.md, LICENSE, rulesets, and gh CLI — full checklist and copy-paste artifacts
whenToUse: Use when making a repo public, hardening OSS, or applying GitHub security workflows (Dependabot, Actions, branch rules, secret scanning)
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<IRON-LAW>
NEVER commit secrets, API keys, or real .env values. Rotate anything that ever touched git history before going public.
</IRON-LAW>

## Overview

End-to-end workflow for **public repositories** on GitHub: supply chain, static analysis, CI gates, dependency hygiene, contributor reporting, and **branch rulesets** (not legacy branch protection only). Aligns with GitHub recommended security layers: **secret protection**, **Dependabot**, **code scanning (CodeQL)**, **reviewable automation**, and **governance** on the default branch.

**Core principle:** Defense in depth — no single control is enough; stack controls and verify each with `gh` and the Security tab.

## Preconditions

- `gh` authenticated (`gh auth status`) with token scopes including `repo` (and `workflow` if editing Actions).
- Admin rights on the target repository.
- Local tree has `.gitignore` covering `.env`, keys, `dist/` if applicable.

## Layer A — Repository hygiene (no GitHub UI required for basics)

| Action | Why |
| ------ | --- |
| `.gitignore` includes `.env`, `*.pem`, secrets | Prevents accidental commits |
| No secrets in current tree | Use `git grep -iE 'api[_-]?key|secret|BEGIN (RSA|OPENSSH)'` before push |
| `.env.example` with placeholder names only | Documents vars without values |
| Rotate credentials if history ever contained secrets | History is forever |

## Layer B — GitHub security features (API / `gh`)

Run against `OWNER/REPO` (example: `dougss/claw-engine`).

**1. Secret scanning + push protection**

```bash
gh repo edit OWNER/REPO --enable-secret-scanning --enable-secret-scanning-push-protection
```

**2. Dependabot security updates** (alert-driven version bumps)

```bash
printf '%s' '{"security_and_analysis":{"dependabot_security_updates":{"status":"enabled"}}}' \
  | gh api repos/OWNER/REPO -X PATCH --input -
```

**3. Confirm**

```bash
gh api repos/OWNER/REPO -q '.security_and_analysis'
```

## Layer C — Repository files to add (commit in one PR or push)

Paths are relative to repo root.

### 1) `.github/dependabot.yml`

- Ecosystem `npm` for app root and any nested app (e.g. `src/dashboard`).
- Ecosystem `github-actions` for workflow supply chain.
- Weekly schedule; label PRs `dependencies`.

### 2) `.github/workflows/ci.yml`

- Triggers: `push` + `pull_request` to `main`.
- `permissions: contents: read` (minimal).
- `concurrency` to cancel superseded runs.
- Job **name must be exactly `CI`** if the ruleset below requires check context `CI`.
- Steps: `actions/checkout@v4`, `actions/setup-node@v4` (Node LTS, e.g. 22), `npm ci` at root and in nested package dirs if needed, `npm run typecheck`, `npm test` (unit only unless services are provisioned), `npm run build`, then `npm audit --audit-level=high` at root and nested apps.

### 3) `.github/workflows/codeql.yml`

- Languages: `javascript-typescript` (adjust if polyglot).
- Triggers: push/PR to `main` + weekly `schedule` cron.
- `permissions`: `contents: read`, `security-events: write`.
- `queries: security-extended` on `github/codeql-action/init@v3`.

### 4) `.github/workflows/dependency-review.yml`

- `on: pull_request` only.
- `actions/dependency-review-action@v4` with `fail-on-severity: high` (tune: `moderate` stricter).
- Omit `deny-licenses` unless policy is explicit — wrong license lists block valid PRs.

### 5) `SECURITY.md`

- Supported versions statement.
- Private reporting: GitHub Security Advisories link + contact email.
- Scope / out-of-scope for reports.

### 6) `LICENSE`

- Choose license (e.g. MIT). Ensures GitHub shows license metadata.

## Layer D — Order of operations (critical)

<HARD-GATE>
Do NOT create a ruleset that requires check context `CI` until a workflow run named `CI` has succeeded at least once on the default branch. Otherwise merges can deadlock.
</HARD-GATE>

1. Commit workflow files + `SECURITY.md` + `LICENSE`.
2. Push to default branch; wait for **CI** workflow **success**:

```bash
gh run list -R OWNER/REPO -L 5
gh run watch <RUN_ID> -R OWNER/REPO --exit-status
```

3. Only then create or update the **ruleset** (Layer E).

## Layer E — Branch ruleset (recommended over legacy protection only)

Use **repository rulesets** targeting `~DEFAULT_BRANCH`.

**Rules to include:**

1. `pull_request` — require PR before merge; `required_approving_review_count` set to **0** for solo maintainers or **1+** when multiple trusted reviewers exist; `required_review_thread_resolution: true`; `allowed_merge_methods`: merge, squash, rebase as desired; `dismiss_stale_reviews_on_push: true`.
2. `required_status_checks` — `strict_required_status_checks_policy: true`; `required_status_checks: [{ "context": "CI" }]` matching the workflow job name.
3. `non_fast_forward` — blocks force-push.

**Bypass for repository admins (solo owner workflow):**

```json
"bypass_actors": [
  {
    "actor_id": 5,
    "actor_type": "RepositoryRole",
    "bypass_mode": "always"
  }
]
```

`actor_id` **5** is the well-known **Admin** repository role in GitHub API. Verify with `current_user_can_bypass` after PUT.

**Create** (first time):

```bash
gh api repos/OWNER/REPO/rulesets -X POST --input ruleset.json
```

**Update** (existing ruleset id from `gh api repos/OWNER/REPO/rulesets`):

```bash
gh api repos/OWNER/REPO/rulesets/RULESET_ID -X PUT --input ruleset.json
```

**Inspect:**

```bash
gh api repos/OWNER/REPO/rulesets --jq '.[].{id,name,bypass_actors}'
```

## Layer F — Verification checklist

| Check | Command / location |
| ----- | ------------------ |
| CI green | `gh run list -R OWNER/REPO` |
| CodeQL completed | Security tab → Code scanning alerts |
| Dependabot enabled | Insights → Dependency graph / Security dependabot |
| Ruleset active | Repo → Settings → Rules → Rulesets |
| License detected | `gh repo view OWNER/REPO --json licenseInfo` |
| Security policy | `gh repo view OWNER/REPO --json isSecurityPolicyEnabled` |

## Red Flags

| Symptom | Likely cause |
| ------- | ------------ |
| Cannot merge PR | Missing required check name mismatch — job must be named `CI` if ruleset requires `CI` |
| Ruleset 422 | Invalid rule payload; compare with GET existing ruleset JSON |
| Dependabot flood | Normal after first `dependabot.yml` — triage weekly |
| `npm audit` fails CI | Vulnerabilities at or above threshold — bump deps or lower threshold consciously |
| Push blocked | Ruleset without bypass — add bypass actors or use PR flow |

## Integration

- Chain with **nexus:verification-before-completion** before claiming the hardening is done.
- Chain with **nexus:writing-skills** if extending this skill.

## Reference — minimal `ruleset.json` template

```json
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["~DEFAULT_BRANCH"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "allowed_merge_methods": ["merge", "squash", "rebase"],
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_approving_review_count": 0,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "do_not_enforce_on_create": false,
        "required_status_checks": [{ "context": "CI" }]
      }
    },
    { "type": "non_fast_forward" }
  ],
  "bypass_actors": [
    {
      "actor_id": 5,
      "actor_type": "RepositoryRole",
      "bypass_mode": "always"
    }
  ]
}
```

Adjust `required_approving_review_count` when requiring external reviewer approval; keep or remove `bypass_actors` per governance policy.
