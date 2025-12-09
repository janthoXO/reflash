import type { Flashcard } from './flashcard';

export interface Unit {
  id: number;
  fileName: string;
  fileUrl: string;
  courseId: number;
  cards: Flashcard[];
}
