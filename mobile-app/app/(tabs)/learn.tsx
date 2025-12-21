import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useSelectedUnits } from "@/context/SelectedUnitsContext";
import { db } from "@/db/db";
import { flashcardsTable } from "@/db/schema/flashcard";
import { and, eq, inArray, lt } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function LearnScreen() {
  const { selectedUnitsMap } = useSelectedUnits();
  const unitIds = useMemo(() => {
    return Array.from(Object.values(selectedUnitsMap).flat());
  }, [selectedUnitsMap]);

  const { data: flashcards } = useLiveQuery(
    db
      .select()
      .from(flashcardsTable)
      .where(and(inArray(flashcardsTable.unitId, unitIds), lt(flashcardsTable.dueAt, Date.now()))),
    [unitIds]
  );

  const [isFlipped, setIsFlipped] = useState(false);

  async function onAnswerCard(correct: boolean) {
    await db
      .update(flashcardsTable)
      .set({
        // If correct, schedule next review in 3 days; if incorrect, in 10 min
        dueAt: Date.now() + (correct ? 3 * 24 * 60 * 60 * 1000 : 10 * 60 * 1000),
      })
      .where(eq(flashcardsTable.id, flashcards![0].id));

    setIsFlipped(false);
  }

  return (
    <ScrollView className="p-4">
      {flashcards.length > 0 ? (
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-muted-foreground text-sm font-medium">
              Remaining cards: {flashcards.length}
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={() => setIsFlipped(!isFlipped)}>
            <Card className="min-h-[200px]">
              <CardContent className="flex-1 items-center justify-center py-12">
                <Text className="text-muted-foreground mb-3 text-xs font-medium">
                  {isFlipped ? "Answer" : "Question"}
                </Text>
                <Text className="text-center text-base">
                  {isFlipped ? flashcards[0].answer : flashcards[0].question}
                </Text>
              </CardContent>
            </Card>
          </TouchableOpacity>

          {!isFlipped ? (
            <Button onPress={() => setIsFlipped(true)} variant="outline" className="w-full">
              <Text>Flip Card</Text>
            </Button>
          ) : (
            <View className="flex-row gap-2">
              <Button onPress={() => onAnswerCard(false)} variant="destructive" className="flex-1">
                <Text>Wrong</Text>
              </Button>
              <Button onPress={() => onAnswerCard(true)} variant="outline" className="flex-1">
                <Text>Correct</Text>
              </Button>
            </View>
          )}
        </View>
      ) : (
        <View className="items-center justify-center">
          <Text className="text-base font-medium">No flashcards</Text>
          <Text className="text-muted-foreground mt-2 text-center text-sm">
            Select flashcards in the library or sync from the browser extension.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
