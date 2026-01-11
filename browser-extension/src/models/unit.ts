import { UnitSchema as SharedUnitSchema } from "@reflash/shared";
import { FlashcardSchema } from "./flashcard";
import z from "zod";

export const UnitSchema = SharedUnitSchema.extend({
  isGenerating: z.boolean().optional().default(false),
  cards: FlashcardSchema.array().optional().default([]),
});

export type Unit = z.infer<typeof UnitSchema>;
