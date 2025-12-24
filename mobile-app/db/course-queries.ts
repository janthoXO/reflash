import { eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { coursesTable } from "./schema/course";
import { flashcardsTable } from "./schema/flashcard";
import { unitsTable } from "./schema/unit";

export async function deleteCourse(courseId: number, now?: number) {
  if (!now) {
    now = Date.now();
  }

  await db.transaction(async (tx) => {
    await tx
      .update(coursesTable)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(coursesTable.id, courseId));
    await tx
      .update(unitsTable)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(unitsTable.courseId, courseId));
    const updatedUnits: { id: number }[] = await tx
      .select({ id: unitsTable.id })
      .from(unitsTable)
      .where(eq(unitsTable.courseId, courseId))
      .returning({ id: unitsTable.id });

    await tx
      .update(flashcardsTable)
      .set({ deletedAt: now, updatedAt: now })
      .where(
        inArray(
          flashcardsTable.unitId,
          updatedUnits.map((u) => u.id)
        )
      );
  });
}
