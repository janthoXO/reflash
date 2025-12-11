import "~style.css";

import type { Flashcard } from "@reflash/shared";
import { useLiveQuery } from "dexie-react-hooks";

import TrainFlashcard from "~components/train-flashcard";
import { useSelected } from "~contexts/SelectedContext";
import { db } from "~db/db";

export default function TrainingPage() {
  const { selectedMap, isLoading } = useSelected();

  // Fetch due cards
  const dueCards = useLiveQuery(async () => {
    const selectedUnitIds = Object.values(selectedMap).flat();
    if (selectedUnitIds.length === 0) return [];

    return await db.flashcards
      .where("unitId")
      .anyOf(selectedUnitIds)
      .filter((fc) => fc.dueAt < Date.now())
      .toArray();
  }, [selectedMap]);

  if (isLoading || !dueCards) {
    return <div className="p-4">Loading...</div>;
  }

  const handleAnswer = async (flashcard: Flashcard, correct: boolean) => {
    // Update dueAt based on answer
    // Simple SRS: Correct -> 1 day, Wrong -> 1 minute
    const newDueAt = correct
      ? Date.now() + 24 * 60 * 60 * 1000
      : Date.now() + 60 * 1000;

    await db.flashcards.update(flashcard.id, { dueAt: newDueAt });
  };

  return (
    <div className="h-full flex flex-col">
      {dueCards.length === 0 ? (
        <p className="text-muted-foreground">
          No cards due for selected units.
        </p>
      ) : (
        <div>
          <div className="flex-1">
            <TrainFlashcard
              flashcard={dueCards[0]!}
              onAnswer={(correct) => handleAnswer(dueCards[0]!, correct)}
            />
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {dueCards.length} cards due
          </div>
        </div>
      )}
    </div>
  );
}
