import "./style.css"

import {
  Check,
  Loader2,
  LogOut,
  RotateCcw,
  Upload,
  X,
  XCircle
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "~components/ui/button"
import { Card, CardContent } from "~components/ui/card"
import { useCourses } from "~hooks/useCourses"
import { useNotifications } from "~hooks/useNotifications"
import { useUnits } from "~hooks/useUnits"
import { useUser } from "~hooks/useUser"

function Training() {
  const { units, loading, generateCards, answerCard, fetchUnits } = useUnits()
  const { user, logout } = useUser()
  const { courses } = useCourses()
  const { notifications, dismissNotification } = useNotifications()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [flashcards, setFlashcards] = useState([])

  useEffect(() => {
    if (!user) {
      return
    }
    courses.forEach((course) => {
      fetchUnits(user.id, course.url)
    })
  }, [user, courses])

  useEffect(() => {
    console.debug("Units updated in training", units)
    setFlashcards(units.flatMap((unit) => unit.cards || []))
  }, [units])

  const currentCard = flashcards[currentCardIndex]

  function onFlipCard() {
    setIsFlipped(!isFlipped)
  }

  function onAnswerCard(correct: boolean) {
    if (currentCard) {
      answerCard(currentCard._id, correct)
      // Move to next card
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1)
      } else {
        setCurrentCardIndex(0)
      }
      setIsFlipped(false)
    }
  }

  function handleLogout() {
    logout()
  }

  return (
    <div className="w-96 min-h-[400px] bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-card-foreground">
              Reflash
            </h1>
            {user && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Streak: {user.streak} days
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateCards}
              disabled={loading}
              size="sm"
              className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload />
                  Upload PDFs
                </>
              )}
            </Button>
            <Button onClick={handleLogout} variant="outline" size="icon-sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2 mb-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-md border p-3 text-sm flex items-start justify-between ${
                  notification.type === "error"
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-primary/10 border-primary/20 text-foreground"
                }`}>
                <span>{notification.message}</span>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="ml-2 hover:opacity-70">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {flashcards.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">
                Card {currentCardIndex + 1} of {flashcards.length}
              </h2>
            </div>

            {currentCard && (
              <Card className="min-h-[200px] flex flex-col">
                <CardContent className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center w-full">
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      {isFlipped ? "Answer" : "Question"}
                    </p>
                    <p className="text-base text-card-foreground">
                      {isFlipped ? currentCard.answer : currentCard.question}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isFlipped ? (
              <Button
                onClick={onFlipCard}
                variant="outline"
                className="w-full gap-2">
                <RotateCcw className="h-4 w-4" />
                Flip Card
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => onAnswerCard(false)}
                  variant="destructive"
                  className="flex-1 gap-2">
                  <XCircle className="h-4 w-4" />
                  Wrong
                </Button>
                <Button
                  onClick={() => onAnswerCard(true)}
                  variant="default"
                  className="flex-1 gap-2">
                  <Check className="h-4 w-4" />
                  Correct
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-sm font-medium text-foreground">
              No flashcards yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Click "Upload PDFs" to scan the current page for PDF files and
              generate flashcards.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Training
