import z from "zod";
import { UnitDTOSchema } from "../dtos/unit";

export const UnitSchema = UnitDTOSchema;

export type Unit = z.infer<typeof UnitSchema>;
