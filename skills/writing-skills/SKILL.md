---
name: writing-skills
description: Meta-skill for creating, testing, and deploying new Nexus skills using TDD for documentation
whenToUse: Use when creating new skills, editing existing skills, or verifying skills work
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

## Overview

Writing skills IS TDD applied to process documentation. This is a meta-skill for creating, testing, and deploying new Nexus skills using Test-Driven Development principles applied to documentation and processes.

**Core principle:** If you didn't test the skill concept first, you don't know if it addresses the right problem.

## Required Background

Before writing skills, you must understand nexus:test-driven-development as the methodology is adapted for documentation.

## What Are Skills?

Skills are reusable techniques, patterns, and tools that:

- Address recurring challenges systematically
- Provide clear, actionable guidance
- Include enforcement mechanisms to ensure compliance
- Chain together to form complete workflows
- Are discoverable and accessible when needed

## When to Create Skills vs When Not To

**CREATE skills when:**

- A pattern repeats across multiple contexts
- A process consistently trips people up
- A technique solves a significant class of problems
- You find yourself giving the same advice repeatedly
- There's a systematic approach that helps with compliance

**DON'T create skills when:**

- It's a one-off situation
- The solution is obvious to anyone with basic experience
- The context is too specific or unique
- The skill would be shorter than the overhead of creating it
- It duplicates existing skills

## Skill Types

### Technique Skills

- Specific methods for accomplishing tasks
- Example: "test-driven-development", "systematic-debugging"

### Pattern Skills

- General approaches that apply across domains
- Example: "brainstorming", "verification"

### Reference Skills

- Curated collections of information
- Example: "ui-ux-pro-max"

## SKILL.md Structure

All skills follow this structure with required frontmatter:

```yaml
---
name: skill-name
description: Human-readable description
whenToUse: Use when [activation trigger — max 250 chars]
---
```

Content sections:

- Overview with core principle
- Required enforcement mechanisms (HARD-GATE, Iron Law, or Red Flags)
- Process steps or methodology
- Integration with other skills
- Red Flags table

## Claude Search Optimization (CSO)

Structure skills for optimal retrieval:

- Use terminology users will search for
- Include variations of key terms
- Front-load important concepts
- Use headers and formatting for scanning

## The Iron Law

<IRON-LAW>
NO SKILL WITHOUT A FAILING TEST FIRST
</IRON-LAW>

Before writing a skill, create a test case that demonstrates the problem the skill solves. This ensures you're solving the right problem with the right approach.

## Testing Approaches for Different Skill Types

### Technique Skills

- Create pressure scenarios that challenge the technique
- Test edge cases and failure conditions
- Verify the technique actually solves the problem

### Pattern Skills

- Test with different domains and contexts
- Verify the pattern is generalizable
- Check that it provides meaningful guidance

### Reference Skills

- Test that information is accurate and up-to-date
- Verify the organization makes sense for retrieval
- Confirm completeness of the reference material

## Common Rationalizations and Bulletproofing

| Rationalization                          | Reality                                       |
| ---------------------------------------- | --------------------------------------------- |
| "This is too simple for a skill"         | Simple things often need skills most.         |
| "Users will figure it out"               | If they could figure it out, no skill needed. |
| "I don't have time to write it properly" | Time spent now saves time later.              |
| "Someone else should write this skill"   | If you see the need, you're the right person. |

## RED-GREEN-REFACTOR Cycle for Skills

### RED: Define the Problem

- Create a test scenario that demonstrates the problem
- Articulate the specific challenge users face
- Verify the problem is significant enough for a skill

### GREEN: Create the Skill

- Write the skill following the standard structure
- Include at least one enforcement mechanism
- Link to relevant other skills
- Ensure it solves the defined problem

### REFACTOR: Improve Based on Use

- Gather feedback from actual usage
- Refine language and structure
- Add missing elements or clarify confusing parts
- Update connections to other skills

## Anti-Patterns

- Writing skills for problems that don't exist
- Creating overly specific skills that don't generalize
- Writing skills without enforcement mechanisms
- Creating skills that conflict with each other
- Not testing skills before deployment

## Skill Creation Checklist

- [ ] Problem clearly defined with test scenario
- [ ] Skill name follows convention (lowercase, hyphens)
- [ ] Description is clear and concise
- [ ] whenToUse starts with "Use when" and is under 250 chars
- [ ] At least one enforcement mechanism included
- [ ] Proper integration with other skills documented
- [ ] Red Flags table with 3+ rationalizations
- [ ] Skill type properly identified
- [ ] Frontmatter format is correct

## Nexus-Specific Updates

After creating a skill:

1. Update `skills/using-nexus/SKILL.md` to add the new skill to the "Available Skills" list
2. Run `./bin/nexus validate` to verify the new skill passes all checks
3. Test that the skill integrates properly with the system

## Integration

This is a meta-skill that enables the creation of all other skills in the system.
