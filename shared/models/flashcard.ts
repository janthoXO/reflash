export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  dueAt: number; // Unix millisec timestamp
  unitId: string;
}
