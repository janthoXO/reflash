import DeleteDialog from "@/components/deleteDialog";
import EditDropdown from "@/components/editDropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/db/db";
import { flashcardsTable } from "@/db/schema/flashcard";
import { unitsTable } from "@/db/schema/unit";
import { Flashcard, Unit } from "@reflash/shared";
import { and, eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Check, ChevronDown, ChevronUp, Search, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UnitScreen() {
  const { courseId, unitId } = useLocalSearchParams<{ courseId: string; unitId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: unit } = useLiveQuery(
    db.query.unitsTable.findFirst({
      where: (unitsTable) =>
        and(
          eq(unitsTable.id, Number(unitId)),
          eq(unitsTable.courseId, Number(courseId)),
          isNull(unitsTable.deletedAt)
        ),
      with: {
        cards: true,
      },
    })
  ) as { data: Unit | undefined };

  const filteredFlashcards = useMemo(() => {
    if (!unit?.cards) return [];
    if (!searchQuery) return unit.cards;

    const query = searchQuery.toLowerCase();
    return unit.cards.filter(
      (card) =>
        card.question.toLowerCase().includes(query) || card.answer.toLowerCase().includes(query)
    );
  }, [unit, searchQuery]);

  const [isEdit, setIsEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (unit) {
      setEditName(unit.name);
    }
  }, [unit]);

  async function onSave() {
    if (!unit) return;
    await db
      .update(unitsTable)
      .set({ name: editName, updatedAt: Date.now() })
      .where(eq(unitsTable.id, unit.id));
    setIsEdit(false);
  }

  function onReset() {
    setIsEdit(false);
    if (unit) setEditName(unit.name);
  }

  async function onDelete() {
    if (!unit) return;
    const now = Date.now();
    await db.transaction(async (tx) => {
      await tx
        .update(unitsTable)
        .set({ deletedAt: now, updatedAt: now })
        .where(eq(unitsTable.id, unit.id));
      await tx
        .update(flashcardsTable)
        .set({ deletedAt: now, updatedAt: now })
        .where(eq(flashcardsTable.unitId, unit.id));
    });
    setShowDeleteDialog(false);
    router.back();
  }

  if (!unit)
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );

  return (
    <View className="flex-1 p-4">
      <Stack.Screen
        options={{
          title: isEdit ? "" : unit.name,
          headerBackTitle: "Library",
          headerRight: () =>
            isEdit ? null : (
              <EditDropdown
                onEdit={() => setIsEdit(true)}
                onDelete={() => setShowDeleteDialog(true)}
              />
            ),
          headerTitle: isEdit
            ? () => (
                <View className="w-full flex-1 flex-row items-center gap-2">
                  <Input value={editName} onChangeText={setEditName} className="h-8 flex-1" />
                  <Button variant="ghost" size="icon" onPress={onReset}>
                    <Icon as={X} className="text-destructive" />
                  </Button>
                  <Button variant="ghost" size="icon" onPress={onSave}>
                    <Icon as={Check} className="text-success" />
                  </Button>
                </View>
              )
            : undefined,
        }}
      />

      <View className="mb-4 flex-row items-center rounded-md bg-secondary px-3 py-2">
        <View className="mr-2">
          <Search size={20} className="text-muted-foreground" />
        </View>
        <TextInput
          className="h-full flex-1 text-foreground"
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
          <Text className="mt-4 text-center text-muted-foreground">No flashcards found.</Text>
        )}
      </ScrollView>

      <DeleteDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        title={`Deleting ${unit.name}`}
        description={`Are you sure you want to delete the unit ${unit.name} with all its flashcards?`}
        onDelete={onDelete}
      />
    </View>
  );
}

function FlashcardItem({ card, forceExpand }: { card: Flashcard; forceExpand: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [editCard, setEditCard] = useState({ question: card.question, answer: card.answer });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setIsExpanded(forceExpand);
  }, [forceExpand]);

  async function onSave() {
    await db
      .update(flashcardsTable)
      .set({ ...editCard, updatedAt: Date.now() })
      .where(eq(flashcardsTable.id, card.id));
    setIsEdit(false);
  }

  function onReset() {
    setIsEdit(false);
    setEditCard({ question: card.question, answer: card.answer });
  }

  async function onDelete() {
    const now = Date.now();
    await db
      .update(flashcardsTable)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(flashcardsTable.id, card.id));
    setShowDeleteDialog(false);
  }

  return (
    <Card className="my-2 p-0">
      <CardContent className="p-0">
        {isEdit ? (
          <View className="gap-2 p-4">
            <Textarea
              value={editCard.question}
              onChangeText={(t) => setEditCard((prev) => ({ ...prev, question: t }))}
            />
            <Separator />
            <Textarea
              value={editCard.answer}
              onChangeText={(t) => setEditCard((prev) => ({ ...prev, answer: t }))}
            />
            <View className="flex-row justify-end gap-2">
              <Button variant="ghost" size="icon" onPress={onReset}>
                <Icon as={X} className="text-destructive" />
              </Button>
              <Button variant="ghost" size="icon" onPress={onSave}>
                <Icon as={Check} className="text-success" />
              </Button>
            </View>
          </View>
        ) : (
          <View>
            <View className="absolute right-2 top-2 z-10">
              <EditDropdown
                onEdit={() => setIsEdit(true)}
                onDelete={() => setShowDeleteDialog(true)}
              />
            </View>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <Text className="mt-8 p-4 pt-0 text-center text-base font-medium text-card-foreground">
                {card.question}
              </Text>
              {!isExpanded && (
                <Button variant="ghost" onPress={() => setIsExpanded(true)}>
                  <Icon as={ChevronDown} className="text-muted-foreground" />
                </Button>
              )}
              <CollapsibleContent>
                <Separator />
                <Text className="p-4 pb-0 text-center text-base text-card-foreground">
                  {card.answer}
                </Text>
                {isExpanded && (
                  <Button variant="ghost" onPress={() => setIsExpanded(false)}>
                    <Icon as={ChevronUp} className="text-muted-foreground" />
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>
          </View>
        )}
      </CardContent>

      <DeleteDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        title={`Deleting Flashcard`}
        description={`Are you sure you want to delete this flashcard?`}
        onDelete={onDelete}
      />
    </Card>
  );
}
