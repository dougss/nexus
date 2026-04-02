import { eq, ilike, or, arrayContains, type SQL } from "drizzle-orm";
import { getDb } from "../db/client.js";
import { skills } from "../db/schema.js";
import { generateEmbedding } from "./embeddings.js";

type CreateSkillInput = {
  name: string;
  displayName: string;
  description: string;
  content: string;
  category?: string;
  tags?: string[];
  inputSchema?: unknown;
  model?: string;
};

type UpdateSkillInput = Partial<Omit<CreateSkillInput, "name">>;

type ListFilters = {
  category?: string;
  tag?: string;
};

export async function createSkill(input: CreateSkillInput) {
  const db = getDb();
  const [skill] = await db
    .insert(skills)
    .values({
      name: input.name,
      displayName: input.displayName,
      description: input.description,
      content: input.content,
      category: input.category,
      tags: input.tags ?? [],
      inputSchema: input.inputSchema,
      model: input.model,
    })
    .returning();
  return skill;
}

export async function getSkill(name: string) {
  const db = getDb();
  const [skill] = await db
    .select()
    .from(skills)
    .where(eq(skills.name, name))
    .limit(1);
  return skill ?? null;
}

export async function listSkills(filters: ListFilters) {
  const db = getDb();
  const conditions: SQL[] = [];
  if (filters.category) {
    conditions.push(eq(skills.category, filters.category));
  }
  if (filters.tag) {
    conditions.push(arrayContains(skills.tags, [filters.tag]));
  }
  if (conditions.length === 0) {
    return db.select().from(skills).orderBy(skills.name);
  }
  let query = db.select().from(skills);
  for (const cond of conditions) {
    query = query.where(cond) as typeof query;
  }
  return query.orderBy(skills.name);
}

export async function searchSkills(query: string) {
  const db = getDb();
  const pattern = `%${query}%`;
  return db
    .select()
    .from(skills)
    .where(
      or(
        ilike(skills.name, pattern),
        ilike(skills.description, pattern),
        ilike(skills.content, pattern),
      ),
    )
    .orderBy(skills.name);
}

export async function updateSkill(name: string, input: UpdateSkillInput) {
  const db = getDb();
  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (input.displayName !== undefined) values.displayName = input.displayName;
  if (input.description !== undefined) values.description = input.description;
  if (input.content !== undefined) values.content = input.content;
  if (input.category !== undefined) values.category = input.category;
  if (input.tags !== undefined) values.tags = input.tags;
  if (input.inputSchema !== undefined) values.inputSchema = input.inputSchema;
  if (input.model !== undefined) values.model = input.model;
  const [updated] = await db
    .update(skills)
    .set(values)
    .where(eq(skills.name, name))
    .returning();
  return updated ?? null;
}

export async function deleteSkill(name: string) {
  const db = getDb();
  const [deleted] = await db
    .delete(skills)
    .where(eq(skills.name, name))
    .returning();
  return !!deleted;
}

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

  // Generate embedding from content (truncated to ~6000 chars for nomic-embed-text context limit)
  const MAX_EMBED_CHARS = 6000;
  let embedding: number[] | null = null;
  try {
    const raw = `${input.displayName}\n${input.description}\n${input.content}`;
    const textForEmbedding =
      raw.length > MAX_EMBED_CHARS ? raw.slice(0, MAX_EMBED_CHARS) : raw;
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
