import { useState } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"

import type { File } from "~models/file"
import type { Unit } from "~models/unit"

export function useUnits() {
  const [units, setUnits] = useState<Record<string, Unit>>({})
  const [loading, setLoading] = useState(false)

  async function fetchUnits(courseUrl: string) {
    setLoading(true)
    try {
      console.debug("Send units-fetch")

      const units: Unit[] = await sendToBackground({
        name: "units-fetch",
        body: { courseUrl }
      })
      console.log("Received units", units)
      const unitsMap: Record<string, Unit> = {}
      units.forEach((unit) => {
        unitsMap[unit.fileId] = unit
      })
      setUnits(unitsMap)
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
          const unit: Unit = await sendToBackground({
            name: "units-generate",
            body: { courseUrl, file }
          })
          console.debug("Received generated units", unit)
          setUnits((prevUnits) => ({
            ...prevUnits,
            [unit.fileId]: unit
          }))
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

      // remove from units as it will be trained later
      setUnits((prevUnits) => {
        const updatedUnits: Record<string, Unit> = {}
        Object.entries(prevUnits).forEach(([fileId, unit]) => {
          if (unit.cards) {
            updatedUnits[fileId] = {
              ...unit,
              cards: unit.cards.filter((card) => card._id !== cardId)
            }
          } else {
            updatedUnits[fileId] = unit
          }
        })
        return updatedUnits
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
