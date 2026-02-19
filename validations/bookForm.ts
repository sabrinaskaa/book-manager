import { z } from "zod";

export const bookFormSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  publicationDate: z.string(),
  publisher: z.string().min(1),
  pages: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => Number(v)),
  categoryId: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => Number(v)),
});
