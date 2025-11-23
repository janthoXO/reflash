import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import Flashcard from "./flashcard.js";

let ai: GoogleGenAI;

export function startLLMSession() {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
}

export async function callLLMApi(fileData: { content: string; contentType: string }): Promise<{courseName: string, cards: Flashcard[]}> {


    const flashcardSchema = z.object({
      question: z.string().describe("The question part of the flashcard"),
      answer: z.string().describe("The answer part of the flashcard")
    });


    const promptText = `
      Analyze this lecture document and generate a set of comprehensive flashcards.
      Ensure the 'response' (question) is clear and specific.
      Ensure the 'answer' is concise but complete.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            { 
              inlineData: { 
                mimeType: "application/pdf", 
                data: fileData.content 
              } 
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(z.object({courseName: z.string().describe("The name of course from the slides."), cards:z.array(flashcardSchema)})),
      },
    });
    
    return JSON.parse(response.text);
}