import { z } from "zod";

export const ARTICLE_CATEGORIES = [
  "sneakers",
  "cards",
  "watches",
  "other",
] as const;

export const ARTICLE_CONDITIONS = [
  "new_unworn",
  "new_with_tags",
  "very_good",
  "good",
  "fair",
  "poor",
] as const;

export const ARTICLE_STATUSES = [
  "in_stock",
  "reserved",
  "sold",
  "returned",
] as const;

// Optional string with length cap. Empty strings pass; the form layer converts
// them to null on submit. We avoid `.transform()` here to keep z.input ===
// z.output, otherwise react-hook-form generic inference breaks.
const optStr = z.string().trim().max(200).optional();

export const articleFormSchema = z.object({
  category: z.enum(ARTICLE_CATEGORIES),
  name: z.string().trim().min(2, "Au moins 2 caractères").max(120),
  brand: optStr,
  reference: optStr,
  serial_number: optStr,
  size: optStr,
  colorway: optStr,
  condition: z.enum(ARTICLE_CONDITIONS),
  has_certificate: z.boolean(),
  certificate_number: optStr,
  has_original_box: z.boolean(),
  has_accessories: z.boolean(),
  accessories_description: optStr,
  notes: z.string().trim().max(2000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)),
  photos: z.array(z.string().url()),
});

export type ArticleFormInput = z.input<typeof articleFormSchema>;

export const purchaseFormSchema = z.object({
  purchase_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format AAAA-MM-JJ"),
  purchase_price: z
    .number({ error: "Doit être un nombre" })
    .min(0, "Doit être positif"),
  purchase_platform: optStr,
  seller_name: optStr,
  shipping_cost_in: z.number().min(0),
  packaging_cost: z.number().min(0),
  authentication_cost: z.number().min(0),
  other_costs: z.number().min(0),
  notes: z.string().trim().max(2000).optional(),
});

export type PurchaseFormInput = z.input<typeof purchaseFormSchema>;

export const newArticleSchema = z.object({
  article: articleFormSchema,
  purchase: purchaseFormSchema,
});

export type NewArticleInput = z.input<typeof newArticleSchema>;

/** Helper: convert empty/undefined strings to null for DB writes. */
export function nullify(s: string | null | undefined): string | null {
  if (!s) return null;
  const trimmed = s.trim();
  return trimmed === "" ? null : trimmed;
}
