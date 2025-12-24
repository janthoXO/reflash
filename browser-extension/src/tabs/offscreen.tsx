import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import type { Flashcard, Unit } from "@reflash/shared";
import { generateText, type LanguageModel } from "ai";
import { ollama } from "ollama-ai-provider-v2";
import * as pdfjsLib from "pdfjs-dist";
import { useState } from "react";

import { useMessage } from "@plasmohq/messaging/hook";

import { retry } from "~lib/retry";
import { LLMProvider } from "~models/ai-providers";
import type { File } from "~models/file";
import type { LLMSettings } from "~models/settings";
import type {
  TextItem,
  TextMarkedContent,
} from "pdfjs-dist/types/src/display/api";
import { sendToBackground } from "@plasmohq/messaging";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const systemPrompt = `You are a teacher. Create flashcards from the provided file content. Output JSON format: [{question: '...', answer: '...'}]`;

export default function Offscreen() {
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modelStatus, setModelStatus] = useState<string>("Not Loaded");

  useMessage<
    {
      courseId: number;
      llmSettings: LLMSettings;
      customPrompt: string;
      file: File;
    },
    { unit: Partial<Unit> }
  >(async (req, res) => {
    if (!req.body) {
      console.error("No body in flashcards-generate request");
      sendToBackground({
        name: "alert",
        body: {
          alert: {
            level: "error",
            message: "Failed to generate flashcards: no request body",
          },
        },
      });
      res.send({ unit: {} });
      return;
    }

    console.debug("Received flashcards-generate", req.body);
    try {
      // 1. Start loading model immediately
      let modelLoadingPromise;
      if (req.body.llmSettings.provider === LLMProvider.WASM) {
        modelLoadingPromise = loadModel();
      }

      const file = req.body.file;
      // 2. Start parsing all PDFs in parallel
      file.content = await parsePDF(file);

      // 4. Wait for model to finish loading
      if (req.body.llmSettings.provider === LLMProvider.WASM) {
        await modelLoadingPromise;
      }

      // 5. Generate flashcards sequentially (or parallel if the engine supports it)
      // Note: Most local LLM engines are single-threaded/sequential.
      let flashCards: Flashcard[] = [];
      if (req.body?.llmSettings.provider === LLMProvider.WASM) {
        flashCards = await generateFlashcards(
          file.content,
          req.body.customPrompt
        );
      } else {
        flashCards = await generateFlashcardsByProvider(
          file.content,
          req.body.llmSettings,
          req.body.customPrompt
        );
      }
      const unit: Partial<Unit> = {
        name: file.name,
        fileName: file.name,
        fileUrl: file.url,
        cards: flashCards,
        courseId: req.body.courseId,
      };

      res.send({ unit: unit });
    } catch (e) {
      console.error("Error in flashcards-generate:", e);
      sendToBackground({
        name: "alert",
        body: {
          alert: {
            level: "error",
            message: "Failed to generate flashcards",
          },
        },
      });
      res.send({ unit: {} });
    }
  });

  async function parsePDF(file: File): Promise<string> {
    if (!file.base64) {
      console.warn(`File ${file.name} has no base64 data`);
      return "";
    }

    try {
      const binaryString = atob(file.base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: TextItem | TextMarkedContent) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      return fullText;
    } catch (e) {
      console.error(`Error parsing PDF ${file.name}:`, e);
      throw e;
    }
  }

  async function loadModel() {
    if (engine !== null) {
      console.debug("Model already loaded");
      return;
    }

    const e = await CreateMLCEngine("Qwen3-0.6B-q4f16_1-MLC", {
      // SHOULD ALREADY BE CACHED BY DEFAULT
      //   appConfig: {
      //     useIndexedDBCache: true,
      //     model_list: [
      //       {
      //         model: "https://huggingface.co/mlc-ai/Qwen3-0.6B-q4f16_1-MLC",
      //         model_id: "Qwen3-0.6B-q4f16_1-MLC",
      //         model_lib: "/models/qwen3"
      //       }
      //     ]
      //   },
      initProgressCallback: (progress) => {
        console.debug("Model loading progress:", progress.text);
        setModelStatus(progress.text);
      },
    });

    setEngine(e);
  }

  async function generateFlashcards(
    fileContent: string,
    customPrompt: string
  ): Promise<Flashcard[]> {
    if (!engine) {
      throw new Error("Model not loaded");
    }

    const response = await engine.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `${customPrompt}\n fileContent: ${fileContent}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    console.debug("LLM response:", response);

    // Step C: Reply
    return JSON.parse(
      response.choices[0]?.message.content ?? "[]"
    ) as Flashcard[];
  }

  async function generateFlashcardsByProvider(
    fileContent: string,
    llmSettings: LLMSettings,
    customPrompt: string
  ): Promise<Flashcard[]> {
    let model: LanguageModel;

    switch (llmSettings.provider) {
      case LLMProvider.OPENAI: {
        if (!llmSettings.apiKey) throw new Error("OpenAI API Key required");
        const openai = createOpenAI({ apiKey: llmSettings.apiKey });
        model = openai("gpt-5");
        break;
      }

      case LLMProvider.GOOGLE: {
        if (!llmSettings.apiKey) throw new Error("Google API Key required");
        const google = createGoogleGenerativeAI({ apiKey: llmSettings.apiKey });
        model = google("gemini-2.5-flash");
        break;
      }

      case LLMProvider.ANTHROPIC: {
        if (!llmSettings.apiKey) throw new Error("Anthropic API Key required");
        const anthropic = createAnthropic({ apiKey: llmSettings.apiKey });
        model = anthropic("claude-sonnet-4-20250514");
        break;
      }

      case LLMProvider.OLLAMA: {
        // Ollama runs locally on http://localhost:11434 by default
        // No API Key is required for local Ollama
        model = ollama("llama3");
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
        prompt: `${customPrompt}\n fileContent: ${fileContent}`,
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

    const flashcards = JSON.parse(text) as Flashcard[];

    // Step C: Reply
    return flashcards;
  }

  return <div>LLM Brain</div>;
}
