import { describe, it, expect } from "vitest";
import {
  generateEmbedding,
  cosineSimilarity,
} from "../../src/services/embeddings.js";

describe("generateEmbedding", () => {
  it("returns a 768-dim vector", async () => {
    const embedding = await generateEmbedding("test input");
    expect(embedding).toHaveLength(768);
    expect(typeof embedding[0]).toBe("number");
  });

  it("returns similar embeddings for similar text", async () => {
    const a = await generateEmbedding("write unit tests for the login feature");
    const b = await generateEmbedding("create tests for authentication");
    const c = await generateEmbedding("bake a chocolate cake recipe");
    const simAB = cosineSimilarity(a, b);
    const simAC = cosineSimilarity(a, c);
    expect(simAB).toBeGreaterThan(simAC);
  });
});

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1);
  });

  it("returns 0 for orthogonal vectors", () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0);
  });
});
