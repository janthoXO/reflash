import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const coursesTable = sqliteTable(
  "courses",
  {
    id: int().primaryKey(),
    name: text().notNull(),
    url: text().notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp_ms" }).notNull(),
    deletedAt: int("deletedAt", { mode: "timestamp_ms" }),
  },
  (table) => [uniqueIndex("url_idx").on(table.url)]
);
