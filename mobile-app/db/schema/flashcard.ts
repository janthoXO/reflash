import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { unitsTable } from "./unit";

export const flashcardsTable = sqliteTable("flashcards", {
  id: int().primaryKey(),
  question: text().notNull(),
  answer: text().notNull(),
  dueAt: int("dueAt", { mode: "timestamp_ms" }).notNull(),
  unitId: int()
    .references(() => unitsTable.id)
    .notNull(),
  updatedAt: int("updatedAt", { mode: "timestamp_ms" }).notNull(),
  deletedAt: int("deletedAt", { mode: "timestamp_ms" }),
});

export const unitToFlashcardsTableRelations = relations(unitsTable, ({ many }) => ({
  cards: many(flashcardsTable),
}));

export const flashCardToUnitTableRelations = relations(flashcardsTable, ({ one }) => ({
  unit: one(unitsTable, {
    fields: [flashcardsTable.unitId],
    references: [unitsTable.id],
  }),
}));
