import type { Flashcard } from './flashcard';

export interface Unit {
  id: string;
  fileName: string;
  fileUrl: string;
  courseId: string;
  cards: Flashcard[];
}
