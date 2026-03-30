import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolve } from "../services/resolver.js";
import { upsertSkill } from "../services/skills.js";

export function registerTools(server: McpServer) {
  server.registerTool(
    "nexus",
    {
      description:
        "REQUIRED: Call this before starting ANY task — implementation, debugging, planning, design, review, or exploration. Describe what you want to do and optionally which phase you're in. Returns the complete workflow to follow, project context, and related skills. This is your source of truth for how to work.",
      inputSchema: {
        intent: z
          .string()
          .describe(
            "What you want to do — describe the task, feature, bug, or goal",
          ),
        phase: z
          .string()
          .optional()
          .describe(
            "Current workflow phase if known (e.g. brainstorming, executing-plans, debugging)",
          ),
      },
    },
    async ({ intent, phase }) => {
      const result = await resolve(intent, phase);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "nexus_save",
    {
      description:
        "Save a skill, spec, plan, decision, or any knowledge artifact to Nexus. Use after completing work to persist learnings. Automatically generates embeddings for future semantic search. Upserts — creates if new, updates if exists.",
      inputSchema: {
        name: z.string().describe("Skill slug (e.g. tdd-workflow)"),
        displayName: z.string().describe("Human-readable name"),
        description: z.string().describe("One-line description"),
        content: z.string().describe("Markdown body with instructions"),
        category: z
          .string()
          .optional()
          .describe("Category (e.g. development, spec, planning)"),
        tags: z
          .array(z.string())
          .optional()
          .describe("Tags for categorization"),
        model: z.string().optional().describe("Preferred model"),
      },
    },
    async (input) => {
      const skill = await upsertSkill({
        name: input.name,
        displayName: input.displayName,
        description: input.description,
        content: input.content,
        category: input.category,
        tags: input.tags,
        model: input.model,
      });
      return {
        content: [
          {
            type: "text",
            text: `Saved skill: ${skill.name} (${skill.id})${skill.embedding ? " [embedding generated]" : " [no embedding]"}`,
          },
        ],
      };
    },
  );
}
