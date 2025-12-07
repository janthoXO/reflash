import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { db } from "~db/db"

interface SelectedContextType {
  // courseId -> unitIds
  selectedMap: Record<string, string[]>
  isLoading: boolean
  toggleCourse: (courseId: string, courseUnitIds: string[]) => void
  toggleUnit: (courseId: string, unitId: string) => void
  isCourseSelected: (courseId: string) => boolean
  isUnitSelected: (courseId: string, unitId: string) => boolean
}

const SelectedContext = createContext<SelectedContextType | null>(null)

export function SelectedProvider({ children }: { children: ReactNode }) {
  const [selectedMap, setSelectedMap, { isLoading }] = useStorage<
    Record<string, string[]>
  >("selectedMap", {})

  const [empytyCheckDone, setEmptyCheckDone] = useState<boolean>(false)
  async function allSelectedMap(): Promise<Record<string, string[]>> {
    return db.units.toArray().then((units) => {
      const newMap: Record<string, string[]> = {}

      if (units.length > 0) {
        units.forEach((u) => {
          if (!newMap[u.courseId]) {
            newMap[u.courseId] = []
          }
          newMap[u.courseId]!.push(u.id)
        })
      }

      return newMap
    })
  }
  useEffect(() => {
    if (empytyCheckDone) return

    if (!selectedMap || Object.keys(selectedMap).length === 0) {
      allSelectedMap().then((newMap) => {
        setSelectedMap(newMap)
        setEmptyCheckDone(true)
      })
    } else {
      setEmptyCheckDone(true)
    }
  }, [selectedMap])

  const toggleCourse = (courseId: string, courseUnitIds: string[]) => {
    const newMap = { ...selectedMap }
    if (newMap[courseId]) {
      // Deselect course
      delete newMap[courseId]
    } else {
      // Select course with all units
      newMap[courseId] = courseUnitIds
    }
    setSelectedMap(newMap)
  }

  const toggleUnit = (courseId: string, unitId: string) => {
    const newMap = { ...selectedMap }
    const currentUnits = newMap[courseId] || []

    if (currentUnits.includes(unitId)) {
      // Deselect unit
      const newUnits = currentUnits.filter((id) => id !== unitId)
      if (newUnits.length === 0) {
        delete newMap[courseId]
      } else {
        newMap[courseId] = newUnits
      }
    } else {
      // Select unit
      newMap[courseId] = [...currentUnits, unitId]
    }
    setSelectedMap(newMap)
  }

  const isCourseSelected = (courseId: string) => !!selectedMap?.[courseId]

  const isUnitSelected = (courseId: string, unitId: string) => {
    return selectedMap?.[courseId]?.includes(unitId) ?? false
  }

  return (
    <SelectedContext.Provider
      value={{
        selectedMap: selectedMap || {},
        isLoading,
        toggleCourse,
        toggleUnit,
        isCourseSelected,
        isUnitSelected
      }}>
      {children}
    </SelectedContext.Provider>
  )
}

export function useSelected() {
  const context = useContext(SelectedContext)
  if (!context) {
    throw new Error("useSelected must be used within a SelectedProvider")
  }
  return context
}
