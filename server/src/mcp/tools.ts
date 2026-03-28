import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  createSkill,
  getSkill,
  listSkills,
  searchSkills,
  updateSkill,
  deleteSkill,
} from "../services/skills.js";
import { linkSkills, unlinkSkills, getGraph } from "../services/graph.js";

export function registerTools(server: McpServer) {
  server.registerTool(
    "list_skills",
    {
      description: "List all skills with optional filters by category or tag",
      inputSchema: {
        category: z.string().optional().describe("Filter by category"),
        tag: z.string().optional().describe("Filter by tag"),
      },
    },
    async ({ category, tag }) => {
      const results = await listSkills({ category, tag });
      const summary = results.map((s) => ({
        name: s.name,
        displayName: s.displayName,
        description: s.description,
        category: s.category,
        tags: s.tags,
        enabled: s.enabled,
      }));
      return {
        content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get_skill",
    {
      description: "Get the full content of a skill by name",
      inputSchema: {
        name: z.string().describe("Skill name (slug)"),
      },
    },
    async ({ name }) => {
      const skill = await getSkill(name);
      if (!skill) {
        return {
          content: [{ type: "text", text: `Skill not found: ${name}` }],
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(skill, null, 2) }],
      };
    },
  );

  server.registerTool(
    "search_skills",
    {
      description:
        "Search skills by text query (matches name, description, and content)",
      inputSchema: {
        query: z.string().describe("Search query"),
      },
    },
    async ({ query }) => {
      const results = await searchSkills(query);
      const summary = results.map((s) => ({
        name: s.name,
        displayName: s.displayName,
        description: s.description,
        category: s.category,
        tags: s.tags,
      }));
      return {
        content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      };
    },
  );

  server.registerTool(
    "create_skill",
    {
      description: "Create a new skill in the registry",
      inputSchema: {
        name: z.string().describe("Skill slug (e.g. tdd-workflow)"),
        displayName: z.string().describe("Human-readable name"),
        description: z.string().describe("One-line description"),
        content: z.string().describe("Markdown body with instructions"),
        category: z
          .string()
          .optional()
          .describe("Category (e.g. development, writing)"),
        tags: z
          .array(z.string())
          .optional()
          .describe("Tags for categorization"),
        model: z.string().optional().describe("Preferred model"),
        inputSchema: z
          .any()
          .optional()
          .describe("JSON Schema for skill inputs"),
      },
    },
    async (input) => {
      const skill = await createSkill({
        name: input.name,
        displayName: input.displayName,
        description: input.description,
        content: input.content,
        category: input.category,
        tags: input.tags,
        model: input.model,
        inputSchema: input.inputSchema,
      });
      return {
        content: [
          { type: "text", text: `Created skill: ${skill.name} (${skill.id})` },
        ],
      };
    },
  );

  server.registerTool(
    "update_skill",
    {
      description: "Update an existing skill",
      inputSchema: {
        name: z.string().describe("Skill name to update"),
        displayName: z.string().optional().describe("New display name"),
        description: z.string().optional().describe("New description"),
        content: z.string().optional().describe("New Markdown content"),
        category: z.string().optional().describe("New category"),
        tags: z.array(z.string()).optional().describe("New tags"),
        model: z.string().optional().describe("New model"),
      },
    },
    async ({ name, ...updates }) => {
      const skill = await updateSkill(name, updates);
      if (!skill) {
        return {
          content: [{ type: "text", text: `Skill not found: ${name}` }],
        };
      }
      return {
        content: [{ type: "text", text: `Updated skill: ${skill.name}` }],
      };
    },
  );

  server.registerTool(
    "delete_skill",
    {
      description: "Delete a skill from the registry",
      inputSchema: {
        name: z.string().describe("Skill name to delete"),
      },
    },
    async ({ name }) => {
      const deleted = await deleteSkill(name);
      return {
        content: [
          {
            type: "text",
            text: deleted
              ? `Deleted skill: ${name}`
              : `Skill not found: ${name}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "link_skills",
    {
      description: "Create a relationship between two skills",
      inputSchema: {
        source: z.string().describe("Source skill name"),
        target: z.string().describe("Target skill name"),
        type: z
          .enum(["related", "depends_on", "extends"])
          .optional()
          .default("related")
          .describe("Relationship type"),
      },
    },
    async ({ source, target, type }) => {
      const rel = await linkSkills(source, target, type);
      return {
        content: [
          {
            type: "text",
            text: `Linked ${source} → ${target} (${rel.relationType})`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "unlink_skills",
    {
      description: "Remove a relationship between two skills",
      inputSchema: {
        source: z.string().describe("Source skill name"),
        target: z.string().describe("Target skill name"),
      },
    },
    async ({ source, target }) => {
      const removed = await unlinkSkills(source, target);
      return {
        content: [
          {
            type: "text",
            text: removed
              ? `Unlinked ${source} → ${target}`
              : "Relationship not found",
          },
        ],
      };
    },
  );
}
