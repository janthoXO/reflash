import { eq } from "drizzle-orm";
import { db } from "./db";
import { flashcardsTable } from "./schema/flashcard";

export async function deleteFlashcard(flashcardId: number, now?: number) {
  if (!now) {
    now = Date.now();
  }

  await db
    .update(flashcardsTable)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(flashcardsTable.id, flashcardId));
}
