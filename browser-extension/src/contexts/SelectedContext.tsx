import { createContext, useContext, useEffect, type ReactNode } from "react";

import type { Course, Unit } from "@reflash/shared";
import { useSelectedUnitsStorage } from "~local-storage/selected-units";

interface SelectedContextType {
  // courseId -> unitIds
  selectedMap: Record<number, number[]>;
  isLoading: boolean;
  toggleCourse: (course: Course) => void;
  toggleUnit: (unit: Unit) => void;
  isCourseSelected: (courseId: number) => boolean;
  isUnitSelected: (courseId: number, unitId: number) => boolean;
}

const SelectedContext = createContext<SelectedContextType | null>(null);

export function SelectedProvider({ children }: { children: ReactNode }) {
  const [selectedMap, setSelectedMap, { isLoading }] =
    useSelectedUnitsStorage();

  const toggleCourse = (course: Course) => {
    const newMap = { ...selectedMap };
    if (newMap[course.id]) {
      // Deselect course
      delete newMap[course.id];
    } else {
      // Select course with all units
      if (!course.units) {
        console.warn("No units in toggleCourse");
        return;
      }
      newMap[course.id] = course.units.map((unit) => unit.id);
    }
    setSelectedMap(newMap);
  };

  const toggleUnit = (unit: Unit) => {
    const newMap = { ...selectedMap };
    const currentUnits = newMap[unit.courseId] || [];

    if (currentUnits.includes(unit.id)) {
      // Deselect unit
      const newUnits = currentUnits.filter((id) => id !== unit.id);
      if (newUnits.length === 0) {
        delete newMap[unit.courseId];
      } else {
        newMap[unit.courseId] = newUnits;
      }
    } else {
      // Select unit
      newMap[unit.courseId] = [...currentUnits, unit.courseId];
    }
    setSelectedMap(newMap);
  };

  const isCourseSelected = (courseId: number) => !!selectedMap?.[courseId];

  const isUnitSelected = (courseId: number, unitId: number) => {
    return selectedMap?.[courseId]?.includes(unitId) ?? false;
  };

  return (
    <SelectedContext.Provider
      value={{
        selectedMap: selectedMap || {},
        isLoading,
        toggleCourse,
        toggleUnit,
        isCourseSelected,
        isUnitSelected,
      }}
    >
      {children}
    </SelectedContext.Provider>
  );
}

export function useSelected() {
  const context = useContext(SelectedContext);
  if (!context) {
    throw new Error("useSelected must be used within a SelectedProvider");
  }
  return context;
}
