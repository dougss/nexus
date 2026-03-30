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
  fromDriver(value: unknown): number[] {
    return JSON.parse(value as string);
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
