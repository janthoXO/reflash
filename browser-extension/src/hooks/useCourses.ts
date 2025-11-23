import { useState } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import type { File } from "~models/file"
import type { Unit } from "~models/unit"
import type { User } from "~models/user"

/**
 * Hook for units state management
 * Listens to: UNITS_UPDATED
 * Publishes: UNITS_UPDATE
 */
export function useCourses() {
  const [courses] = useStorage<Course[]>("courses", [])

  return {
    courses
  }
}
