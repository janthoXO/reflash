import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { LLMProvider } from "~models/ai-providers";
import type { Settings } from "~models/settings";

const defaultSettings: Settings = {
  darkMode: false,
  autoScrape: false,
  llm: {
    provider: LLMProvider.WASM,
  },
};

const _settingsStorageKey = "settings";

let _settingsStorageInstance: Storage | null = null;

export const settingsStorageInstance = () => {
  if (!_settingsStorageInstance) {
    _settingsStorageInstance = new Storage({
      area: "sync",
    });
  }

  return _settingsStorageInstance;
};

export const useSettingsStorage = () => {
  const [_settings, setSettings, { isLoading }] = useStorage<Settings>({
    key: _settingsStorageKey,
    instance: settingsStorageInstance(),
  });

  return [_settings || defaultSettings, setSettings, isLoading] as const;
};

export const getSettingsFromStorage = async () => {
  return settingsStorageInstance()
    .get<Settings>(_settingsStorageKey)
    .then((settings) => {
      return settings || defaultSettings;
    });
};

export const setSettingsToStorage = (settings: Settings) => {
  return settingsStorageInstance().set(_settingsStorageKey, settings);
};
