import { describe, it, expect, beforeEach } from "vitest";
import { cleanDb } from "../setup.js";
import { upsertSkill } from "../../src/services/skills.js";
import { linkSkills } from "../../src/services/graph.js";
import { resolve } from "../../src/services/resolver.js";

beforeEach(async () => {
  await cleanDb();
});

describe("resolve", () => {
  it("returns workflow chain when phase is provided", async () => {
    await upsertSkill({
      name: "brainstorming",
      displayName: "Brainstorming",
      description: "Explore ideas",
      content: "# Brainstorming",
    });
    await upsertSkill({
      name: "writing-plans",
      displayName: "Writing Plans",
      description: "Write plans",
      content: "# Plans",
    });
    await linkSkills("brainstorming", "writing-plans", "extends");

    const result = await resolve("start a new feature", "brainstorming");
    expect(result.workflow).toHaveLength(2);
    expect(result.workflow[0].phase).toBe("brainstorming");
    expect(result.workflow[0].status).toBe("current");
    expect(result.workflow[1].phase).toBe("writing-plans");
    expect(result.workflow[1].status).toBe("next");
  });

  it("returns context skills by semantic similarity", async () => {
    await upsertSkill({
      name: "finno-spec",
      displayName: "Finno Spec",
      description: "Financial app spec",
      content: "Finno is a financial planning app with budgets and goals",
      category: "spec",
      tags: ["finno"],
    });
    await upsertSkill({
      name: "tdd-workflow",
      displayName: "TDD",
      description: "Test driven development",
      content: "Write tests first then implement",
      category: "development",
    });

    const result = await resolve("implement budgeting feature in Finno");
    expect(result.context.length).toBeGreaterThan(0);
    expect(result.context[0].name).toBe("finno-spec");
  });

  it("returns empty workflow for unrelated intent without phase", async () => {
    await upsertSkill({
      name: "tdd-workflow",
      displayName: "TDD",
      description: "Test driven dev",
      content: "Write tests first",
    });

    const result = await resolve("bake a chocolate cake");
    // Workflow should be empty (no phase given)
    expect(result.workflow).toHaveLength(0);
  });
});
