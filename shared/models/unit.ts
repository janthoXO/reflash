import z from "zod";
import { FlashcardSchema } from "./flashcard";

export const UnitSchema = z.object({
  id: z.number(),
  name: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  courseId: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable(),
  cards: z.array(FlashcardSchema).default([]),
});

export type Unit= z.infer<typeof UnitSchema>;
