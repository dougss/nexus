import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgres://nexus:nexus_local@127.0.0.1:5432/nexus";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const pool = new pg.Pool({ connectionString: DATABASE_URL });
    _db = drizzle(pool, { schema });
  }
  return _db;
}
