import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import { sendToBackground } from "@plasmohq/messaging";
import z from "zod";
import { parsePDF } from "~lib/pdf";
import { WorkerQueue } from "~lib/worker-queue";
import { type Flashcard } from "~models/flashcard";
import {
  FlashcardLLMOutputSchema,
  flashcardsSystemPrompt,
} from "./flashcard-generation";
import { retry } from "~lib/retry";

let enginePromise: Promise<MLCEngine> | null = null;

type FlashcardGenerationTaskInput = {
  courseId: number;
  unitId: number;
  fileContent: string;
  systemPrompt: string;
  llmModel: string;
  customPrompt: string;
};

async function flashcardGenerationTaskInput(
  data: FlashcardGenerationTaskInput,
  signal: AbortSignal
) {
  try {
    let flashcards: Flashcard[] = [];
    await retry(async () => {
      flashcards = FlashcardLLMOutputSchema.parse(
        await generateJsonWasm(
          data.systemPrompt,
          ` ${data.customPrompt}\n\nfileContent:\n${data.fileContent}`,
          data.llmModel,
          JSON.stringify(z.toJSONSchema(FlashcardLLMOutputSchema))
        )
      ).cards as Flashcard[];
    }, 3);

    if (signal.aborted) {
      console.warn("WASM flashcard generation aborted");
      await sendToBackground({
        name: "units-delete",
        body: {
          courseId: data.courseId,
          unitId: data.unitId,
        },
      });
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
  } catch (e) {
    console.error("[WASM LLM: flashcard generation] Error:", e);
    await sendToBackground({
      name: "units-delete",
      body: {
        courseId: data.courseId,
        unitId: data.unitId,
      },
    });
  }
}

const WasmQueue: WorkerQueue<FlashcardGenerationTaskInput> = new WorkerQueue(
  async (data, signal) => flashcardGenerationTaskInput(data, signal),
  1 // limit to 1 concurrent WASM request
);

async function loadModel(model: string): Promise<MLCEngine> {
  return CreateMLCEngine(model, {
    initProgressCallback: (progress) => {
      console.debug("Model loading progress:", progress.text);
    },
  });
}

/**
 * generates flashcards using a local wasm LLM model
 * the generated flashcards are asynchronously forwarded to the background script
 */
export async function generateFlashcardsWasm(
  courseId: number,
  unitId: number,
  fileBase64: string,
  llmModel: string,
  customPrompt: string
): Promise<void> {
  // 1. parse PDF
  const fileContent = await parsePDF(fileBase64 || "");

  // 2. Queue flashcard generation with sending to background
  WasmQueue.push({
    courseId: courseId,
    unitId: unitId,
    fileContent: fileContent,
    systemPrompt: flashcardsSystemPrompt,
    llmModel: llmModel,
    customPrompt: customPrompt,
  });
}

async function generateJsonWasm(
  systemPrompt: string,
  userPrompt: string,
  llmModel: string,
  jsonSchema?: string
): Promise<object> {
  if (!enginePromise) {
    enginePromise = loadModel(llmModel);
  }

  const _engine = await enginePromise;

  await _engine.chatCompletion({
    stream: false,
    messages: [
      {
        role: "user",
        content: `${systemPrompt}\n\n${userPrompt}`,
      },
    ],
    max_tokens: Infinity,
    response_format: jsonSchema
      ? { type: "json_object", schema: jsonSchema }
      : { type: "json_object" },
  });
  const responseMessage = await _engine.getMessage();

  console.debug("LLM response:", responseMessage);

  return JSON.parse(responseMessage) as object;
}
