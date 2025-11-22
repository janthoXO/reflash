import type { Flashcard } from "./flashcard"

export interface Unit {
    id: string
    courseId: string
    name: string
    cards: Flashcard[]
}