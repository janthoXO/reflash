import { Unit } from "./unit";

export interface Course {
  id: number;
  name: string;
  url: string;
  units?: Unit[];
}
