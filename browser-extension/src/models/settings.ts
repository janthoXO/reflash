import z from "zod";

export enum LLMProvider {
  WASM = "Default Local",
  OPENAI = "Open AI",
  GOOGLE = "Google",
  ANTHROPIC = "Anthropic",
  OLLAMA = "Ollama",
}

export const OLLAMA_DEFAULT_URL = "http://localhost:11434";

// Phi-3.5-vision-instruct-q4f16_1-MLC

// Phi-3.5-vision-instruct-q0f16-MLC

export enum LLMModel {
  // WASM Models
  QWEN = "Qwen3-0.6B-q4f16_1-MLC",
  PHI = "Phi-3.5-vision-instruct-q4f32_1-MLC",
  GEMMA = "Gemma-3-1b-it-q4f16_1-MLC",

  // OpenAI Models
  GPT_5_2 = "gpt-5.2",
  GPT_5 = "gpt-5",
  GPT_5_MINI = "gpt-5-mini",

  // Google Models
  GEMINI_3_PRO = "gemini-3-pro-preview",
  GEMINI_3_FLASH = "gemini-3-flash-preview",
  GEMINI_2_5_FLASH = "gemini-2.5-flash",

  // Anthropic Models
  CLAUDE_SONNET_4_5 = "claude-sonnet-4-5",
  CLAUDE_HAIKU_4_5 = "claude-haiku-4-5",
  CLAUDE_OPUS_4_5 = "claude-opus-4-5",

  // Ollama Models
  LLAMA3 = "llama3",

  CUSTOM = "custom",
}

export const ProvidersToModels: Record<LLMProvider, LLMModel[]> = {
  [LLMProvider.WASM]: [LLMModel.GEMMA],
  [LLMProvider.OPENAI]: [
    LLMModel.GPT_5_2,
    LLMModel.GPT_5,
    LLMModel.GPT_5_MINI,
    LLMModel.CUSTOM,
  ],
  [LLMProvider.GOOGLE]: [
    LLMModel.GEMINI_3_PRO,
    LLMModel.GEMINI_3_FLASH,
    LLMModel.GEMINI_2_5_FLASH,
    LLMModel.CUSTOM,
  ],
  [LLMProvider.ANTHROPIC]: [
    LLMModel.CLAUDE_SONNET_4_5,
    LLMModel.CLAUDE_HAIKU_4_5,
    LLMModel.CLAUDE_OPUS_4_5,
    LLMModel.CUSTOM,
  ],
  [LLMProvider.OLLAMA]: [LLMModel.LLAMA3, LLMModel.CUSTOM],
};

export const LLMSettingsSchema = z.object({
  provider: z.enum(LLMProvider),
  model: z.string(),
  apiKey: z.string(),
  url: z.string(), // For Ollama
});

export type LLMSettings = z.infer<typeof LLMSettingsSchema>;

export const SettingsSchema = z.object({
  darkMode: z.boolean().default(false),
  autoScrape: z.boolean().default(false),
  llm: LLMSettingsSchema,
});

export type Settings = z.infer<typeof SettingsSchema>;
