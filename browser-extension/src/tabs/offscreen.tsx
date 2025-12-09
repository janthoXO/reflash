import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm"
import type { Flashcard, Unit } from "@reflash/shared"
import * as pdfjsLib from "pdfjs-dist"
import { useState } from "react"

import { useMessage } from "@plasmohq/messaging/hook"

import type { File } from "~models/file"

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

export default function Offscreen() {
  const [engine, setEngine] = useState<MLCEngine | null>(null)
  const [modelStatus, setModelStatus] = useState<string>("Not Loaded")

  useMessage<{ files: File[] }, { units: Partial<Unit>[]; message: string }>(
    async (req, res) => {
      if (req.name !== "flashcards-generate" || !req.body) return

      console.debug("Received flashcards-generate", req)
      try {
        // 1. Start loading model immediately
        const modelLoadingPromise = loadModel()

        // 2. Start parsing all PDFs in parallel
        const parsedFiles = await Promise.all(
          req.body.files.map(async (file) => {
            file.content = await parsePDF(file)
            return file
          })
        )

        // 4. Wait for model to finish loading
        await modelLoadingPromise

        // 5. Generate flashcards sequentially (or parallel if the engine supports it)
        // Note: Most local LLM engines are single-threaded/sequential.
        const units = await Promise.all(
          parsedFiles.map(async (file) => {
            const flashCards = await generateFlashcards(file.content)
            return {
              fileName: file.name,
              fileUrl: file.url,
              cards: flashCards
            }
          })
        )

        res.send({
          units: units,
          message: "Flashcards generated successfully"
        })
      } catch (e) {
        console.error("Error in flashcards-generate:", e)
        res.send({ units: [], message: `Error: ${e}` })
      }
    }
  )

  async function parsePDF(file: File): Promise<string> {
    if (!file.base64) {
      console.warn(`File ${file.name} has no base64 data`)
      return ""
    }

    try {
      const binaryString = atob(file.base64)
      const len = binaryString.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const loadingTask = pdfjsLib.getDocument({ data: bytes })
      const pdf = await loadingTask.promise

      let fullText = ""
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ")
        fullText += pageText + "\n"
      }

      return fullText
    } catch (e) {
      console.error(`Error parsing PDF ${file.name}:`, e)
      throw e
    }
  }

  async function loadModel() {
    if (engine !== null) {
      console.debug("Model already loaded")
      return
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
        console.debug("Model loading progress:", progress.text)
        setModelStatus(progress.text)
      }
    })

    setEngine(e)
  }

  async function generateFlashcards(fileContent: string): Promise<Flashcard[]> {
    if (!engine) {
      throw new Error("Model not loaded")
    }

    const response = await engine.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a teacher. Create flashcards from the user text. Output JSON format: [{question: '...', answer: '...'}]"
        },
        { role: "user", content: fileContent }
      ],
      response_format: { type: "json_object" }
    })

    console.debug("LLM response:", response)

    // Step C: Reply
    return JSON.parse(
      response.choices[0]?.message.content ?? "[]"
    ) as Flashcard[]
  }

  return <div>LLM Brain</div>
}
