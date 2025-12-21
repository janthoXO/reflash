import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { coursesTable } from "./course";

export const unitsTable = sqliteTable("units", {
  id: int().primaryKey(),
  name: text().notNull(),
  fileName: text().notNull(),
  fileUrl: text().notNull(),
  courseId: int().references(() => coursesTable.id).notNull(),
});