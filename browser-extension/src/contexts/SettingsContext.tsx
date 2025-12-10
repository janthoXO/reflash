import {
  createContext,
  useContext,
  useEffect,
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

  useEffect(() => {
    if (settings?.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings?.darkMode])

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
