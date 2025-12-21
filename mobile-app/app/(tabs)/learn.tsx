import { useEffect, useState, useCallback } from "react"
import { View, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Flashcard, Unit } from "@reflash/shared"

export default function LearnScreen() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])

  useEffect(() => {
    const cards = units.flatMap((unit) => unit.cards || [])
    setFlashcards(cards)
  }, [units])

  const currentCard = flashcards[currentCardIndex]

  const onFlipCard = useCallback(() => {
    setIsFlipped(!isFlipped)
  }, [isFlipped])

  const onAnswerCard = useCallback(async (correct: boolean) => {
    if (!currentCard) return

    try {
      // Remove answered card and move to next
      const updatedFlashcards = flashcards.filter((c) => c.id !== currentCard.id)
      setFlashcards(updatedFlashcards)

      if (updatedFlashcards.length > 0) {
        if (currentCardIndex >= updatedFlashcards.length) {
          setCurrentCardIndex(0)
        }
      } else {
        setCurrentCardIndex(0)
      }

      setIsFlipped(false)
    } catch (error) {
      console.error("Error answering card:", error)
      Alert.alert("Error", "Failed to submit answer. Please try again.")
    }
  }, [currentCard, flashcards, currentCardIndex])

  return (
    <SafeAreaView edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border p-4">
            <Text className="text-lg font-semibold">Reflash</Text>
      </View>

      {/* Content */}
      <ScrollView className="p-4">
        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" />
            <Text className="mt-4 text-muted-foreground">Loading flashcards...</Text>
          </View>
        ) : flashcards.length > 0 ? (
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-muted-foreground">
                Card {currentCardIndex + 1} of {flashcards.length}
              </Text>
            </View>

            {currentCard && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onFlipCard}
                disabled={isFlipped}>
                <Card className="min-h-[200px]">
                  <CardContent className="flex-1 items-center justify-center py-12">
                    <Text className="text-xs font-medium text-muted-foreground mb-3">
                      {isFlipped ? "Answer" : "Question"}
                    </Text>
                    <Text className="text-base text-center">
                      {isFlipped ? currentCard.answer : currentCard.question}
                    </Text>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            )}

            {!isFlipped ? (
              <Button onPress={onFlipCard} variant="outline" className="w-full">
                <Text>Flip Card</Text>
              </Button>
            ) : (
              <View className="flex-row gap-2">
                <Button
                  onPress={() => onAnswerCard(false)}
                  variant="destructive"
                  className="flex-1">
                  <Text>Wrong</Text>
                </Button>
                <Button
                  onPress={() => onAnswerCard(true)}
                  variant="default"
                  className="flex-1">
                  <Text>Correct</Text>
                </Button>
              </View>
            )}
          </View>
        ) : (
          <View className="items-center justify-center py-12">
            <Text className="text-base font-medium">No flashcards yet</Text>
            <Text className="mt-2 text-sm text-muted-foreground text-center">
              Upload PDFs from the browser extension to generate flashcards.
            </Text>
            <Button><Text>Test</Text></Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
