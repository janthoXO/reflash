import { Unit } from "./unit";

export interface Course {
  id: number;
  name: string;
  url: string;
  updatedAt: number;
  deletedAt: number | null;
  units?: Unit[];
}
