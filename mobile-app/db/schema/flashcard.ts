import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { unitsTable } from "./unit";

export const flashcardsTable = sqliteTable("flashcards", {
  id: int().primaryKey(),
  question: text().notNull(),
  answer: text().notNull(),
  dueAt: int().notNull(),
  unitId: int().references(() => unitsTable.id).notNull(),
});
