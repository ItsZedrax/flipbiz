import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;
export type Article = Tables<"articles">;
export type Purchase = Tables<"purchases">;
export type Sale = Tables<"sales">;
export type Expense = Tables<"expenses">;
export type AuditLog = Tables<"audit_log">;

export type ArticleWithProfit = Article & {
  purchase: Purchase | null;
  sale: Sale | null;
  net_profit: number | null;
  total_cost: number | null;
  roi_pct: number | null;
  days_held: number | null;
};

export type PurchaseWithBuyer = Purchase & {
  buyer: Pick<Profile, "id" | "username" | "full_name" | "color">;
  article: Pick<Article, "id" | "name" | "category" | "photos">;
};

export type SaleWithSeller = Sale & {
  seller: Pick<Profile, "id" | "username" | "full_name" | "color">;
  article: Pick<Article, "id" | "name" | "category" | "photos">;
};
