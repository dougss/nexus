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
