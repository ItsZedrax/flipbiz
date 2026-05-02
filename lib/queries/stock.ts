import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type ArticleRow = Tables<"articles">;
type ProfileRow = Tables<"profiles">;

export type AgingTier = "fresh" | "warming" | "stale";

export type StockItem = Pick<
  ArticleRow,
  "id" | "name" | "brand" | "category" | "size" | "photos" | "status"
> & {
  buyer: Pick<ProfileRow, "id" | "username" | "full_name" | "color"> | null;
  purchase_date: string | null;
  total_cost: number | null;
  days_held: number | null;
  aging: AgingTier;
};

export type StockKpis = {
  totalCount: number;
  totalValue: number;
  avgDaysHeld: number;
  agingBreakdown: { fresh: number; warming: number; stale: number };
};

export type StockData = {
  items: StockItem[];
  kpis: StockKpis;
};

const num = (v: number | string | null | undefined): number =>
  v == null ? 0 : typeof v === "string" ? parseFloat(v) : v;

function tierForDays(days: number | null): AgingTier {
  if (days == null) return "fresh";
  if (days >= 60) return "stale";
  if (days >= 30) return "warming";
  return "fresh";
}

export type StockSort =
  | "days_desc"
  | "days_asc"
  | "cost_desc"
  | "cost_asc"
  | "name_asc"
  | "name_desc";

export async function getStockData(
  sort: StockSort = "days_desc",
): Promise<StockData> {
  const supabase = createClient();

  const articlesRes = await supabase
    .from("articles")
    .select("id, name, brand, category, size, photos, status, created_by, created_at")
    .eq("status", "in_stock")
    .order("created_at", { ascending: false });

  const articles = articlesRes.data ?? [];
  if (articles.length === 0) {
    return {
      items: [],
      kpis: {
        totalCount: 0,
        totalValue: 0,
        avgDaysHeld: 0,
        agingBreakdown: { fresh: 0, warming: 0, stale: 0 },
      },
    };
  }

  const articleIds = articles.map((a) => a.id);
  const buyerIds = Array.from(new Set(articles.map((a) => a.created_by)));

  const [purchasesRes, profilesRes] = await Promise.all([
    supabase
      .from("purchases")
      .select(
        "article_id, buyer_id, purchase_date, purchase_price, shipping_cost_in, packaging_cost, authentication_cost, other_costs",
      )
      .in("article_id", articleIds),
    supabase
      .from("profiles")
      .select("id, username, full_name, color")
      .in("id", buyerIds),
  ]);

  const purchaseByArticle = new Map(
    (purchasesRes.data ?? []).map((p) => [p.article_id, p]),
  );
  const profileById = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );

  const today = new Date();
  const items: StockItem[] = articles.map((a) => {
    const p = purchaseByArticle.get(a.id);
    const totalCost = p
      ? Math.round(
          num(p.purchase_price) +
            num(p.shipping_cost_in) +
            num(p.packaging_cost) +
            num(p.authentication_cost) +
            num(p.other_costs),
        )
      : null;
    const purchaseDate = p?.purchase_date ?? null;
    const daysHeld = purchaseDate
      ? Math.floor(
          (today.getTime() - new Date(purchaseDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;
    return {
      id: a.id,
      name: a.name,
      brand: a.brand,
      category: a.category,
      size: a.size,
      photos: a.photos,
      status: a.status,
      buyer: p
        ? profileById.get(p.buyer_id) ?? null
        : profileById.get(a.created_by) ?? null,
      purchase_date: purchaseDate,
      total_cost: totalCost,
      days_held: daysHeld,
      aging: tierForDays(daysHeld),
    };
  });

  // Sort
  const sorted = [...items];
  switch (sort) {
    case "days_desc":
      sorted.sort((a, b) => (b.days_held ?? -1) - (a.days_held ?? -1));
      break;
    case "days_asc":
      sorted.sort((a, b) => (a.days_held ?? Infinity) - (b.days_held ?? Infinity));
      break;
    case "cost_desc":
      sorted.sort((a, b) => (b.total_cost ?? -1) - (a.total_cost ?? -1));
      break;
    case "cost_asc":
      sorted.sort((a, b) => (a.total_cost ?? Infinity) - (b.total_cost ?? Infinity));
      break;
    case "name_asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name_desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  // KPIs
  const totalValue = items.reduce((acc, i) => acc + (i.total_cost ?? 0), 0);
  const daysAcc = items
    .map((i) => i.days_held)
    .filter((d): d is number => d != null);
  const avgDaysHeld =
    daysAcc.length > 0
      ? Math.round(daysAcc.reduce((a, b) => a + b, 0) / daysAcc.length)
      : 0;
  const agingBreakdown = items.reduce(
    (acc, i) => {
      acc[i.aging]++;
      return acc;
    },
    { fresh: 0, warming: 0, stale: 0 },
  );

  return {
    items: sorted,
    kpis: {
      totalCount: items.length,
      totalValue: Math.round(totalValue),
      avgDaysHeld,
      agingBreakdown,
    },
  };
}
