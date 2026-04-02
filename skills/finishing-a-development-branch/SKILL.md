---
name: finishing-a-development-branch
description: Verify tests, present integration options, execute choice, clean up worktree
whenToUse: Use when implementation is complete and you need to decide how to integrate the work
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

## Overview

Verify tests, present integration options, execute choice, clean up worktree.

<HARD-GATE>
Before integrating any work, ALL tests must pass. If tests fail, return to nexus:systematic-debugging.
</HARD-GATE>

**Core principle:** Verify tests → Present options → Execute choice → Clean up

## Step 1: Verify All Tests Pass

Run the complete test suite to ensure all changes work correctly:

```bash
# Run all tests
npm test
# OR appropriate command for the project
```

Expected: All tests pass with 0 failures. If tests fail, return to nexus:systematic-debugging.

## Step 2: Determine Base Branch

Identify the branch you'll integrate your work into:

- If working on a feature: typically `develop` or `main`
- If working on a hotfix: typically `main` or `master`
- If unsure, ask the user: "Which branch should this be integrated into?"

## Step 3: Present Integration Options

Present exactly 4 options to the user:

1. **Merge locally and push to remote** — Integrate changes locally and push
2. **Push branch and create pull request** — Push work for team review
3. **Keep as-is for later** — Preserve work without integrating
4. **Discard work** — Undo all changes since beginning of work

## Step 4: Execute Chosen Option

Based on user choice, execute with these commands:

### Option 1: Merge locally and push
```bash
# Switch to base branch
git checkout <base_branch>
# Pull latest changes
git pull origin <base_branch>
# Merge feature branch
git merge <your_branch>
# Push merged changes
git push origin <base_branch>
```

### Option 2: Push branch and create PR
```bash
# Push your branch
git push origin <your_branch>
# Create pull request (user needs to do this via UI or provide token for automation)
echo "Go to repository UI to create pull request from <your_branch> to <base_branch>"
```

### Option 3: Keep as-is
```bash
# Simply inform user that work is preserved
echo "Work preserved on branch <your_branch>"
```

### Option 4: Discard work
```bash
# Switch to base branch
git checkout <base_branch>
# Delete feature branch
git branch -D <your_branch>
# Clean up if worktree was used
git worktree prune
```

## Step 5: Clean Up Worktree (if applicable)

If using git worktrees (nexus:using-git-worktrees), clean up:

```bash
# List worktrees to identify which one to remove
git worktree list
# Remove worktree (if appropriate)
git worktree remove <worktree_path>
git worktree prune
```

## Quick Reference

| Situation                    | Recommended Option |
| ---------------------------- | ------------------ |
| Feature complete, solo dev   | Option 1 (merge)   |
| Feature complete, team dev   | Option 2 (PR)      |
| Needs more work            | Option 3 (keep)    |
| Work is wrong direction    | Option 4 (discard) |

## Common Mistakes to Avoid

- Merging without running tests first
- Creating PR without pushing branch
- Forgetting to switch back to base branch
- Not cleaning up worktrees

## Integration

**REQUIRED SUB-SKILL:** nexus:using-git-worktrees (for cleanup, if applicable)