import { z } from "zod";

const currentYear = new Date().getFullYear();

export const bookSchema = z.object({
  title: z.string().trim().min(3, "Введите не менее 3 символов.").max(120, "Максимум 120 символов."),
  author: z.string().trim().min(2, "Укажите автора.").max(100, "Максимум 100 символов."),
  genre: z.enum(["fiction", "fantasy", "history", "science", "poetry", "other"]),
  firstPublishedYear: z.number().int("Введите целый год.").min(1400, "Год должен быть не ранее 1400.").max(currentYear, "Год не может быть в будущем."),
  lastEditionYear: z.number().int("Введите целый год.").min(1400, "Год должен быть не ранее 1400.").max(currentYear, "Год не может быть в будущем."),
  pageCount: z.number().int("Введите целое число страниц.").min(1, "Минимум одна страница.").max(10000, "Максимум 10 000 страниц."),
  description: z.string().trim().min(10, "Описание должно содержать не менее 10 символов.").max(2000, "Максимум 2000 символов."),
}).refine((values) => values.lastEditionYear >= values.firstPublishedYear, {
  path: ["lastEditionYear"],
  message: "Год переиздания не может быть раньше первой публикации.",
});

export type BookFormValues = z.infer<typeof bookSchema>;
