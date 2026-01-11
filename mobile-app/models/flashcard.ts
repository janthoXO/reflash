import z from "zod";
import { FlashcardDTOSchema } from "../dtos/flashcard";

export const FlashcardSchema = FlashcardDTOSchema;

export type Flashcard = z.infer<typeof FlashcardSchema>;
