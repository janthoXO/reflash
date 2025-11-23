import { useEffect, useState, useCallback } from "react"
import { View, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { useUser } from "@/contexts/UserContext"
import { fetchUnits, answerCard } from "@/api/units"
import type { Unit } from "@/models/unit"
import type { Flashcard } from "@/models/flashcard"

export default function TrainingScreen() {
  const { user, logout, updateStreak } = useUser()
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])

  useEffect(() => {
    if (!user) {
      router.replace("/login")
      return
    }
    loadUnits()
  }, [user])

  useEffect(() => {
    const cards = units.flatMap((unit) => unit.cards || [])
    setFlashcards(cards)
  }, [units])

  const loadUnits = useCallback(async () => {
    if (!user?.courses || user.courses.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const allUnits: Unit[] = []
      for (const course of user.courses) {
        const courseUnits = await fetchUnits(user.id, course.url)
        allUnits.push(...courseUnits)
      }
      setUnits(allUnits)
    } catch (error) {
      console.error("Error loading units:", error)
      Alert.alert("Error", "Failed to load flashcards. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [user])

  const currentCard = flashcards[currentCardIndex]

  const onFlipCard = useCallback(() => {
    setIsFlipped(!isFlipped)
  }, [isFlipped])

  const onAnswerCard = useCallback(async (correct: boolean) => {
    if (!currentCard || !user) return

    try {
      const response = await answerCard(user.id, currentCard._id, correct)
      if (response.streak !== undefined) {
        updateStreak(response.streak)
      }

      // Remove answered card and move to next
      const updatedFlashcards = flashcards.filter((c) => c._id !== currentCard._id)
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
  }, [currentCard, user, flashcards, currentCardIndex, updateStreak])

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout()
            router.replace("/login")
          }
        }
      ]
    )
  }, [logout, router])

  if (!user) {
    return null
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="border-b border-border bg-card p-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-semibold">Reflash</Text>
            <Text className="text-xs text-muted-foreground mt-1">
              Streak: {user.streak} days
            </Text>
          </View>
          <Button onPress={handleLogout} variant="outline" size="sm">
            <Text>Logout</Text>
          </Button>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-4">
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
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
