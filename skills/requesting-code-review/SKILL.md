---
name: requesting-code-review
description: Dispatch code review subagent to verify work meets requirements and spec compliance
whenToUse: Use when completing tasks or before merging to verify work meets requirements
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

## Overview

Dispatch code review subagent to verify work meets requirements and spec compliance. Structured code review with spec compliance check and quality assessment.

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

## Subagent Dispatch Template

When requesting a code review, dispatch a subagent with this template:

```
Perform a comprehensive code review of the following work. Use this skill (nexus:requesting-code-review) to structure your review.

Files to review:
[LIST SPECIFIC FILES HERE]

Branch/commit to review:
[BRANCH NAME OR COMMIT HASH]

Specification reference:
[LINK TO SPEC/PLAN DOCUMENT]

Focus areas:
- Spec compliance: Does implementation match requirements?
- Code quality: Readability, correctness, performance, security
- Test coverage: Adequate coverage of scenarios?
- Architecture: Proper design patterns, maintainability

Return a structured review with:
1. Critical issues (must fix)
2. Important issues (should fix)
3. Minor suggestions
4. Overall assessment
```

## Integration

**REQUIRED SUB-SKILL:** nexus:finishing-a-development-branch (after review passes)
**REQUIRED SUB-SKILL:** nexus:verification-before-completion (before requesting review)

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought                                | Reality                                            |
| -------------------------------------- | -------------------------------------------------- |
| "This is too small to review"          | Review early and often.                             |
| "I'll review it myself"                | Fresh perspective catches more issues.              |
| "The code works, no review needed"     | Working code can still have quality issues.         |
| "I don't have time for review"         | Review prevents more time-consuming fixes later.    |
| "Only big changes need review"         | Small changes can introduce critical bugs.          |
| "I'm the expert, I don't need review"  | Everyone benefits from another perspective.         |