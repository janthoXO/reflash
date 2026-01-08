import z from "zod";

export const FlashcardSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  dueAt: z.number(), // Unix millisec timestamp
  unitId: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable(),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;
