import { CourseSchema as SharedCourseSchema } from "@reflash/shared";
import { UnitSchema } from "./unit";
import z from "zod";

export const CourseSchema = SharedCourseSchema.extend({
  units: z.array(UnitSchema).optional().default([]),
});

export type Course = z.infer<typeof CourseSchema>;
