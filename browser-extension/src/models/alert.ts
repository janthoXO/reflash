import z from "zod";

export enum AlertLevel {
  Info = "info",
  Warning = "warning",
  Error = "error",
  Success = "success",
}

export const AlertSchema = z.object({
  level: z.enum(AlertLevel),
  message: z.string(),
  timestamp: z.number().optional(),
});

export type Alert = z.infer<typeof AlertSchema>;
