import type { Flashcard } from "@reflash/shared";
import { Check, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "~components/ui/button";
import { Card, CardAction, CardContent, CardHeader } from "~components/ui/card";

interface TrainFlashcardProps {
  flashcard: Flashcard;
  onAnswer: (correct: boolean) => void;
}

export default function TrainFlashcard({
  flashcard,
  onAnswer,
}: TrainFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [flashcard]);

  function onFlipCard() {
    setIsFlipped(!isFlipped);
  }

  function _onAnswer(correct: boolean) {
    setIsFlipped(false);
    onAnswer(correct);
  }

  return (
    <div>
      <Card className="min-h-[200px] flex flex-col">
        <CardHeader>{isFlipped ? "Answer" : "Question"}</CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="text-center w-full">
            <p className="text-base text-card-foreground">
              {isFlipped ? flashcard.answer : flashcard.question}
            </p>
          </div>
        </CardContent>
        <CardAction className="w-full">
          {!isFlipped ? (
            <div className="flex justify-center">
              <Button onClick={onFlipCard} variant="outline">
                <RotateCcw className="h-4 w-4" />
                Flip Card
              </Button>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              <Button onClick={() => _onAnswer(false)} variant="destructive">
                <XCircle className="h-4 w-4" />
                Wrong
              </Button>
              <Button onClick={() => _onAnswer(true)} variant="success">
                <Check className="h-4 w-4" />
                Correct
              </Button>
            </div>
          )}
        </CardAction>
      </Card>
    </div>
  );
}
