import { z } from "zod";

export const expenseFormSchema = z.object({
  category: z.string().trim().min(1, "Catégorie requise").max(60),
  description: z.string().trim().min(1, "Description requise").max(200),
  amount: z
    .number({ error: "Doit être un nombre" })
    .min(0, "Doit être positif"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format AAAA-MM-JJ"),
  user_id: z.string().uuid("Utilisateur requis"),
});

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;
