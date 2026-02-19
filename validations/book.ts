import { z } from "zod";

export const bookCreateSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  publicationDate: z.string(),
  publisher: z.string().min(1),
  pages: z
    .number()
    .int()
    .positive(),
  categoryId: z
    .number()
    .int()
    .positive(),
  imageUrl: z.string().max(2048),
});
