---
name: writing-plans
description: Decompose specs into bite-sized implementation tasks with TDD, exact file paths, and complete code
whenToUse: Use when you have a spec or requirements for a multi-step task, before touching code
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<HARD-GATE>
Do NOT write implementation code during planning. The plan IS the deliverable.
</HARD-GATE>

## Overview

Write comprehensive implementation plans assuming the engineer has zero context. Document everything: which files to touch, code, testing, docs. Give the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

## SPEC_REF Input

If invoked with a `SPEC_REF:` block (output of nexus:brainstorming), **read `specs/<slug>/spec.md` before writing the plan** — the spec is the source of truth for requirements and scope.

```
SPEC_REF: specs/<slug>
spec:     specs/<slug>/spec.md
```

If no SPEC_REF is provided, derive the slug from the feature description using `kebab-case`.

## Scope Check

If the spec covers multiple independent subsystems, break into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## File Structure

Before defining tasks, map out which files will be created or modified:

- Design units with clear boundaries and well-defined interfaces
- Prefer smaller, focused files over large ones
- In existing codebases, follow established patterns

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**

1. "Write the failing test" — step
2. "Run it to make sure it fails" — step
3. "Implement the minimal code to make the test pass" — step
4. "Run the tests and make sure they pass" — step
5. "Commit" — step

## Plan Document Header

```markdown
# [Feature Name] Implementation Plan

**Goal:** [One sentence describing what this builds]
**Architecture:** [2-3 sentences about approach]
**Tech Stack:** [Key technologies/libraries]
**Spec:** specs/<slug>/spec.md
**Plan:** specs/<slug>/plan.md

**REQUIRED SUB-SKILL:** nexus:subagent-driven-development (recommended for parallel execution) OR nexus:executing-plans (for sequential execution)
```

## Task Structure

```markdown
### Task N: [Component Name]

**Files:**

- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts:123-145`
- Test: `tests/exact/path/to/test.ts`

- [ ] **Step 1: Write the failing test**
      [actual test code block]

- [ ] **Step 2: Run test to verify it fails**
      Run: `npm test path/test.ts`
      Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**
      [actual implementation code block]

- [ ] **Step 4: Run test to verify it passes**
      Expected: PASS

- [ ] **Step 5: Commit**
```

## No Placeholders — Plan Failures

Never write:

- "implement later"
- "Add appropriate error handling"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code)
- Steps that describe WHAT without showing HOW

## Self-Review

After writing the plan:

1. **Spec coverage:** Every spec requirement maps to a task?
2. **Placeholder scan:** Any red flags from the list above?
3. **Type consistency:** Names/signatures match across tasks?

Fix issues inline. If spec requirement has no task, add it.

## Plan File Output

Save plan to `specs/<slug>/plan.md`. Optionally extract the task checklist to `specs/<slug>/tasks.md` (one checkbox per task, no code).

After saving, emit this SPEC_REF block:

```
---
SPEC_REF: specs/<slug>
spec:     specs/<slug>/spec.md  (if exists)
plan:     specs/<slug>/plan.md
tasks:    specs/<slug>/tasks.md (if generated)
---
```

Pass this block verbatim when invoking execution skills — they will load the files automatically.

## Execution Handoff

After the plan is complete, pass the SPEC_REF block to one of:

1. **Recommended:** nexus:subagent-driven-development — parallel execution with review checkpoints
2. **Alternative:** nexus:executing-plans — sequential execution

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought                         | Reality                                            |
| ------------------------------- | -------------------------------------------------- |
| "I'll just start coding"        | Write the plan first.                              |
| "The plan is obvious"           | Document everything explicitly.                    |
| "I'll write the plan as I go"   | Complete the plan before implementation.           |
| "This is too simple for a plan" | All multi-step tasks need plans.                   |
| "I can remember the steps"      | Explicit plans prevent mistakes.                   |
| "The user knows what to do"     | The plan guides the implementation.                |
| "I'll figure it out as I code"  | Plans prevent scope creep and confusion.           |
| "The spec is clear enough"      | Specs need translation to concrete implementation. |

## Integration

**REQUIRED SUB-SKILL:** nexus:subagent-driven-development (recommended) OR nexus:executing-plans (alternative)
