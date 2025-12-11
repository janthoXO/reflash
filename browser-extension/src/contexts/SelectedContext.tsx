import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useStorage } from "@plasmohq/storage/hook";

import { db } from "~db/db";

interface SelectedContextType {
  // courseId -> unitIds
  selectedMap: Record<number, number[]>;
  isLoading: boolean;
  toggleCourse: (courseId: number, courseUnitIds: number[]) => void;
  toggleUnit: (courseId: number, unitId: number) => void;
  isCourseSelected: (courseId: number) => boolean;
  isUnitSelected: (courseId: number, unitId: number) => boolean;
}

const SelectedContext = createContext<SelectedContextType | null>(null);

export function SelectedProvider({ children }: { children: ReactNode }) {
  const [selectedMap, setSelectedMap, { isLoading }] = useStorage<
    Record<number, number[]>
  >("selectedMap", {});

  const [empytyCheckDone, setEmptyCheckDone] = useState<boolean>(false);
  async function allSelectedMap(): Promise<Record<number, number[]>> {
    return db.units.toArray().then((units) => {
      const newMap: Record<number, number[]> = {};

      if (units.length > 0) {
        units.forEach((u) => {
          if (!newMap[u.courseId]) {
            newMap[u.courseId] = [];
          }
          newMap[u.courseId]!.push(u.id);
        });
      }

      return newMap;
    });
  }
  useEffect(() => {
    if (empytyCheckDone) return;

    if (!selectedMap || Object.keys(selectedMap).length === 0) {
      allSelectedMap().then((newMap) => {
        setSelectedMap(newMap);
        setEmptyCheckDone(true);
      });
    } else {
      setEmptyCheckDone(true);
    }
  }, [selectedMap]);

  const toggleCourse = (courseId: number, courseUnitIds: number[]) => {
    const newMap = { ...selectedMap };
    if (newMap[courseId]) {
      // Deselect course
      delete newMap[courseId];
    } else {
      // Select course with all units
      newMap[courseId] = courseUnitIds;
    }
    setSelectedMap(newMap);
  };

  const toggleUnit = (courseId: number, unitId: number) => {
    const newMap = { ...selectedMap };
    const currentUnits = newMap[courseId] || [];

    if (currentUnits.includes(unitId)) {
      // Deselect unit
      const newUnits = currentUnits.filter((id) => id !== unitId);
      if (newUnits.length === 0) {
        delete newMap[courseId];
      } else {
        newMap[courseId] = newUnits;
      }
    } else {
      // Select unit
      newMap[courseId] = [...currentUnits, unitId];
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
