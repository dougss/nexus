# Nexus Skill Router — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 8 generic MCP tools with 2 intelligent tools (`nexus` + `nexus_save`) powered by pgvector semantic search and workflow graph traversal.

**Architecture:** Add embedding column to skills table, create Ollama embedding service, build resolver that combines semantic search + graph traversal, rewrite MCP tools. HTTP API and dashboard unchanged.

**Tech Stack:** Node.js 22, TypeScript, Drizzle ORM, pgvector, Ollama (nomic-embed-text, 768 dims), @modelcontextprotocol/sdk, Fastify.

**Spec:** `docs/superpowers/specs/2026-03-30-nexus-skill-router-design.md`

---

## File Structure

```
server/
├── src/
│   ├── db/
│   │   ├── schema.ts          # MODIFY: add embedding column (custom SQL type)
│   │   └── client.ts          # No change
│   ├── services/
│   │   ├── skills.ts          # MODIFY: add upsertSkill() with embedding
│   │   ├── graph.ts           # MODIFY: add traverseExtends()
│   │   ├── embeddings.ts      # NEW: Ollama API client for embeddings
│   │   └── resolver.ts        # NEW: nexus() logic — embeddings + graph
│   ├── mcp/
│   │   └── tools.ts           # REWRITE: 8 tools → 2 (nexus + nexus_save)
│   ├── routes/
│   │   └── api.ts             # No change
│   ├── http.ts                # No change
│   └── mcp-stdio.ts           # No change
├── drizzle/                   # New migration
└── test/
    └── services/
        ├── embeddings.test.ts # NEW
        ├── resolver.test.ts   # NEW
        ├── skills.test.ts     # No change
        └── graph.test.ts      # MODIFY: add traverseExtends tests
```

---

## Task 1: Setup — Ollama Model + pgvector Extension + Migration

**Files:**

- Modify: `server/src/db/schema.ts`

- [ ] **Step 1: Pull nomic-embed-text model**

```bash
ollama pull nomic-embed-text
```

Expected: model downloaded (~274MB).

- [ ] **Step 2: Verify model works**

```bash
curl -s http://localhost:11434/api/embed -d '{"model":"nomic-embed-text","input":"test"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'dims: {len(d[\"embeddings\"][0])}')"
```

Expected: `dims: 768`

- [ ] **Step 3: Enable pgvector extension on nexus database**

```bash
docker exec postgres psql -U admin -d nexus -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Expected: `CREATE EXTENSION`

- [ ] **Step 4: Add embedding column and index**

```bash
docker exec postgres psql -U nexus -d nexus -c "
ALTER TABLE skills ADD COLUMN IF NOT EXISTS embedding vector(768);
CREATE INDEX IF NOT EXISTS skills_embedding_idx ON skills USING hnsw (embedding vector_cosine_ops);
"
```

Expected: `ALTER TABLE` + `CREATE INDEX`

- [ ] **Step 5: Update Drizzle schema**

Modify `server/src/db/schema.ts` — add the embedding column. Since Drizzle doesn't have a native `vector` type, use `customType`:

```typescript
import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  customType,
} from "drizzle-orm/pg-core";

