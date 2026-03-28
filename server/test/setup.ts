import { getDb } from "../src/db/client.js";
import { skills, skillRelations } from "../src/db/schema.js";

export async function cleanDb() {
  const db = getDb();
  await db.delete(skillRelations);
  await db.delete(skills);
}
