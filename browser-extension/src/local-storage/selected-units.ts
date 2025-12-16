import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

const _selectedUnitsStorageKey = "selected-units";

let _selectedUnitsStorageInstance: Storage | null = null;

const selectedUnitsStorageInstance = () => {
  if (!_selectedUnitsStorageInstance) {
    _selectedUnitsStorageInstance = new Storage({
      area: "local",
    });
  }
  return _selectedUnitsStorageInstance;
};

export const useSelectedUnitsStorage = () => {
  return useStorage<Record<number, number[]>>(
    {
      key: _selectedUnitsStorageKey,
      instance: selectedUnitsStorageInstance(),
    },
    {}
  );
};

export const getSelectedUnitsFromStorage = async () => {
  return (
    selectedUnitsStorageInstance()
      // maps from courseId to array of unitIds
      .get<Record<number, number[]>>(_selectedUnitsStorageKey)
  );
};

export const setSelectedUnitsToStorage = (
  selectedUnits: Record<number, number[]>
) => {
  return selectedUnitsStorageInstance().set(
    _selectedUnitsStorageKey,
    selectedUnits
  );
};
