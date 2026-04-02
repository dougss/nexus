---
name: brainstorming
description: Explore intent, requirements and design through collaborative dialogue before implementation
whenToUse: Use when doing creative work — features, components, modifications, or behavior changes
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every project goes through this process. A todo list, a single-function utility, a config change — all of them. The design can be short, but you MUST present it and get approval.

## Checklist

1. **Explore project context** — check files, docs, recent commits
2. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
3. **Propose 2-3 approaches** — with trade-offs and your recommendation
4. **Present design** — in sections scaled to their complexity, get user approval after each section
5. **Write design doc** — save to `docs/specs/YYYY-MM-DD-<topic>-design.md` and commit
6. **Spec self-review** — check for placeholders, contradictions, ambiguity, scope
7. **User reviews written spec** — ask user to review the spec file before proceeding

## The Process

### Understanding the idea

- Check current project state first (files, docs, recent commits)
- If project is too large for a single spec, decompose into sub-projects first
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible
- Focus on: purpose, constraints, success criteria

### Exploring approaches

- Propose 2-3 different approaches with trade-offs
- Lead with your recommended option and explain why

### Presenting the design

- Scale each section to its complexity
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing

### Working in existing codebases

- Explore current structure before proposing changes
- Follow existing patterns
- Don't propose unrelated refactoring

## Stress-Testing the Design

Before finalizing the design, consider potential issues:

- What assumptions are being made? Are they validated?
- What happens if assumptions prove wrong?
- What are the boundary conditions and edge cases?
- What happens with empty input, maximum input, concurrent access?
- What about partial failures mid-operation?
- Does this work with 10x the data? What's the performance profile?
- What are the attack surfaces? What happens with malicious input?
- What external systems does this rely on? What happens when they're down?

## Spec Writing Integration

When writing the design document, use the following template:

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

### Guardrails for Specifications

- Every requirement uses MUST/SHOULD/MAY correctly
- No implementation details leak into spec
- All [NEEDS CLARIFICATION] markers are resolved or explicitly listed
- User stories have acceptance scenarios
- Out of Scope section exists
- Simplicity Gate: Can any requirement be simplified without losing value?
- Anti-Abstraction Gate: Are we designing abstractions we don't need yet?
- Integration-First Gate: Can each requirement be tested end-to-end?

## Spec Self-Review

1. **Placeholder scan:** Any incomplete sections? Fix them.
2. **Internal consistency:** Do sections contradict each other?
3. **Scope check:** Focused enough for a single implementation plan?
4. **Ambiguity check:** Could any requirement be interpreted two ways? Pick one and make it explicit.

## User Review Gate

After writing the spec, ask the user to review it before proceeding:

"Please review the spec at `docs/specs/YYYY-MM-DD-<topic>-design.md` and let me know if you approve the approach before I proceed with implementation planning."

## Key Principles

- **One question at a time** — Don't overwhelm
- **Multiple choice preferred** — Easier to answer
- **YAGNI ruthlessly** — Remove unnecessary features
- **Explore alternatives** — Always 2-3 approaches
- **Incremental validation** — Present, get approval, move on

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought                            | Reality                                               |
| ---------------------------------- | ----------------------------------------------------- |
| "This is just a simple change"     | All projects need design. Check first.                |
| "I can implement quickly"          | Implementing without design leads to problems.        |
| "I know exactly what to do"        | Present design to user before proceeding.             |
| "I'll just make a small change"    | All changes need design review.                       |
| "This doesn't need a spec"         | Specs prevent costly mistakes.                        |
| "I'll write the design later"      | Design comes before implementation.                   |
| "This is just a refactor"          | Refactors still need design consideration.            |
| "The user knows what they want"    | Clarify details through the design process.           |

## Integration

**The terminal state is invoking nexus:writing-plans.** Do NOT invoke any other implementation skill.

**REQUIRED SUB-SKILL:** nexus:writing-plans (to create implementation plan after design approval)