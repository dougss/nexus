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

  const MAX_EMBED_CHARS = 6000;
  for (const skill of toProcess) {
    const raw = `${skill.displayName}\n${skill.description}\n${skill.content}`;
    const text =
      raw.length > MAX_EMBED_CHARS ? raw.slice(0, MAX_EMBED_CHARS) : raw;
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
