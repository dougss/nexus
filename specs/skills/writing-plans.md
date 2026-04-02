# Writing Plans

Decompose specs into bite-sized implementation tasks (2-5 min each) with TDD, exact file paths, and complete code.

**Category:** planning
**Tags:** planning, tdd, workflow

---

Write comprehensive implementation plans assuming the engineer has zero context. Document everything: which files to touch, code, testing, docs. Give the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

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
**Spec:** [Link to spec document]
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

- "TBD", "TODO", "implement later"
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

## Next Step

After plan is complete, invoke `executing-plans` for sequential execution or use subagent-driven development for parallel execution.
