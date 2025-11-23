import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"

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
