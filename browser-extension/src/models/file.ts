import z from "zod";

export const FileSchema = z.object({
  name: z.string(),
  base64: z.string().optional(),
  url: z.string(),
});

export type File = z.infer<typeof FileSchema>;
