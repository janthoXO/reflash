import z from "zod";
import { UnitDTOSchema } from "./unit";

export const CourseDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable(),
  units: z.array(UnitDTOSchema).default([]),
});

export type CourseDTO = z.infer<typeof CourseDTOSchema>;
