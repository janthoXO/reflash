import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const coursesTable = sqliteTable(
  "courses",
  {
    id: int().primaryKey(),
    name: text().notNull(),
    url: text().notNull(),
    updatedAt: int().notNull().default(0),
    deletedAt: int(),
  },
  (table) => [uniqueIndex("url_idx").on(table.url)]
);
