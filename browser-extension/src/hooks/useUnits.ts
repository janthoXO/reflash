import { useState } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import type { File } from "~models/file"
import type { Unit } from "~models/unit"

/**
 * Hook for units state management
 * Listens to: UNITS_UPDATED
 * Publishes: UNITS_UPDATE
 */
export function useUnits() {
  const [units] = useStorage<Record<string, Unit>[]>("units", [])
  const [loading, setLoading] = useState(false)

  async function fetchUnits(userId: string, courseUrl: string) {
    setLoading(true)
    try {
      console.debug("Send units-fetch")

      await sendToBackground({
        name: "units-fetch",
        body: { courseUrl, userId }
      })
    } catch (error) {
      console.error("Error in fetchCards:", error)
    } finally {
      setLoading(false)
    }
  }

  async function generateCards() {
    setLoading(true)
    try {
      console.debug("Send files-scan")
      let { courseUrl, files }: { courseUrl: string; files: File[] } =
        await sendToContentScript({ name: "files-scan" })
      console.debug("Received scanned files", courseUrl, files)

      if (files.length === 0) {
        setLoading(false)
        console.debug("No files found, aborting generateCards")
        return
      }

      // TODO send request to check what is already existing on server
      const existMap = await sendToBackground({
        name: "units-exists",
        body: { courseUrl: courseUrl, fileUrls: files.map((f) => f.url) }
      })

      files = files.filter(
        (file) => !existMap[file.url] || existMap[file.url] === false
      )

      await Promise.all(
        files.map(async (file) => {
          const unit = await sendToBackground({
            name: "units-generate",
            body: { courseUrl, file }
          })
          console.debug("Received generated units", unit)
        })
      )
    } catch (error) {
      console.error("Error in generateCards:", error)
    } finally {
      setLoading(false)
    }
  }

  async function answerCard(cardId: string, correct: boolean) {
    setLoading(true)
    try {
      console.debug("Send cards-answer", { cardId, correct })
      await sendToBackground({
        name: "cards-answer",
        body: { cardId, correct }
      })
    } catch (error) {
      console.error("Error in cardsAnswer:", error)
    } finally {
      setLoading(false)
    }
  }

  return {
    units,
    loading,
    fetchUnits,
    generateCards,
    answerCard
  }
}
