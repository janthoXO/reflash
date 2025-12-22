import type { Flashcard } from './flashcard';

export interface Unit {
  id: number;
  name: string;
  fileName: string;
  fileUrl: string;
  courseId: number;
  updatedAt: number;
  deletedAt: number | null;
  cards?: Flashcard[];
}
