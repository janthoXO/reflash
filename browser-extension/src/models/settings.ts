import type { LLMProvider } from "./ai-providers";

export interface LLMSettings {
  provider: LLMProvider;
  apiKey?: string;
  url?: string;
}

export interface Settings {
  darkMode: boolean;
  autoScrape: boolean;
  llm: LLMSettings;
}
