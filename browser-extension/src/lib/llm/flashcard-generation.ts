import z from "zod";

export const flashcardsSystemPrompt = `You are a teacher. Create flashcards from the provided file content. Output JSON format: {"cards": [{"question": '...', "answer": '...'}]}`;

export const FlashcardLLMOutputSchema = z.object({
  cards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
});
