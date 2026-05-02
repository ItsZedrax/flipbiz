import { z } from "zod";

const optStr = z.string().trim().max(200).optional();

export const saleFormSchema = z
  .object({
    article_id: z.string().uuid("Article requis"),
    seller_id: z.string().uuid("Vendeur requis"),
    sale_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format AAAA-MM-JJ"),
    sale_price: z
      .number({ error: "Doit être un nombre" })
      .min(0, "Doit être positif"),
    sale_platform: optStr,
    buyer_name: optStr,
    shipping_cost_out: z.number().min(0),
    platform_fees_pct: z.number().min(0).max(100),
    platform_fees_amount: z.number().min(0),
    other_fees: z.number().min(0),
    payment_method: optStr,
    tracking_number: optStr,
    notes: z.string().trim().max(2000).optional(),
  });

export type SaleFormInput = z.input<typeof saleFormSchema>;

/** Helper: convert empty/undefined strings to null for DB writes. */
export function nullify(s: string | null | undefined): string | null {
  if (!s) return null;
  const trimmed = s.trim();
  return trimmed === "" ? null : trimmed;
}
