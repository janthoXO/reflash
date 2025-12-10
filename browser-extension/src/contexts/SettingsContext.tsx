import {
  createContext,
  useContext,
  type ReactNode
} from "react"

import { useStorage } from "@plasmohq/storage/hook"

import type { Settings } from "~models/settings"
import { LLMProvider } from "~models/ai-providers"

interface SettingsContextType {
  settings: Settings
  setSettings: (setter: Settings) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const defaultSettings: Settings = {
    darkMode: false,
    autoScrape: false,
    llm: {
      provider: LLMProvider.WASM
    }
  }

  const [settings, setSettings] = useStorage<Settings>(
    "settings",
    defaultSettings
  )

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings
      }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
