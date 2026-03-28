import { FastifyInstance } from "fastify";
import {
  createSkill,
  getSkill,
  listSkills,
  searchSkills,
  updateSkill,
  deleteSkill,
} from "../services/skills.js";
import { linkSkills, unlinkSkills, getGraph } from "../services/graph.js";

export async function apiRoutes(app: FastifyInstance) {
  app.get("/api/skills", async (req) => {
    const { category, tag, search } = req.query as Record<
      string,
      string | undefined
    >;
    if (search) return searchSkills(search);
    return listSkills({ category, tag });
  });

  app.get("/api/skills/:name", async (req, reply) => {
    const { name } = req.params as { name: string };
    const skill = await getSkill(name);
    if (!skill) return reply.status(404).send({ error: "Skill not found" });
    return skill;
  });

  app.post("/api/skills", async (req, reply) => {
    const body = req.body as {
      name: string;
      displayName: string;
      description: string;
      content: string;
      category?: string;
      tags?: string[];
      model?: string;
      inputSchema?: unknown;
    };
    const skill = await createSkill(body);
    return reply.status(201).send(skill);
  });

  app.put("/api/skills/:name", async (req, reply) => {
    const { name } = req.params as { name: string };
    const body = req.body as Record<string, unknown>;
    const skill = await updateSkill(name, body);
    if (!skill) return reply.status(404).send({ error: "Skill not found" });
    return skill;
  });

  app.delete("/api/skills/:name", async (req, reply) => {
    const { name } = req.params as { name: string };
    const deleted = await deleteSkill(name);
    if (!deleted) return reply.status(404).send({ error: "Skill not found" });
    return { ok: true };
  });

  app.get("/api/graph", async () => {
    return getGraph();
  });

  app.post("/api/relations", async (req, reply) => {
    const { source, target, type } = req.body as {
      source: string;
      target: string;
      type?: string;
    };
    const rel = await linkSkills(source, target, type);
    return reply.status(201).send(rel);
  });

  app.delete("/api/relations/:id", async (req, reply) => {
    const { source, target } = req.query as { source: string; target: string };
    const removed = await unlinkSkills(source, target);
    if (!removed)
      return reply.status(404).send({ error: "Relation not found" });
    return { ok: true };
  });

  app.get("/api/categories", async () => {
    const all = await listSkills({});
    const categories = [
      ...new Set(all.map((s) => s.category).filter(Boolean)),
    ].sort();
    return categories;
  });

  app.get("/api/tags", async () => {
    const all = await listSkills({});
    const tags = [...new Set(all.flatMap((s) => s.tags ?? []))].sort();
    return tags;
  });
}
