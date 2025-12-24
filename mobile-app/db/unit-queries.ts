import { eq } from "drizzle-orm";
import { db } from "./db";
import { flashcardsTable } from "./schema/flashcard";
import { unitsTable } from "./schema/unit";

export async function deleteUnit(unitId: number, now?: number) {
  if (!now) {
    now = Date.now();
  }

  await db.transaction(async (tx) => {
    await tx
      .update(unitsTable)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(unitsTable.id, unitId));
    await tx
      .update(flashcardsTable)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(flashcardsTable.unitId, unitId));
  });
}
