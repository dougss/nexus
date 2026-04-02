# Test-Driven Development (TDD)

Write failing test first, implement minimal code, refactor. No exceptions.

**Category:** execution
**Tags:** testing, quality, tdd, workflow

---

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over. No exceptions.

## Red-Green-Refactor Cycle

### RED — Write Failing Test

- One behavior per test
- Clear name describing behavior
- Real code (no mocks unless unavoidable)

### Verify RED — Watch It Fail (MANDATORY)

- Test fails (not errors)
- Failure message is expected
- Fails because feature missing (not typos)

### GREEN — Minimal Code

- Simplest code to pass the test
- Don't add features, don't "improve" beyond the test
- YAGNI ruthlessly

### Verify GREEN — Watch It Pass (MANDATORY)

- Test passes
- Other tests still pass
- Output pristine (no errors, warnings)

### REFACTOR — Clean Up

- After green only
- Remove duplication, improve names, extract helpers
- Keep tests green. Don't add behavior.

## Common Rationalizations

| Excuse                    | Reality                                       |
| ------------------------- | --------------------------------------------- |
| "Too simple to test"      | Simple code breaks. Test takes 30 seconds.    |
| "I'll test after"         | Tests passing immediately prove nothing.      |
| "Need to explore first"   | Fine. Throw away exploration, start with TDD. |
| "TDD will slow me down"   | TDD faster than debugging.                    |
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |

## Red Flags — STOP and Start Over

- Code before test
- Test passes immediately
- Can't explain why test failed
- Rationalizing "just this once"

**All of these mean: Delete code. Start over with TDD.**

## Verification Checklist

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered
