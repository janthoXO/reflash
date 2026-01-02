import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { unitsTable } from "./unit";

export const flashcardsTable = sqliteTable("flashcards", {
  id: int().primaryKey(),
  question: text().notNull(),
  answer: text().notNull(),
  dueAt: int().notNull().default(0),
  unitId: int()
    .references(() => unitsTable.id)
    .notNull(),
  updatedAt: int().notNull().default(0),
  deletedAt: int(),
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
