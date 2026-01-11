import z from "zod";

export const FlashcardDTOSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  dueAt: z.number(), // Unix millisec timestamp
  unitId: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable(),
});

export type FlashcardDTO = z.infer<typeof FlashcardDTOSchema>;
