import { UnitDTOSchema } from "../dtos/unit";
import { FlashcardSchema } from "./flashcard";
import z from "zod";

export const UnitSchema = UnitDTOSchema.extend({
  isGenerating: z.boolean().optional().default(false),
  cards: FlashcardSchema.array().optional().default([]),
});

export type Unit = z.infer<typeof UnitSchema>;
