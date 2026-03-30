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
