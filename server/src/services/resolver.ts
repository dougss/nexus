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

// Categories that indicate workflow skills (process/methodology)
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

  // 1. Generate embedding first (needed for both workflow detection and semantic search)
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

  // 2. Resolve workflow phase: explicit > auto-detected from extends graph
  const resolvedPhase =
    phase ??
    (await autoDetectPhase(db, vectorStr, SIMILARITY_THRESHOLD, intent));

  if (resolvedPhase) {
    const chain = await traverseExtends(resolvedPhase);
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

  // 3. Semantic search for context and related skills
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

// Keyword → workflow phase mappings (checked in order, first match wins)
const KEYWORD_PHASE_MAP: Array<{ keywords: string[]; phase: string }> = [
  {
    keywords: ["implement", "execute", "build", "develop", "coding", "code up"],
    phase: "executing-plans",
  },
  {
    keywords: [
      "debug",
      "fix bug",
      "fix error",
      "broken",
      "not working",
      "failing",
    ],
    phase: "systematic-debugging",
  },
  {
    keywords: [
      "write plan",
      "create plan",
      "decompose",
      "break down tasks",
      "task list",
    ],
    phase: "writing-plans",
  },
  {
    keywords: ["spec", "specification", "requirements", "formalize"],
    phase: "spec-writing",
  },
  {
    keywords: ["stress test", "challenge assumptions", "poke holes", "grill"],
    phase: "grill-me",
  },
  {
    keywords: [
      "review code",
      "code review",
      "pr review",
      "pull request review",
    ],
    phase: "code-review",
  },
  {
    keywords: ["verify", "verification", "confirm output", "check output"],
    phase: "verification",
  },
  {
    keywords: [
      "brainstorm",
      "explore ideas",
      "design feature",
      "new feature",
      "ideate",
    ],
    phase: "brainstorming",
  },
];

function detectPhaseFromKeywords(intent: string): string | null {
  const lower = intent.toLowerCase();
  for (const { keywords, phase } of KEYWORD_PHASE_MAP) {
    if (keywords.some((k) => lower.includes(k))) return phase;
  }
  return null;
}

/**
 * Auto-detect the most relevant workflow phase for the given intent.
 * First tries keyword matching, then falls back to semantic similarity
 * restricted to skills that have `extends` relations (real workflow phases).
 */
async function autoDetectPhase(
  db: ReturnType<typeof getDb>,
  vectorStr: string,
  threshold: number,
  intent: string,
): Promise<string | null> {
  // 1. Keyword-based detection (fast, deterministic)
  const keywordPhase = detectPhaseFromKeywords(intent);
  if (keywordPhase) return keywordPhase;

  // 2. Semantic fallback: most similar skill that has extends relations
  const rows = await db.execute(sql`
    SELECT s.name, 1 - (s.embedding <=> ${vectorStr}::vector) as similarity
    FROM skills s
    WHERE s.embedding IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM skill_relations sr
        WHERE sr.source_id = s.id AND sr.relation_type = 'extends'
      )
    ORDER BY s.embedding <=> ${vectorStr}::vector
    LIMIT 1
  `);

  if (rows.rows.length === 0) return null;
  const top = rows.rows[0] as { name: string; similarity: string };
  const similarity = parseFloat(top.similarity);
  return similarity >= threshold ? top.name : null;
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
