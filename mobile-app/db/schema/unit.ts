import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { coursesTable } from "./course";

export const unitsTable = sqliteTable("units", {
  id: int().primaryKey(),
  name: text().notNull(),
  fileName: text().notNull(),
  fileUrl: text().notNull(),
  courseId: int()
    .references(() => coursesTable.id)
    .notNull(),
  updatedAt: int("updatedAt", { mode: "timestamp_ms" }).notNull(),
  deletedAt: int("deletedAt", { mode: "timestamp_ms" }),
});

export const courseToUnitsTableRelations = relations(coursesTable, ({ many }) => ({
  units: many(unitsTable),
}));

export const unitToCourseTableRelations = relations(unitsTable, ({ one }) => ({
  course: one(coursesTable, {
    fields: [unitsTable.courseId],
    references: [coursesTable.id],
  }),
}));
