---
name: using-git-worktrees
description: Create isolated git worktrees with smart directory selection and safety verification
whenToUse: Use when starting feature work that needs isolation from current workspace
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

## Overview

Create isolated git worktrees with smart directory selection and safety verification. This provides a clean, isolated environment for feature development without affecting the main workspace.

**Core principle:** Systematic directory selection + safety verification

## Directory Selection Process

1. **Check existing worktrees** first:
   ```bash
   git worktree list
   ```

2. **Look for CLAUDE.md** in parent directories to identify project boundaries:
   ```bash
   find . -name "CLAUDE.md" -type f
   ```

3. **Ask user** if directory is ambiguous:
   "Where would you like to create the worktree for this feature?"

## Safety Verification

For project-local worktrees, verify the directory will be safe:

1. **Check .gitignore** to ensure work won't be accidentally committed
2. **Verify it's outside main development area** to prevent conflicts
3. **Confirm adequate disk space** for the duplicated repository

## Creation Steps

### Step 1: Detect Project Name
```bash
# Get current branch name for worktree directory
CURRENT_BRANCH=$(git branch --show-current)
PROJECT_NAME=$(basename $(pwd))
WORKTREE_NAME="${PROJECT_NAME}-${CURRENT_BRANCH}"
```

### Step 2: Create Worktree
```bash
# Create worktree in appropriate location
git worktree add ../${WORKTREE_NAME} ${CURRENT_BRANCH}
```

### Step 3: Run Setup
```bash
cd ../${WORKTREE_NAME}
# Run any necessary setup commands (install dependencies, etc.)
npm install  # or appropriate setup command
```

### Step 4: Verify Clean Baseline
```bash
# Verify worktree is clean and ready
git status
# Should show no uncommitted changes
```

### Step 5: Report Location
```bash
pwd  # Report the worktree location to the user
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `git worktree list` | See all active worktrees |
| `git worktree add <path> <branch>` | Create new worktree |
| `git worktree remove <path>` | Remove worktree |
| `git worktree prune` | Clean up dead worktree references |

## Common Mistakes to Avoid

- Creating worktrees in inappropriate locations
- Forgetting to run setup commands in the new worktree
- Not verifying the worktree is clean before starting work
- Creating worktrees on the wrong branch
- Not cleaning up worktrees when finished

## Example Workflow

1. "I want to work on feature-x safely"
2. Use this skill to create isolated worktree
3. Work on feature-x without affecting main workspace
4. When done, merge back and remove worktree

## Integration

Works well with:
- **nexus:brainstorming** — Explore ideas in isolated environment
- **nexus:subagent-driven-development** — Safe parallel development
- **nexus:executing-plans** — Isolated plan execution
- **nexus:finishing-a-development-branch** — Clean merge and cleanup

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought                                | Reality                                              |
| -------------------------------------- | ---------------------------------------------------- |
| "I'll just work in the main branch"    | Isolate work to prevent conflicts.                   |
| "Worktrees are too complex"            | They provide essential isolation for safe development. |
| "I don't need isolation"               | Isolation prevents unintended changes to main code.  |
| "This is just a small change"          | All changes benefit from isolation.                  |
| "I'll remember what I changed"         | Worktrees provide clean separation and history.      |
| "It takes too long to set up"          | Setup time is worth the safety and isolation.        |