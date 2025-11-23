import type { Flashcard } from "./flashcard"

export interface Unit {
  fileId: string
  courseId: string
  filename: string
  cards: Flashcard[]
}
