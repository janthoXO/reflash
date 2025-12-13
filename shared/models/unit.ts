import type { Flashcard } from './flashcard';

export interface Unit {
  id: number;
  name: string;
  fileName: string;
  fileUrl: string;
  courseId: number;
  cards?: Flashcard[];
}
