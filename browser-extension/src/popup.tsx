import "./style.css"
import { Button } from "~components/ui/button"
import { useNotifications } from "~hooks/useNotifications"
import { Upload, Loader2, X } from "lucide-react"
import { useMemo } from "react"
import { useUnits } from "~hooks/useUnits"

function IndexPopup() {
  const { units, loading, generateCards } = useUnits()
  const { notifications, dismissNotification } = useNotifications()

  const flashcards = useMemo(() => {
    return units.flatMap((unit) => unit.cards)
  }, [units])

  return (
    <div className="w-96 min-h-[400px] bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-card-foreground">
            Reflash
          </h1>
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
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              {flashcards.length} Flashcard{flashcards.length > 1 ? "s" : ""}{" "}
              Generated
            </h2>
            {flashcards.map((card) => (
              <div
                key={card.id}
                className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Front
                  </p>
                  <p className="text-sm text-card-foreground">{card.front}</p>
                </div>
                <div className="border-t border-border pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Back
                  </p>
                  <p className="text-sm text-card-foreground">{card.back}</p>
                </div>
              </div>
            ))}
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

export default IndexPopup
