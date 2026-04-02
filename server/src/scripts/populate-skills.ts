import "dotenv/config";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { upsertSkill } from "../services/skills.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = resolve(__dirname, "../../../specs/skills");

function readSkill(filename: string): string {
  return readFileSync(resolve(SKILLS_DIR, filename), "utf-8");
}

const SKILLS = [
  {
    name: "brainstorming",
    displayName: "Brainstorming",
    description:
      "Explore user intent, requirements and design through collaborative dialogue before any implementation.",
    category: "discovery",
    tags: ["discovery", "design", "planning"],
    file: "brainstorming.md",
  },
  {
    name: "spec-writing",
    displayName: "Spec Writing",
    description:
      "Structure formal specifications from approved designs — templates with guardrails, [NEEDS CLARIFICATION] markers, delta mode for brownfield.",
    category: "discovery",
    tags: ["spec", "planning", "documentation", "discovery"],
    file: "spec-writing.md",
  },
  {
    name: "grill-me",
    displayName: "Grill Me",
    description:
      "Stress-test ideas, plans, or designs by challenging assumptions, finding edge cases, and poking holes before implementation.",
    category: "discovery",
    tags: ["discovery", "design", "stress-test"],
    file: "grill-me.md",
  },
  {
    name: "writing-plans",
    displayName: "Writing Plans",
    description:
      "Decompose specs into bite-sized implementation tasks (2-5 min each) with TDD, exact file paths, and complete code.",
    category: "planning",
    tags: ["planning", "tdd", "workflow"],
    file: "writing-plans.md",
  },
  {
    name: "executing-plans",
    displayName: "Executing Plans",
    description:
      "Load a written plan, review critically, execute all tasks with verification checkpoints, stop on blockers.",
    category: "execution",
    tags: ["execution", "workflow", "tdd"],
    file: "executing-plans.md",
  },
  {
    name: "tdd-workflow",
    displayName: "Test-Driven Development (TDD)",
    description:
      "Write failing test first, implement minimal code, refactor. No exceptions.",
    category: "execution",
    tags: ["testing", "quality", "tdd", "workflow"],
    file: "tdd-workflow.md",
  },
  {
    name: "systematic-debugging",
    displayName: "Systematic Debugging",
    description:
      "Four-phase debugging: root cause investigation, pattern analysis, hypothesis testing, implementation. No fixes without root cause.",
    category: "debugging",
    tags: ["debugging", "quality", "workflow"],
    file: "systematic-debugging.md",
  },
  {
    name: "verification",
    displayName: "Verification Before Completion",
    description:
      "Evidence before claims — run verification commands and confirm output before ANY success claim. Non-negotiable.",
    category: "quality",
    tags: ["quality", "verification", "workflow"],
    file: "verification.md",
  },
  {
    name: "code-review",
    displayName: "Code Review",
    description:
      "Structured code review with spec compliance check and quality assessment.",
    category: "quality",
    tags: ["quality", "review", "workflow"],
    file: "code-review.md",
  },
  {
    name: "ui-ux-pro-max",
    displayName: "UI/UX Pro Max",
    description:
      "UI/UX design intelligence. 67 styles, 96 palettes, 57 font pairings, 25 charts, 13 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, mobile app, .html, .tsx, .vue, .svelte. Elements: button, modal, navbar, sidebar, card, table, form, chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, flat design.",
    category: "design",
    tags: [
      "ui",
      "ux",
      "design",
      "frontend",
      "css",
      "tailwind",
      "react",
      "components",
    ],
    file: "ui-ux-pro-max.md",
  },
];

async function populate() {
  console.log(`Upserting ${SKILLS.length} skills with embeddings...\n`);

  for (const skill of SKILLS) {
    const content = readSkill(skill.file);
    try {
      await upsertSkill({
        name: skill.name,
        displayName: skill.displayName,
        description: skill.description,
        content,
        category: skill.category,
        tags: skill.tags,
      });
      console.log(`✓ ${skill.name}`);
    } catch (e) {
      console.error(`✗ ${skill.name}: ${e}`);
    }
  }

  console.log("\nDone.");
  process.exit(0);
}

populate();
