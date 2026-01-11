import z from "zod";
import { UnitSchema } from "./unit";

export const CourseSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable(),
  units: z.array(UnitSchema).default([]),
});

export type Course = z.infer<typeof CourseSchema>;
