import { createContext, useContext, useEffect, type ReactNode } from "react";

import type { Course } from "~models/course";
import type { Unit } from "~models/unit";
import { useSelectedUnitsStorage } from "~local-storage/selected-units";
import { useUrl } from "./UrlContext";
import { db } from "~db/db";

interface SelectedContextType {
  // courseId -> unitIds
  selectedUnitsMap: Record<number, number[]>;
  isLoading: boolean;
  toggleCourse: (course: Course) => void;
  toggleUnit: (unit: Unit) => void;
  isCourseSelected: (courseId: number) => boolean;
  isUnitSelected: (courseId: number, unitId: number) => boolean;
}

const SelectedContext = createContext<SelectedContextType | null>(null);

export function SelectedUnitsProvider({ children }: { children: ReactNode }) {
  const { currentUrlCourse } = useUrl();
  const [selectedUnitsMap, setSelectedUnitsMap, { isLoading }] =
    useSelectedUnitsStorage();

  useEffect(() => {
    // When the current URL changes, select all units for that course
    if (!currentUrlCourse) return;

    db.units
      .where({ courseId: currentUrlCourse.id })
      .filter((unit) => unit.deletedAt === null)
      .toArray()
      .then((units) => {
        currentUrlCourse.units = units;
        setSelectedUnitsMap({
          [currentUrlCourse.id]: currentUrlCourse.units.map((u) => u.id),
        });
      });
  }, [currentUrlCourse]);

  const toggleCourse = (course: Course) => {
    const newMap = { ...selectedUnitsMap };
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
    setSelectedUnitsMap(newMap);
  };

  const toggleUnit = (unit: Unit) => {
    const newMap = { ...selectedUnitsMap };
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
      newMap[unit.courseId] = [...currentUnits, unit.id];
    }

    setSelectedUnitsMap(newMap);
  };

  const isCourseSelected = (courseId: number) => !!selectedUnitsMap?.[courseId];

  const isUnitSelected = (courseId: number, unitId: number) => {
    return selectedUnitsMap?.[courseId]?.includes(unitId) ?? false;
  };

  return (
    <SelectedContext.Provider
      value={{
        selectedUnitsMap,
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
