import z from "zod";
import { FlashcardDTOSchema } from "./flashcard";

export const UnitDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  courseId: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable(),
  cards: z.array(FlashcardDTOSchema).default([]),
});

export type UnitDTO = z.infer<typeof UnitDTOSchema>;
