import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { db } from "@/db/db";
import { flashcardsTable } from "@/db/schema/flashcard";
import { unitsTable } from "@/db/schema/unit";
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Stack, useLocalSearchParams } from "expo-router";
import { ChevronDown, ChevronUp, Search } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UnitScreen() {
  const { courseId, unitId } = useLocalSearchParams<{ courseId: string; unitId: string }>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: units } = useLiveQuery(
    db
      .select()
      .from(unitsTable)
      .where(and(eq(unitsTable.id, Number(unitId)), eq(unitsTable.courseId, Number(courseId))))
  );
  const unit = units?.[0];

  const { data: flashcards } = useLiveQuery(
    db
      .select()
      .from(flashcardsTable)
      .where(eq(flashcardsTable.unitId, Number(unitId)))
  );

  const filteredFlashcards = useMemo(() => {
    if (!flashcards) return [];
    if (!searchQuery) return flashcards;
    const query = searchQuery.toLowerCase();
    return flashcards.filter(
      (card) =>
        card.question.toLowerCase().includes(query) || card.answer.toLowerCase().includes(query)
    );
  }, [flashcards, searchQuery]);

  if (!unit)
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );

  return (
    <View className="flex-1 p-4">
      <Stack.Screen options={{ title: unit.name, headerBackTitle: "Library" }} />

      <View className="bg-secondary mb-4 flex-row items-center rounded-md px-3 py-2">
        <View className="mr-2">
          <Search size={20} className="text-muted-foreground" />
        </View>
        <TextInput
          className="text-foreground h-full flex-1"
          placeholder="Search flashcards..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
      </View>

      <ScrollView>
        {filteredFlashcards.map((card) => (
          <FlashcardItem key={card.id} card={card} forceExpand={!!searchQuery} />
        ))}
        {filteredFlashcards.length === 0 && (
          <Text className="text-muted-foreground mt-4 text-center">No flashcards found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

function FlashcardItem({ card, forceExpand }: { card: any; forceExpand: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(forceExpand);
  }, [forceExpand]);

  return (
    <Card className="my-2 pb-0">
      <CardContent className="p-0">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Text className="text-card-foreground p-4 pt-0 text-center text-base font-medium">
            {card.question}
          </Text>
          {!isOpen && (
            <Button variant="ghost" onPress={() => setIsOpen(true)}>
              <ChevronDown size={20} className="text-muted-foreground" />
            </Button>
          )}
          <CollapsibleContent>
            <Separator />
            <Text className="text-card-foreground p-4 pb-0 text-center text-base">
              {card.answer}
            </Text>
            {isOpen && (
              <Button variant="ghost" onPress={() => setIsOpen(false)}>
                <ChevronUp size={20} className="text-muted-foreground" />
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
