import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "~components/header";
import { Button } from "~components/ui/button";
import { db } from "~db/db";

export default function FlashcardPage() {
  const { unitId, flashcardId } = useParams();
  const navigate = useNavigate();

  // query already saved course for current URL
  const flashcard = useLiveQuery(async () => {
    if (!unitId || !flashcardId) return;

    return await db.flashcards.get({
      id: parseInt(flashcardId),
      unitId: parseInt(unitId),
    });
  }, [flashcardId, unitId]);

  return (
    <div>
      <Header
        title={flashcard?.id ?? "Unknown"}
        prefix={[
          <Button
            variant="ghost"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft />
          </Button>,
        ]}
      />
    </div>
  );
}
