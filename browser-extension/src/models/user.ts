import type { Course } from "./course";

export interface User {
    id: string,
    streak: number,
    courses?: Course[]
}