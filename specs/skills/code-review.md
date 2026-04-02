# Code Review

Structured code review with spec compliance check and quality assessment.

**Category:** quality
**Tags:** quality, review, workflow

---

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**

- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**

- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Review

### 1. Spec Compliance (first pass)

- Read the spec/plan document
- Check every requirement has corresponding implementation
- Check no requirement was skipped or partially implemented
- Verify acceptance scenarios can be demonstrated

### 2. Code Quality (second pass)

- Readability: clear names, small functions, no magic numbers
- Correctness: edge cases, error paths, null checks at boundaries
- Performance: no obvious N+1 queries, unnecessary loops, or memory leaks
- Security: no injection points, proper auth checks, input validation at boundaries
- Tests: coverage of happy path + error paths + edge cases

### 3. Classify Issues

| Severity      | Action            | Example                                             |
| ------------- | ----------------- | --------------------------------------------------- |
| **Critical**  | Fix immediately   | Security hole, data loss risk, broken functionality |
| **Important** | Fix before merge  | Missing error handling, test gaps, wrong behavior   |
| **Minor**     | Fix later or note | Naming, minor style, small optimization             |

### 4. Act on Feedback

- Fix **Critical** issues immediately
- Fix **Important** issues before proceeding
- Note **Minor** issues for later
- Push back if reviewer is wrong (with reasoning)

## Integration with Workflows

| Workflow        | When to Review             |
| --------------- | -------------------------- |
| Subagent-Driven | After EACH task            |
| Executing Plans | After each batch (3 tasks) |
| Ad-Hoc          | Before merge, when stuck   |

## Next Step

After review and fixes applied, invoke `verification` to confirm everything passes before declaring complete.
