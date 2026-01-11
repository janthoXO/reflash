import z from "zod";
import { CourseDTOSchema } from "../dtos/course";

export const CourseSchema = CourseDTOSchema;

export type Course = z.infer<typeof CourseSchema>;
