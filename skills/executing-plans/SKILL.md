---
name: executing-plans
description: Execute implementation plans task-by-task with verification checkpoints
whenToUse: Use when you have a written implementation plan to execute
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

## Overview

Load a written plan, review critically, execute all tasks with verification checkpoints, stop on blockers.

## The Process

### Step 1: Load and Review Plan

1. Read plan file
2. Review critically — identify questions or concerns
3. If concerns: raise with user before starting
4. If no concerns: create task list and proceed

### Step 2: Execute Tasks

For each task:

1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Commit after each task passes
5. Mark as completed

**Between tasks:**

- Verify previous work still passes
- Check if next task assumptions still hold
- If something changed, update remaining tasks

### Step 3: Complete Development

After all tasks complete and verified:

- Run full test suite
- Verify all requirements met against spec
- Present options: merge, PR, or cleanup

## Checkpoint Reviews

After every 3 tasks (or after complex tasks):

1. Run full test suite
2. Review cumulative changes against spec
3. Report progress to user
4. Ask if any direction changes needed

## When to Stop and Ask for Help

**STOP immediately when:**

- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps
- You don't understand an instruction
- Verification fails repeatedly (3+ times on same task)

**Ask for clarification rather than guessing.**

## Rules

- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Stop when blocked, don't guess
- Never start on main/master without explicit consent
- Don't "improve" beyond the plan — execute what's written

## REQUIRED SUB-SKILLS

**REQUIRED SUB-SKILL:** nexus:test-driven-development (inside each task that writes code)
**REQUIRED SUB-SKILL:** nexus:verification-before-completion (before declaring done)

## Iron Law

<FORCEFUL>
FOLLOW THE PLAN EXACTLY. If the plan is wrong, update the plan first, then execute.
</FORCEFUL>

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought                               | Reality                                             |
| ------------------------------------- | --------------------------------------------------- |
| "I can improve this step"             | Execute the plan as written.                        |
| "This step seems unnecessary"         | Follow the plan exactly.                            |
| "I know a better way"                 | Stick to the plan.                                  |
| "I'll come back to this later"        | Complete tasks in order.                            |
| "I'll just make a quick fix"          | Follow the plan steps exactly.                      |
| "The plan is outdated"                | Update the plan before changing course.             |
| "This will only take a minute"        | Stay within the planned approach.                   |
| "I'll optimize while implementing"    | Execute the plan as specified.                      |

## Integration

After all tasks complete, invoke nexus:verification-before-completion to confirm everything works, then nexus:requesting-code-review for final review.