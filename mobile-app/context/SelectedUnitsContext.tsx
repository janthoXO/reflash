import type { Course } from "@models/course";
import { Unit } from "@models/unit";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMMKVString } from "react-native-mmkv";

interface SelectedContextType {
  // courseId -> unitIds
  selectedUnitsMap: Record<number, number[]>;
  toggleCourse: (course: Course) => void;
  toggleUnit: (unit: Unit) => void;
  isCourseSelected: (courseId: number) => boolean;
  isUnitSelected: (courseId: number, unitId: number) => boolean;
}

const SelectedUnitsContext = createContext<SelectedContextType | null>(null);

export function SelectedUnitsProvider({ children }: { children: ReactNode }) {
  const [_selectedUnitsMapRaw, _setSelectedUnitsMapRaw] = useMMKVString("units.selected");

  const selectedUnitsMap: Record<number, number[]> = useMemo(() => {
    if (!_selectedUnitsMapRaw) {
      return {};
    }
    try {
      return JSON.parse(_selectedUnitsMapRaw);
    } catch {
      return {};
    }
  }, [_selectedUnitsMapRaw]);
  const setSelectedUnitsMap = (newMap: Record<number, number[]>) => {
    _setSelectedUnitsMapRaw(JSON.stringify(newMap));
  };

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
    <SelectedUnitsContext.Provider
      value={{
        selectedUnitsMap,
        toggleCourse,
        toggleUnit,
        isCourseSelected,
        isUnitSelected,
      }}>
      {children}
    </SelectedUnitsContext.Provider>
  );
}

export function useSelectedUnits() {
  const context = useContext(SelectedUnitsContext);
  if (!context) {
    throw new Error("useSelectedUnits must be used within a SelectedUnitsProvider");
  }
  return context;
}
