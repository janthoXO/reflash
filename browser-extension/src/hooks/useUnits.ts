import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { useState, useEffect } from "react"
import type { Unit } from "~models/unit"

/**
 * Hook for units state management
 * Listens to: UNITS_UPDATED
 * Publishes: UNITS_UPDATE
 */
export function useUnits() {
  const [units, setUnits ] = useState<Unit[]>([])
  const [loading, setLoading] = useState(false)

  async function generateCards() {
    setLoading(true)
    try{
        console.debug("Send files-scan")
    const {courseUrl, files}: {courseUrl: string, files: File[]} = await sendToContentScript({ name: "files-scan" });
    console.debug("Received scanned files", courseUrl, files)

    if (files.length === 0) {
      setLoading(false)
      console.debug("No files found, aborting generateCards")
      return 
    }

    // TODO send request to check what is already existing on server

    const units = await sendToBackground({ 
      name: "units-generate", 
      body: {courseUrl, files},
    });
    console.debug("Received generated units", units)
  } catch (error) {
      console.error("Error in generateCards:", error)
  } finally {
    setLoading(false)
  }
    setUnits((prev) => [...prev, ...units])
  }

  return {
    units,
    loading,
    generateCards
  }
}