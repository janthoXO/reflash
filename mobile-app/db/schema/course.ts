import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const coursesTable = sqliteTable(
  "courses",
  {
    id: int().primaryKey(),
    name: text().notNull(),
    url: text().notNull(),
  },
  (table) => [uniqueIndex("url_idx").on(table.url)]
);
