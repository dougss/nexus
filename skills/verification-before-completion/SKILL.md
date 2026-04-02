---
name: verification-before-completion
description: Evidence before claims — run verification and confirm output before any success claim
whenToUse: Use when about to claim work is complete, before committing or creating PRs
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<IRON-LAW>
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
</IRON-LAW>

## Overview

Evidence before claims — run verification commands and confirm output before ANY success claim. Non-negotiable.

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

## The Gate Function

```
BEFORE claiming any status:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim
```

## What to Verify

- **Tests pass:** Run full test suite, confirm 0 failures
- **Build succeeds:** Execute build command, check exit code 0
- **No lint errors:** Run linter, confirm no violations
- **Feature works:** Execute feature manually if needed
- **Requirements met:** Check each requirement against implementation

## Common Failures

| Claim            | Requires                     | Not Sufficient                |
| ---------------- | ---------------------------- | ----------------------------- |
| Tests pass       | Test output: 0 failures      | Previous run, "should pass"   |
| Build succeeds   | Build command: exit 0        | Linter passing                |
| Bug fixed        | Original symptom test passes | "Code changed, assumed fixed" |
| Requirements met | Line-by-line checklist       | Tests passing                 |

## Forbidden Words

Never use these without providing actual verification evidence:

- "should", "probably", "seems to", "appears to"
- "I believe", "I think", "likely"
- "appears successful", "looks good"
- "tested previously", "was working before"

Instead, say: "[Command output] shows [specific result with numbers/exit codes]."

## Red Flags — STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Done!")
- About to commit/push/PR without verification
- Relying on partial verification
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse                    | Reality                |
| ------------------------- | ---------------------- |
| "Should work now"         | RUN the verification   |
| "I'm confident"           | Confidence ≠ evidence  |
| "Just this once"          | No exceptions          |
| "Agent said success"      | Verify independently   |
| "Partial check is enough" | Partial proves nothing |

## The Bottom Line

Run the command. Read the output. THEN claim the result. Non-negotiable.

## Integration

**REQUIRED SUB-SKILL:** nexus:requesting-code-review (after verification passes)