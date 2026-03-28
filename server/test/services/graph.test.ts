import { describe, it, expect, beforeEach } from "vitest";
import { cleanDb } from "../setup.js";
import { createSkill } from "../../src/services/skills.js";
import {
  linkSkills,
  unlinkSkills,
  getGraph,
} from "../../src/services/graph.js";

beforeEach(async () => {
  await cleanDb();
});

describe("linkSkills", () => {
  it("creates a relationship between two skills", async () => {
    await createSkill({
      name: "a",
      displayName: "A",
      description: "a",
      content: "a",
    });
    await createSkill({
      name: "b",
      displayName: "B",
      description: "b",
      content: "b",
    });
    const rel = await linkSkills("a", "b", "depends_on");
    expect(rel.relationType).toBe("depends_on");
  });

  it("throws if source skill does not exist", async () => {
    await createSkill({
      name: "b",
      displayName: "B",
      description: "b",
      content: "b",
    });
    await expect(linkSkills("nope", "b")).rejects.toThrow();
  });
});

describe("unlinkSkills", () => {
  it("removes a relationship", async () => {
    await createSkill({
      name: "a",
      displayName: "A",
      description: "a",
      content: "a",
    });
    await createSkill({
      name: "b",
      displayName: "B",
      description: "b",
      content: "b",
    });
    await linkSkills("a", "b");
    const removed = await unlinkSkills("a", "b");
    expect(removed).toBe(true);
  });

  it("returns false if relationship does not exist", async () => {
    const removed = await unlinkSkills("x", "y");
    expect(removed).toBe(false);
  });
});

describe("getGraph", () => {
  it("returns nodes and explicit edges", async () => {
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
      category: "dev",
    });
    await linkSkills("a", "b");
    const graph = await getGraph();
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges.filter((e) => e.type === "explicit")).toHaveLength(1);
  });

  it("returns tag-based edges for shared tags", async () => {
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
      tags: ["testing"],
    });
    const graph = await getGraph();
    expect(graph.edges.filter((e) => e.type === "tag")).toHaveLength(1);
  });

  it("does not create tag edges for skills already explicitly linked", async () => {
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
      tags: ["testing"],
    });
    await linkSkills("a", "b");
    const graph = await getGraph();
    const tagEdges = graph.edges.filter((e) => e.type === "tag");
    expect(tagEdges).toHaveLength(0);
  });
});
