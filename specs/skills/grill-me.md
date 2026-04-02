# Grill Me

Stress-test ideas, plans, or designs by challenging assumptions, finding edge cases, and poking holes before implementation.

**Category:** discovery
**Tags:** discovery, design, stress-test

---

## Purpose

Force rigorous thinking before committing to an approach. The goal is to find problems NOW (cheap) rather than LATER (expensive).

## When to Use

- Before finalizing a design spec
- Before starting implementation of a complex feature
- When evaluating architecture decisions
- When something "feels too easy" — probably missing edge cases

## The Process

### 1. Understand the Proposal

Read the design/plan/idea completely before challenging it.

### 2. Challenge Systematically

**Assumptions:**

- What assumptions are being made? Are they validated?
- What happens if assumption X is wrong?

**Edge Cases:**

- What are the boundary conditions?
- What happens with empty input, max input, concurrent access?
- What about partial failures mid-operation?

**Scale:**

- Does this work with 10x the data? 100x?
- What's the performance profile?

**Security:**

- What are the attack surfaces?
- What happens with malicious input?

**Dependencies:**

- What external systems does this rely on?
- What happens when they're down or slow?

**Maintenance:**

- Who maintains this in 6 months?
- Is the complexity justified by the value?

### 3. Propose Alternatives

For every problem found, suggest at least one alternative approach.

### 4. Summarize

Classify findings:

- **Blockers** — must resolve before proceeding
- **Risks** — should mitigate but can proceed
- **Notes** — awareness items for later

## Key Principles

- Be adversarial but constructive
- Challenge the idea, not the person
- Every criticism comes with a suggested alternative
- YAGNI applies to criticism too — focus on real risks, not hypothetical scenarios

## Next Step

After grill-me session, return to `brainstorming` to refine the design based on findings.
