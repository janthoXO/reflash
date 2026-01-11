import { FlashcardSchema as SharedFlashcardSchema } from "@reflash/shared";
import type z from "zod";

export const FlashcardSchema = SharedFlashcardSchema;

export type Flashcard = z.infer<typeof FlashcardSchema>;
