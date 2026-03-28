import { eq, and } from "drizzle-orm";
import { getDb } from "../db/client.js";
import { skills, skillRelations } from "../db/schema.js";

export type GraphNode = {
  id: string;
  name: string;
  displayName: string;
  category: string | null;
  tags: string[];
  enabled: boolean;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: "explicit" | "tag";
  relationType?: string;
  sharedTag?: string;
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export async function linkSkills(
  sourceName: string,
  targetName: string,
  type = "related",
) {
  const db = getDb();
  const [source] = await db
    .select()
    .from(skills)
    .where(eq(skills.name, sourceName))
    .limit(1);
  if (!source) throw new Error(`Skill not found: ${sourceName}`);
  const [target] = await db
    .select()
    .from(skills)
    .where(eq(skills.name, targetName))
    .limit(1);
  if (!target) throw new Error(`Skill not found: ${targetName}`);
  const [rel] = await db
    .insert(skillRelations)
    .values({ sourceId: source.id, targetId: target.id, relationType: type })
    .returning();
  return rel;
}

export async function unlinkSkills(sourceName: string, targetName: string) {
  const db = getDb();
  const [source] = await db
    .select()
    .from(skills)
    .where(eq(skills.name, sourceName))
    .limit(1);
  const [target] = await db
    .select()
    .from(skills)
    .where(eq(skills.name, targetName))
    .limit(1);
  if (!source || !target) return false;
  const [deleted] = await db
    .delete(skillRelations)
    .where(
      and(
        eq(skillRelations.sourceId, source.id),
        eq(skillRelations.targetId, target.id),
      ),
    )
    .returning();
  return !!deleted;
}

export async function getGraph(): Promise<Graph> {
  const db = getDb();
  const allSkills = await db.select().from(skills).orderBy(skills.name);
  const allRelations = await db.select().from(skillRelations);

  const nodes: GraphNode[] = allSkills.map((s) => ({
    id: s.id,
    name: s.name,
    displayName: s.displayName,
    category: s.category,
    tags: s.tags ?? [],
    enabled: s.enabled,
  }));

  const edges: GraphEdge[] = [];
  const explicitPairs = new Set<string>();

  for (const rel of allRelations) {
    edges.push({
      id: rel.id,
      source: rel.sourceId,
      target: rel.targetId,
      type: "explicit",
      relationType: rel.relationType,
    });
    const key = [rel.sourceId, rel.targetId].sort().join("-");
    explicitPairs.add(key);
  }

  // Tag-based edges
  const tagMap = new Map<string, string[]>();
  for (const s of allSkills) {
    for (const tag of s.tags ?? []) {
      const list = tagMap.get(tag) ?? [];
      list.push(s.id);
      tagMap.set(tag, list);
    }
  }

  for (const [tag, ids] of tagMap) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join("-");
        if (!explicitPairs.has(key)) {
          edges.push({
            id: `tag-${tag}-${key}`,
            source: ids[i],
            target: ids[j],
            type: "tag",
            sharedTag: tag,
          });
          explicitPairs.add(key);
        }
      }
    }
  }

  return { nodes, edges };
}
