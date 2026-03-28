import { describe, it, expect, beforeEach } from "vitest";
import { cleanDb } from "../setup.js";
import {
  createSkill,
  getSkill,
  listSkills,
  searchSkills,
  updateSkill,
  deleteSkill,
} from "../../src/services/skills.js";

beforeEach(async () => {
  await cleanDb();
});

describe("createSkill", () => {
  it("creates a skill and returns it", async () => {
    const skill = await createSkill({
      name: "tdd-workflow",
      displayName: "TDD Workflow",
      description: "Test-driven development process",
      content: "## Steps\n1. Write failing test\n2. Implement\n3. Refactor",
      category: "development",
      tags: ["testing", "quality"],
    });
    expect(skill.name).toBe("tdd-workflow");
    expect(skill.displayName).toBe("TDD Workflow");
    expect(skill.category).toBe("development");
    expect(skill.tags).toEqual(["testing", "quality"]);
    expect(skill.enabled).toBe(true);
    expect(skill.version).toBe(1);
  });

  it("rejects duplicate names", async () => {
    await createSkill({
      name: "dup",
      displayName: "Dup",
      description: "d",
      content: "c",
    });
    await expect(
      createSkill({
        name: "dup",
        displayName: "Dup",
        description: "d",
        content: "c",
      }),
    ).rejects.toThrow();
  });
});

describe("getSkill", () => {
  it("returns skill by name", async () => {
    await createSkill({
      name: "code-review",
      displayName: "Code Review",
      description: "Review code",
      content: "Review carefully",
    });
    const skill = await getSkill("code-review");
    expect(skill).not.toBeNull();
    expect(skill!.name).toBe("code-review");
  });

  it("returns null for non-existent skill", async () => {
    const skill = await getSkill("nope");
    expect(skill).toBeNull();
  });
});

describe("listSkills", () => {
  it("lists all skills", async () => {
    await createSkill({
      name: "a",
      displayName: "A",
      description: "a",
      content: "a",
      category: "dev",
    });
    await createSkill({
      name: "b",
      displayName: "B",
      description: "b",
      content: "b",
      category: "writing",
    });
    const all = await listSkills({});
    expect(all).toHaveLength(2);
  });

  it("filters by category", async () => {
    await createSkill({
      name: "a",
      displayName: "A",
      description: "a",
      content: "a",
      category: "dev",
    });
    await createSkill({
      name: "b",
      displayName: "B",
      description: "b",
      content: "b",
      category: "writing",
    });
    const filtered = await listSkills({ category: "dev" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("a");
  });

  it("filters by tag", async () => {
    await createSkill({
      name: "a",
      displayName: "A",
      description: "a",
      content: "a",
      tags: ["testing"],
    });
    await createSkill({
      name: "b",
      displayName: "B",
      description: "b",
      content: "b",
      tags: ["writing"],
    });
    const filtered = await listSkills({ tag: "testing" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("a");
  });
});

describe("searchSkills", () => {
  it("searches in name, description, and content", async () => {
    await createSkill({
      name: "tdd-workflow",
      displayName: "TDD Workflow",
      description: "Test-driven development",
      content: "Write failing tests first",
    });
    await createSkill({
      name: "api-design",
      displayName: "API Design",
      description: "Design REST APIs",
      content: "Use proper HTTP methods",
    });
    const results = await searchSkills("test");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("tdd-workflow");
  });
});

describe("updateSkill", () => {
  it("updates specific fields", async () => {
    await createSkill({
      name: "s",
      displayName: "S",
      description: "d",
      content: "c",
    });
    const updated = await updateSkill("s", {
      description: "new desc",
      tags: ["new"],
    });
    expect(updated!.description).toBe("new desc");
    expect(updated!.tags).toEqual(["new"]);
  });

  it("returns null for non-existent skill", async () => {
    const result = await updateSkill("nope", { description: "x" });
    expect(result).toBeNull();
  });
});

describe("deleteSkill", () => {
  it("deletes a skill", async () => {
    await createSkill({
      name: "s",
      displayName: "S",
      description: "d",
      content: "c",
    });
    const deleted = await deleteSkill("s");
    expect(deleted).toBe(true);
    const check = await getSkill("s");
    expect(check).toBeNull();
  });

  it("returns false for non-existent skill", async () => {
    const deleted = await deleteSkill("nope");
    expect(deleted).toBe(false);
  });
});
