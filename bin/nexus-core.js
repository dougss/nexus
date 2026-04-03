// Nexus MCP — shared core logic
// Imported by both nexus-mcp (stdio) and nexus-mcp-http (HTTP/SSE)

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
export const SKILLS_DIR = join(ROOT, "skills");

// --- Frontmatter parser ---

export function parseFrontmatter(content) {
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines[0].trim() !== "---") return { frontmatter: {}, body: content };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { frontmatter: {}, body: content };
  const fm = {};
  for (let i = 1; i < end; i++) {
    const match = lines[i].match(/^(\w[\w-]*):\s*(.+)$/);
    if (match) fm[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return { frontmatter: fm, body: lines.slice(end + 1).join("\n") };
}

// --- Skill discovery ---

export function listSkills() {
  if (!existsSync(SKILLS_DIR)) return [];
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .flatMap((e) => {
      const skillFile = join(SKILLS_DIR, e.name, "SKILL.md");
      if (!existsSync(skillFile)) return [];
      const { frontmatter } = parseFrontmatter(
        readFileSync(skillFile, "utf-8"),
      );
      return [
        {
          name: frontmatter.name || e.name,
          description: frontmatter.description || "",
          whenToUse: frontmatter.whenToUse || "",
        },
      ];
    });
}

export function getSkill(name) {
  const skillFile = resolve(SKILLS_DIR, name, "SKILL.md");
  if (!skillFile.startsWith(SKILLS_DIR + "/")) return null; // path traversal guard
  if (!existsSync(skillFile)) return null;
  return readFileSync(skillFile, "utf-8");
}

// --- MCP tool definitions ---

export const TOOLS = [
  {
    name: "nexus_list",
    description:
      "List all available Nexus workflow skills with name, description, and whenToUse trigger. " +
      "Call this at the start of any task to discover which skills are relevant. " +
      "Each skill has an activation trigger in whenToUse — match it against your current task.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "nexus_get",
    description:
      "Get the full content of a Nexus skill by name. Returns the complete SKILL.md with " +
      "instructions, enforcement patterns (Iron Laws, HARD-GATEs, Red Flags), and workflow chains " +
      "to sub-skills. Follow the skill instructions exactly.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "Skill directory name, e.g. 'brainstorming', 'test-driven-development', 'systematic-debugging'",
        },
      },
      required: ["name"],
    },
  },
];

// --- JSON-RPC 2.0 helpers ---

export function respond(id, result) {
  return { jsonrpc: "2.0", id, result };
}

export function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

// --- Request handler ---

export function handle(req) {
  const { id, method, params } = req;

  if (method === "initialize") {
    return respond(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "nexus", version: "2.0.0" },
    });
  }

  if (method === "notifications/initialized") {
    if (id !== undefined)
      return rpcError(
        id,
        -32600,
        "notifications/initialized must be a notification (no id)",
      );
    return null;
  }

  if (method === "ping") return respond(id, {});

  if (method === "tools/list") {
    return respond(id, { tools: TOOLS });
  }

  if (method === "tools/call") {
    const { name, arguments: args = {} } = params ?? {};
    if (!name)
      return rpcError(
        id,
        -32602,
        "Missing required parameter: name (tool name)",
      );

    if (name === "nexus_list") {
      const skills = listSkills();
      return respond(id, {
        content: [{ type: "text", text: JSON.stringify(skills, null, 2) }],
      });
    }

    if (name === "nexus_get") {
      const skillName = args.name;
      if (!skillName) {
        return respond(id, {
          content: [{ type: "text", text: "Missing required parameter: name" }],
          isError: true,
        });
      }
      const content = getSkill(skillName);
      if (!content) {
        const available = listSkills()
          .map((s) => s.name)
          .join(", ");
        return respond(id, {
          content: [
            {
              type: "text",
              text: `Skill '${skillName}' not found. Available: ${available}`,
            },
          ],
          isError: true,
        });
      }
      return respond(id, {
        content: [{ type: "text", text: content }],
      });
    }

    return rpcError(id, -32601, `Unknown tool: ${name}`);
  }

  if (id !== undefined)
    return rpcError(id, -32601, `Method not found: ${method}`);
  return null;
}
