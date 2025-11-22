import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import Flashcard from "./flashcard.js";

let ai: GoogleGenAI;

export function startLLMSession() {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
}

export async function callLLMApi(fileData: { filename: string; content: string; contentType: string }): Promise<Flashcard[]> {

    console.log('Calling LLM API for file:', fileData.filename);

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
        responseJsonSchema: zodToJsonSchema(z.array(flashcardSchema)),
      },
    });

    //console.log("Gemini response: ", response.text);

    let cards: Flashcard[] = response.text ? JSON.parse(response.text) : [];

    console.log(`Generated ${cards.length} flashcards`);
    
    return cards;
}