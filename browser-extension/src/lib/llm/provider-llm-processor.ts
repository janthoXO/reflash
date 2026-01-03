import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, type LanguageModel } from "ai";
import { createOllama } from "ollama-ai-provider-v2";
import { retry } from "~lib/retry";
import { LLMProvider, type LLMSettings } from "~models/settings";
import { parsePDF } from "~lib/pdf";
import { WorkerQueue } from "~lib/worker-queue";
import { type Flashcard } from "~models/flashcard";
import { sendToBackground } from "@plasmohq/messaging";
import {
  FlashcardLLMOutputSchema,
  flashcardsSystemPrompt,
} from "./flashcard-generation";

const ProviderQueues: Map<
  LLMProvider,
  WorkerQueue<{
    courseId: number;
    unitId: number;
    fileContent: string;
    systemPrompt: string;
    llmSettings: LLMSettings;
    customPrompt: string;
  }>
> = new Map();

/**
 * generates flashcards using a specified LLM provider
 * the generated flashcards are asynchronously forwarded to the background script
 *
 * @param systemPrompt
 * @param llmSettings
 * @param customPrompt
 * @param file
 */
export async function generateFlashcardsProvider(
  courseId: number,
  unitId: number,
  fileBase64: string,
  llmSettings: LLMSettings,
  customPrompt: string
): Promise<void> {
  // 1. Start parsing PDF
  const fileContent = await parsePDF(fileBase64 || "");

  // 2. Queue flashcard generation with sending to background
  let queue = ProviderQueues.get(llmSettings.provider);
  if (!queue) {
    queue = new WorkerQueue(
      async (data, signal) => {
        let flashcards: Flashcard[] = [];
        try {
          flashcards = FlashcardLLMOutputSchema.parse(
            await generateJsonByProvider(
              data.systemPrompt,
              ` ${data.customPrompt}\n\nfileContent:\n${data.fileContent}`,
              data.llmSettings
            )
          ).cards as Flashcard[];
        } catch (e) {
          console.error("Error generating flashcards with WASM LLM:", e);
          // if error appears, return empty flashcards to remove generating state
        }

        if (signal.aborted) {
          console.warn("Provider flashcard generation aborted");
          return;
        }

        await sendToBackground({
          name: "flashcards-save",
          body: {
            courseId: data.courseId,
            unitId: data.unitId,
            cards: flashcards,
          },
        });
      },
      2 // limit to 2 concurrent provider requests
    );
    ProviderQueues.set(llmSettings.provider, queue);
  }

  queue.push({
    courseId,
    unitId,
    fileContent,
    systemPrompt: flashcardsSystemPrompt,
    llmSettings,
    customPrompt,
  });
}

async function generateJsonByProvider(
  systemPrompt: string,
  userPrompt: string,
  llmSettings: LLMSettings
): Promise<object> {
  let model: LanguageModel;

  switch (llmSettings.provider) {
    case LLMProvider.OPENAI: {
      const openai = createOpenAI({ apiKey: llmSettings.apiKey });
      model = openai(llmSettings.model);
      break;
    }

    case LLMProvider.GOOGLE: {
      const google = createGoogleGenerativeAI({ apiKey: llmSettings.apiKey });
      model = google(llmSettings.model);
      break;
    }

    case LLMProvider.ANTHROPIC: {
      const anthropic = createAnthropic({ apiKey: llmSettings.apiKey });
      model = anthropic(llmSettings.model);
      break;
    }

    case LLMProvider.OLLAMA: {
      // No API Key is required for local Ollama
      model = createOllama({
        baseURL: llmSettings.url,
      })(llmSettings.model);
      break;
    }

    default: {
      throw new Error(
        `Provider ${llmSettings.provider} not supported in this helper`
      );
    }
  }

  // Unified call for all external providers
  let { text } = await retry<{ text: string }>(() => {
    return generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    });
  }, 3);

  console.debug("LLM response:", text);

  if (text.startsWith("```json")) {
    // Clean code block markers if present
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      text = match[1];
    }
  }

  return JSON.parse(text) as object;
}
