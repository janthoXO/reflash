import { CourseDTOSchema } from "../dtos/course";
import { UnitSchema } from "./unit";
import z from "zod";

export const CourseSchema = CourseDTOSchema.extend({
  units: z.array(UnitSchema).optional().default([]),
});

export type Course = z.infer<typeof CourseSchema>;
