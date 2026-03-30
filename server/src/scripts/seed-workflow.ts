/**
 * Seed script: insert 5 workflow skills and wire extends chain
 * brainstorming → writing-plans → executing-plans → verification → finishing
 */
import "dotenv/config";
import { upsertSkill } from "../services/skills.js";
import { linkSkills } from "../services/graph.js";

const WORKFLOW_SKILLS = [
  {
    name: "brainstorming",
    displayName: "Brainstorming",
    description:
      "Explore intent, requirements, and design options before implementation",
    category: "discovery",
    tags: ["workflow", "planning"],
    content: `# Brainstorming

Use before any creative or implementation work. Explore user intent, requirements, and design options.

## Steps
1. Understand the goal — ask clarifying questions if needed
2. List 2-3 approaches with trade-offs
3. Identify constraints (time, stack, existing patterns)
4. Choose approach and document rationale

## Output
- Chosen approach with rationale
- Key constraints noted
- Ready to write a plan
`,
  },
  {
    name: "writing-plans",
    displayName: "Writing Plans",
    description: "Create a detailed implementation plan from requirements",
    category: "planning",
    tags: ["workflow", "planning"],
    content: `# Writing Plans

Use after brainstorming. Produce a clear, phased implementation plan.

## Steps
1. Break work into phases (each independently verifiable)
2. List tasks per phase with acceptance criteria
3. Identify dependencies between tasks
4. Estimate complexity per phase

## Output
- Phased plan with tasks
- Acceptance criteria per phase
- Dependency map
`,
  },
  {
    name: "executing-plans",
    displayName: "Executing Plans",
    description: "Execute an implementation plan with review checkpoints",
    category: "execution",
    tags: ["workflow", "development"],
    content: `# Executing Plans

Use when you have a written plan. Execute phase by phase with verification at each checkpoint.

## Steps
1. Implement one phase at a time
2. Verify after each phase (run tests, check output)
3. Document decisions made during implementation
4. Flag blockers immediately

## Rules
- Never skip verification between phases
- Commit after each working phase
- Write tests before implementation (TDD)
`,
  },
  {
    name: "verification-before-completion",
    displayName: "Verification Before Completion",
    description:
      "Verify all work passes before claiming completion or creating PRs",
    category: "quality",
    tags: ["workflow", "quality"],
    content: `# Verification Before Completion

REQUIRED before claiming work is done, fixed, or passing.

## Checklist
- [ ] All tests pass (run the test suite)
- [ ] TypeScript compiles without errors
- [ ] Linting passes
- [ ] Manual smoke test of primary user flow
- [ ] No console.error in output

## Evidence Required
Show actual command output — never claim tests pass without running them.
`,
  },
  {
    name: "finishing-a-development-branch",
    displayName: "Finishing a Development Branch",
    description:
      "Complete development work by deciding how to integrate: merge, PR, or cleanup",
    category: "quality",
    tags: ["workflow", "git"],
    content: `# Finishing a Development Branch

Use after verification passes. Decide how to integrate the work.

## Options
1. **Merge to main** — small fix, no review needed
2. **Open PR** — feature work, requires review
3. **Cleanup + squash** — experimental branch, consolidate commits

## Steps
1. Run full verification one more time
2. Write meaningful commit message (why, not what)
3. Choose integration option above
4. Update documentation if needed
`,
  },
];

// Chain: brainstorming → writing-plans → executing-plans → verification → finishing
const EXTENDS_CHAIN = [
  ["brainstorming", "writing-plans"],
  ["writing-plans", "executing-plans"],
  ["executing-plans", "verification-before-completion"],
  ["verification-before-completion", "finishing-a-development-branch"],
];

async function main() {
  console.log("Seeding workflow skills...");
  for (const skill of WORKFLOW_SKILLS) {
    const result = await upsertSkill(skill);
    console.log(
      `  ✓ ${result.name} (embedding: ${result.embedding ? "yes" : "no"})`,
    );
  }

  console.log("\nWiring extends chain...");
  for (const [source, target] of EXTENDS_CHAIN) {
    try {
      await linkSkills(source, target, "extends");
      console.log(`  ✓ ${source} → ${target}`);
    } catch (e: any) {
      if (e.message?.includes("duplicate") || e.code === "23505") {
        console.log(`  ~ ${source} → ${target} (already linked)`);
      } else {
        throw e;
      }
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
