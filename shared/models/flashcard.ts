export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  dueAt: number; // Unix millisec timestamp
  unitId: number;
  updatedAt: number;
  deletedAt: number | null;
}