const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() {
    return "vector(768)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  tags: text("tags").array().default([]),
  content: text("content").notNull(),
  inputSchema: jsonb("input_schema"),
  model: text("model"),
  enabled: boolean("enabled").notNull().default(true),
  version: integer("version").notNull().default(1),
  embedding: vector("embedding"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const skillRelations = pgTable(
  "skill_relations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    targetId: uuid("target_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    relationType: text("relation_type").notNull().default("related"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("skill_relations_source_target_idx").on(
      table.sourceId,
      table.targetId,
    ),
  ],
);
```

- [ ] **Step 6: Verify schema compiles**

```bash
cd ~/server/apps/nexus/server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd ~/server/apps/nexus
git add -A
git commit -m "feat: pgvector extension + embedding column + nomic-embed-text model"
```

---

## Task 2: Embeddings Service

**Files:**

- Create: `server/src/services/embeddings.ts`
- Create: `server/test/services/embeddings.test.ts`

- [ ] **Step 1: Write tests for embeddings service**

Create `server/test/services/embeddings.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd ~/server/apps/nexus/server && npx vitest run test/services/embeddings.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement embeddings service**

Create `server/src/services/embeddings.ts`:

```typescript
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const EMBED_MODEL = "nomic-embed-text";

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embed failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { embeddings: number[][] };
  return data.embeddings[0];
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag === 0 ? 0 : dot / mag;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd ~/server/apps/nexus/server && npx vitest run test/services/embeddings.test.ts
```

Expected: all tests PASS (requires Ollama running with nomic-embed-text).

- [ ] **Step 5: Commit**

```bash
cd ~/server/apps/nexus
git add server/src/services/embeddings.ts server/test/services/embeddings.test.ts
git commit -m "feat: embeddings service — Ollama nomic-embed-text integration"
```

---

## Task 3: Skills Service — Add upsertSkill with Embedding

**Files:**

- Modify: `server/src/services/skills.ts`
- Modify: `server/test/services/skills.test.ts`

- [ ] **Step 1: Write test for upsertSkill**

Add to `server/test/services/skills.test.ts`:

```typescript
import {
  createSkill,
  getSkill,
  listSkills,
  searchSkills,
  updateSkill,
  deleteSkill,
  upsertSkill,
} from "../../src/services/skills.js";

// ... existing tests ...

describe("upsertSkill", () => {
  it("creates a skill if it does not exist", async () => {
    const skill = await upsertSkill({
      name: "new-skill",
      displayName: "New Skill",
      description: "A new skill",
      content: "# New",
    });
    expect(skill.name).toBe("new-skill");
    expect(skill.embedding).not.toBeNull();
  });

  it("updates a skill if it already exists", async () => {
    await upsertSkill({
      name: "existing",
      displayName: "V1",
      description: "version 1",
      content: "# V1",
    });
    const updated = await upsertSkill({
      name: "existing",
      displayName: "V2",
      description: "version 2",
      content: "# V2",
    });
    expect(updated.displayName).toBe("V2");
    expect(updated.embedding).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify new tests fail**

```bash
cd ~/server/apps/nexus/server && npx vitest run test/services/skills.test.ts
```

Expected: FAIL — `upsertSkill` not exported.

- [ ] **Step 3: Implement upsertSkill**

Add to `server/src/services/skills.ts`:

```typescript
import { eq, ilike, or, arrayContains, sql, type SQL } from "drizzle-orm";
import { getDb } from "../db/client.js";
import { skills } from "../db/schema.js";
import { generateEmbedding } from "./embeddings.js";

// ... existing types and functions ...

type UpsertSkillInput = {
  name: string;
  displayName: string;
  description: string;
  content: string;
  category?: string;
  tags?: string[];
  model?: string;
};

export async function upsertSkill(input: UpsertSkillInput) {
  const db = getDb();

  // Generate embedding from content
  let embedding: number[] | null = null;
  try {
    const textForEmbedding = `${input.displayName}\n${input.description}\n${input.content}`;
    embedding = await generateEmbedding(textForEmbedding);
  } catch (e) {
    console.error("Embedding generation failed, saving without embedding:", e);
  }

  const values = {
    name: input.name,
    displayName: input.displayName,
    description: input.description,
    content: input.content,
    category: input.category,
    tags: input.tags ?? [],
    model: input.model,
    embedding,
    updatedAt: new Date(),
  };

  const [skill] = await db
    .insert(skills)
    .values(values)
    .onConflictDoUpdate({
      target: skills.name,
      set: {
        displayName: values.displayName,
        description: values.description,
        content: values.content,
        category: values.category,
        tags: values.tags,
        model: values.model,
        embedding: values.embedding,
        updatedAt: values.updatedAt,
      },
    })
    .returning();
  return skill;
}
```

- [ ] **Step 4: Run all tests to verify they pass**

```bash
cd ~/server/apps/nexus/server && npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/server/apps/nexus
git add server/src/services/skills.ts server/test/services/skills.test.ts
git commit -m "feat: upsertSkill with automatic embedding generation"
```

---

## Task 4: Graph Service — Add traverseExtends

**Files:**

- Modify: `server/src/services/graph.ts`
- Modify: `server/test/services/graph.test.ts`

- [ ] **Step 1: Write tests for traverseExtends**

Add to `server/test/services/graph.test.ts`:

```typescript
import {
  linkSkills,
  unlinkSkills,
  getGraph,
  traverseExtends,
} from "../../src/services/graph.js";

// ... existing tests ...

describe("traverseExtends", () => {
  it("returns the chain of extends relationships", async () => {
    await createSkill({
      name: "phase-a",
      displayName: "A",
      description: "a",
      content: "a",
    });
    await createSkill({
      name: "phase-b",
      displayName: "B",
      description: "b",
      content: "b",
    });
    await createSkill({
      name: "phase-c",
      displayName: "C",
      description: "c",
      content: "c",
    });
    await linkSkills("phase-a", "phase-b", "extends");
    await linkSkills("phase-b", "phase-c", "extends");

    const chain = await traverseExtends("phase-a");
    expect(chain.map((s) => s.name)).toEqual(["phase-a", "phase-b", "phase-c"]);
  });

  it("returns single skill if no extends", async () => {
    await createSkill({
      name: "solo",
      displayName: "Solo",
      description: "s",
      content: "s",
    });
    const chain = await traverseExtends("solo");
    expect(chain).toHaveLength(1);
    expect(chain[0].name).toBe("solo");
  });

  it("returns empty array if skill not found", async () => {
    const chain = await traverseExtends("nonexistent");
    expect(chain).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd ~/server/apps/nexus/server && npx vitest run test/services/graph.test.ts
```

Expected: FAIL — `traverseExtends` not exported.

- [ ] **Step 3: Implement traverseExtends**

Add to `server/src/services/graph.ts`:

```typescript
export async function traverseExtends(skillName: string) {
  const db = getDb();

  const [start] = await db
    .select()
    .from(skills)
    .where(eq(skills.name, skillName))
    .limit(1);
  if (!start) return [];

  const chain = [start];
  const visited = new Set<string>([start.id]);
  let currentId = start.id;

  while (true) {
    const [next] = await db
      .select({ skill: skills })
      .from(skillRelations)
      .innerJoin(skills, eq(skills.id, skillRelations.targetId))
      .where(
        and(
          eq(skillRelations.sourceId, currentId),
          eq(skillRelations.relationType, "extends"),
        ),
      )
      .limit(1);

    if (!next || visited.has(next.skill.id)) break;

    chain.push(next.skill);
    visited.add(next.skill.id);
    currentId = next.skill.id;
  }

  return chain;
}
```

- [ ] **Step 4: Run all tests to verify they pass**

```bash
cd ~/server/apps/nexus/server && npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/server/apps/nexus
git add server/src/services/graph.ts server/test/services/graph.test.ts
git commit -m "feat: traverseExtends — walk workflow chain via graph"
```

---

## Task 5: Resolver Service

**Files:**

- Create: `server/src/services/resolver.ts`
- Create: `server/test/services/resolver.test.ts`

- [ ] **Step 1: Write tests for resolver**

Create `server/test/services/resolver.test.ts`:

```typescript
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

  it("returns empty results for unrelated intent", async () => {
    await upsertSkill({
      name: "tdd-workflow",
      displayName: "TDD",
      description: "Test driven dev",
      content: "Write tests first",
    });

    const result = await resolve("bake a chocolate cake");
    // Should still return something (no empty responses) but low similarity
    expect(result.workflow).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd ~/server/apps/nexus/server && npx vitest run test/services/resolver.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement resolver**

Create `server/src/services/resolver.ts`:

```typescript
import { sql } from "drizzle-orm";
import { getDb } from "../db/client.js";
import { skills } from "../db/schema.js";
import { generateEmbedding } from "./embeddings.js";
import { traverseExtends } from "./graph.js";

type WorkflowEntry = {
  phase: string;
  status: "current" | "next";
  skill: {
    name: string;
    displayName: string;
    content: string;
  };
};

type ContextEntry = {
  name: string;
  displayName: string;
  similarity: number;
  content: string;
};

type ResolveResult = {
  workflow: WorkflowEntry[];
  context: ContextEntry[];
  related: ContextEntry[];
};

const SIMILARITY_THRESHOLD = 0.3;
const MAX_RESULTS = 5;

// Categories that indicate workflow skills
const WORKFLOW_CATEGORIES = new Set([
  "discovery",
  "planning",
  "execution",
  "quality",
  "development",
  "debugging",
]);

export async function resolve(
  intent: string,
  phase?: string,
): Promise<ResolveResult> {
  const result: ResolveResult = { workflow: [], context: [], related: [] };

  // 1. Build workflow chain if phase provided
  if (phase) {
    const chain = await traverseExtends(phase);
    result.workflow = chain.map((skill, i) => ({
      phase: skill.name,
      status: i === 0 ? ("current" as const) : ("next" as const),
      skill: {
        name: skill.name,
        displayName: skill.displayName,
        content: skill.content,
      },
    }));
  }

  // 2. Semantic search via embeddings
  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(intent);
  } catch (e) {
    console.error(
      "Embedding generation failed, falling back to text search:",
      e,
    );
    return await fallbackResolve(intent, result);
  }

  const db = getDb();
  const vectorStr = `[${embedding.join(",")}]`;

  const similar = await db.execute(sql`
    SELECT
      name,
      display_name as "displayName",
      description,
      category,
      tags,
      content,
      1 - (embedding <=> ${vectorStr}::vector) as similarity
    FROM skills
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${MAX_RESULTS}
  `);

  const workflowNames = new Set(result.workflow.map((w) => w.phase));

  for (const row of similar.rows as any[]) {
    if (workflowNames.has(row.name)) continue;

    const entry: ContextEntry = {
      name: row.name,
      displayName: row.displayName,
      similarity: parseFloat(row.similarity),
      content: row.content,
    };

    if (entry.similarity < SIMILARITY_THRESHOLD) continue;

    const category = row.category as string | null;
    if (category && !WORKFLOW_CATEGORIES.has(category)) {
      result.context.push(entry);
    } else {
      result.related.push(entry);
    }
  }

  return result;
}

async function fallbackResolve(
  intent: string,
  partial: ResolveResult,
): Promise<ResolveResult> {
  const db = getDb();
  const pattern = `%${intent}%`;

  const rows = await db.execute(sql`
    SELECT name, display_name as "displayName", category, content
    FROM skills
    WHERE name ILIKE ${pattern}
       OR description ILIKE ${pattern}
       OR array_to_string(tags, ',') ILIKE ${pattern}
    ORDER BY name
    LIMIT ${MAX_RESULTS}
  `);

  const workflowNames = new Set(partial.workflow.map((w) => w.phase));

  for (const row of rows.rows as any[]) {
    if (workflowNames.has(row.name)) continue;
    const entry: ContextEntry = {
      name: row.name,
      displayName: row.displayName,
      similarity: 0,
      content: row.content,
    };
    const category = row.category as string | null;
    if (category && !WORKFLOW_CATEGORIES.has(category)) {
      partial.context.push(entry);
    } else {
      partial.related.push(entry);
    }
  }

  return partial;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd ~/server/apps/nexus/server && npx vitest run test/services/resolver.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/server/apps/nexus
git add server/src/services/resolver.ts server/test/services/resolver.test.ts
git commit -m "feat: resolver service — semantic search + workflow chain"
```

---

## Task 6: Rewrite MCP Tools (8 → 2)

**Files:**

- Rewrite: `server/src/mcp/tools.ts`

- [ ] **Step 1: Rewrite tools.ts**

Replace `server/src/mcp/tools.ts`:

```typescript
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
```

- [ ] **Step 2: Verify MCP server starts**

```bash
cd ~/server/apps/nexus/server && echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1"}}}' | npx tsx src/mcp-stdio.ts 2>/dev/null | head -1
```

Expected: JSON response with server info.

- [ ] **Step 3: Commit**

```bash
cd ~/server/apps/nexus
git add server/src/mcp/tools.ts
git commit -m "feat: rewrite MCP tools — 8 generic → 2 intelligent (nexus + nexus_save)"
```

---

## Task 7: Generate Embeddings for Existing Skills

**Files:**

- Create: `server/src/scripts/backfill-embeddings.ts`

- [ ] **Step 1: Create backfill script**

Create `server/src/scripts/backfill-embeddings.ts`:

```typescript
import "dotenv/config";
import { getDb } from "../db/client.js";
import { skills } from "../db/schema.js";
import { generateEmbedding } from "../services/embeddings.js";
import { isNull } from "drizzle-orm";

async function backfill() {
  const db = getDb();

  const toProcess = await db
    .select()
    .from(skills)
    .where(isNull(skills.embedding));

  console.log(`Found ${toProcess.length} skills without embeddings`);

  for (const skill of toProcess) {
    const text = `${skill.displayName}\n${skill.description}\n${skill.content}`;
    try {
      const embedding = await generateEmbedding(text);
      await db
        .update(skills)
        .set({ embedding })
        .where(isNull(skills.embedding));

      // Need to use raw SQL for the vector update
      await db.execute(
        `UPDATE skills SET embedding = $1::vector WHERE id = $2`,
        [`[${embedding.join(",")}]`, skill.id],
      );

      console.log(`✓ ${skill.name}`);
    } catch (e) {
      console.error(`✗ ${skill.name}: ${e}`);
    }
  }

  console.log("Done");
  process.exit(0);
}

backfill();
```

Wait — Drizzle's `db.execute` with positional params uses `sql` tagged template. Let me fix:

Replace the script with:

```typescript
import "dotenv/config";
import { sql, isNull } from "drizzle-orm";
import { getDb } from "../db/client.js";
import { skills } from "../db/schema.js";
import { generateEmbedding } from "../services/embeddings.js";

async function backfill() {
  const db = getDb();

  const toProcess = await db
    .select({
      id: skills.id,
      name: skills.name,
      displayName: skills.displayName,
      description: skills.description,
      content: skills.content,
    })
    .from(skills)
    .where(isNull(skills.embedding));

  console.log(`Found ${toProcess.length} skills without embeddings`);

  for (const skill of toProcess) {
    const text = `${skill.displayName}\n${skill.description}\n${skill.content}`;
    try {
      const embedding = await generateEmbedding(text);
      const vectorStr = `[${embedding.join(",")}]`;

      await db.execute(sql`
        UPDATE skills SET embedding = ${vectorStr}::vector WHERE id = ${skill.id}
      `);

      console.log(`✓ ${skill.name}`);
    } catch (e) {
      console.error(`✗ ${skill.name}: ${e}`);
    }
  }

  console.log("Done");
  process.exit(0);
}

backfill();
```

- [ ] **Step 2: Run backfill**

```bash
cd ~/server/apps/nexus/server && npx tsx src/scripts/backfill-embeddings.ts
```

Expected: all existing skills get embeddings.

- [ ] **Step 3: Verify embeddings in DB**

```bash
docker exec postgres psql -U nexus -d nexus -c "SELECT name, embedding IS NOT NULL as has_embedding FROM skills ORDER BY name;"
```

Expected: all skills show `t` for has_embedding.

- [ ] **Step 4: Commit**

```bash
cd ~/server/apps/nexus
git add server/src/scripts/backfill-embeddings.ts
git commit -m "feat: backfill script to generate embeddings for existing skills"
```

---

## Task 8: Setup Workflow Chain Links

**Files:** None (database operations only)

- [ ] **Step 1: Verify current extends links**

```bash
docker exec postgres psql -U nexus -d nexus -c "
SELECT s.name as source, t.name as target, sr.relation_type
FROM skill_relations sr
JOIN skills s ON sr.source_id = s.id
JOIN skills t ON sr.target_id = t.id
WHERE sr.relation_type = 'extends'
ORDER BY s.name;
"
```

Check which workflow chain links already exist.

- [ ] **Step 2: Create missing workflow chain links**

The workflow chain should be:
`brainstorming → spec-writing → writing-plans → executing-plans → verification → code-review`

For any missing links, create them. Use the HTTP API since MCP tools have changed:

```bash
# Check which skills exist
curl -s http://localhost:3002/api/skills | python3 -c "import sys,json; [print(s['name']) for s in json.load(sys.stdin)]"

# Create missing extends links (only for pairs not already linked)
curl -s -X POST http://localhost:3002/api/relations -H "Content-Type: application/json" -d '{"source":"brainstorming","target":"spec-writing","type":"extends"}'
curl -s -X POST http://localhost:3002/api/relations -H "Content-Type: application/json" -d '{"source":"spec-writing","target":"writing-plans","type":"extends"}'
curl -s -X POST http://localhost:3002/api/relations -H "Content-Type: application/json" -d '{"source":"writing-plans","target":"executing-plans","type":"extends"}'
curl -s -X POST http://localhost:3002/api/relations -H "Content-Type: application/json" -d '{"source":"executing-plans","target":"verification","type":"extends"}'
curl -s -X POST http://localhost:3002/api/relations -H "Content-Type: application/json" -d '{"source":"verification","target":"code-review","type":"extends"}'
```

Skip any that return errors (already exist).

- [ ] **Step 3: Verify chain works**

```bash
docker exec postgres psql -U nexus -d nexus -c "
SELECT s.name as source, t.name as target
FROM skill_relations sr
JOIN skills s ON sr.source_id = s.id
JOIN skills t ON sr.target_id = t.id
WHERE sr.relation_type = 'extends'
ORDER BY s.name;
"
```

Expected: 5 rows forming the chain.

- [ ] **Step 4: Commit (if any script changes)**

No files changed — this is DB-only. Skip commit.

---

## Task 9: Update MCP Config + Rebuild + Deploy

**Files:**

- Modify: `~/.claude/settings.json` (MCP server config)

- [ ] **Step 1: Build server**

```bash
cd ~/server/apps/nexus/server && npx tsc
```

Expected: no errors.

- [ ] **Step 2: Run all tests**

```bash
cd ~/server/apps/nexus/server && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 3: Update MCP config in Claude settings**

Update `~/.claude/settings.json` — the MCP server entry stays the same (same binary, just different tools registered). Verify it's correct:

```json
"nexus": {
  "type": "stdio",
  "command": "node",
  "args": ["/Users/macmini/server/apps/nexus/server/dist/mcp-stdio.js"],
  "env": {
    "DATABASE_URL": "postgres://nexus:nexus_local@127.0.0.1:5432/nexus"
  }
}
```

- [ ] **Step 4: Restart Nexus server**

```bash
launchctl unload ~/Library/LaunchAgents/dev.nexus.server.plist
launchctl load ~/Library/LaunchAgents/dev.nexus.server.plist
sleep 2
curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/
```

Expected: 200.

- [ ] **Step 5: Test nexus tool end-to-end**

```bash
cd ~/server/apps/nexus/server && echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | npx tsx src/mcp-stdio.ts 2>/dev/null
```

Expected: only 2 tools listed — `nexus` and `nexus_save`.

- [ ] **Step 6: Final commit**

```bash
cd ~/server/apps/nexus
git add -A
git commit -m "feat: nexus skill router v1 — semantic search + workflow graph, 2 MCP tools"
```

---

## Summary

| Task | Description                              | Tests             |
| ---- | ---------------------------------------- | ----------------- |
| 1    | Setup — Ollama model + pgvector + schema | Manual verify     |
| 2    | Embeddings service (Ollama client)       | 3 unit tests      |
| 3    | Skills upsert with auto-embedding        | 2 unit tests      |
| 4    | Graph traverseExtends                    | 3 unit tests      |
| 5    | Resolver (embeddings + graph)            | 3 unit tests      |
| 6    | Rewrite MCP tools (8 → 2)                | Manual MCP test   |
| 7    | Backfill embeddings for existing skills  | Manual verify     |
| 8    | Setup workflow chain links               | Manual verify     |
| 9    | Build + deploy + test                    | End-to-end verify |
