# Spec Writing

Structure formal specifications from approved designs — templates with guardrails, [NEEDS CLARIFICATION] markers, delta mode for brownfield.

**Category:** discovery
**Tags:** spec, planning, documentation, discovery

---

## When to Use

- After brainstorming produced an approved design
- When adding features to existing projects (use Delta Mode)
- When requirements need formal structure before planning

## Spec Template (spec.md)

```markdown
# [Feature Name] Specification

## Purpose

[One paragraph: WHAT this does and WHY it exists. Never HOW.]

## User Stories

### US-1: [Story Name] (P1)

As a [role], I want [goal] so that [benefit].

**Acceptance Scenarios:**

- Given [context], When [action], Then [expected result]

### US-2: [Story Name] (P2)

...

## Functional Requirements

- **FR-001:** [Requirement using RFC 2119 keywords: MUST, SHOULD, MAY]
- **FR-002:** ...

## Non-Functional Requirements

- **NFR-001:** [Performance, security, scalability constraints]

## Out of Scope

- [Explicitly list what this spec does NOT cover]

## Open Questions

- [NEEDS CLARIFICATION] [Question that must be resolved before implementation]
```

## Rules

### [NEEDS CLARIFICATION] Markers

When a requirement is ambiguous, mark it explicitly:

```
- **FR-003:** User sessions [NEEDS CLARIFICATION: timeout after 30min or sliding window?]
```

**The LLM is FORBIDDEN from guessing.** If ambiguous → mark it, don't assume.
Maximum 3 open markers before requiring resolution.

### Separation: WHAT/WHY vs HOW

- Spec describes **WHAT** the system does and **WHY**
- Spec NEVER describes **HOW** (that's the plan)
- Technology choices belong in plan.md, not spec.md

### Constitution Gates (pre-implementation checks)

Before a spec is considered ready:

1. **Simplicity Gate:** Can any requirement be simplified without losing value?
2. **Anti-Abstraction Gate:** Are we designing abstractions we don't need yet?
3. **Integration-First Gate:** Can each requirement be tested end-to-end?

## Delta Mode (Brownfield)

For features in existing projects, use delta specs instead of rewriting:

```markdown
# [Feature Name] — Delta Spec

**Base:** [reference to existing spec or system description]

## ADDED Requirements

- **FR-NEW-001:** [New behavior]

## MODIFIED Requirements

- **FR-003:** [Was: X] → [Now: Y] — Reason: [why changed]

## REMOVED Requirements

- **FR-007:** [Removed because: reason]
```

After implementation, merge deltas into the main spec.

## Self-Review Checklist

- [ ] Every requirement uses MUST/SHOULD/MAY correctly
- [ ] No implementation details leaked into spec
- [ ] All [NEEDS CLARIFICATION] resolved or explicitly listed
- [ ] User stories have acceptance scenarios
- [ ] Out of Scope section exists
- [ ] Constitution gates passed

## Next Step

After spec is finalized, invoke `writing-plans` to create the detailed implementation plan.
