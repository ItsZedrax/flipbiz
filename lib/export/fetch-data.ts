import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  color: string;
};

export type ExportData = {
  periodLabel: string;
  from: string | null;
  to: string;
  profiles: Profile[];
  articles: Array<
    Pick<
      Database["public"]["Tables"]["articles"]["Row"],
      | "id"
      | "name"
      | "brand"
      | "reference"
      | "category"
      | "size"
      | "colorway"
      | "condition"
      | "status"
      | "tags"
      | "created_at"
    > & {
      purchase: Database["public"]["Tables"]["purchases"]["Row"] | null;
      sale: Database["public"]["Tables"]["sales"]["Row"] | null;
      buyer: Profile | null;
      seller: Profile | null;
      total_cost: number;
      net_revenue: number | null;
      net_profit: number | null;
      roi_pct: number | null;
    }
  >;
  expenses: Array<
    Database["public"]["Tables"]["expenses"]["Row"] & { user: Profile | null }
  >;
};

const num = (v: number | string | null | undefined): number =>
  v == null ? 0 : typeof v === "string" ? parseFloat(v) : v;

export type ExportPeriod = "30d" | "3m" | "6m" | "12m" | "all";

function rangeFor(period: ExportPeriod): {
  from: string | null;
  to: string;
  label: string;
} {
  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  if (period === "all")
    return { from: null, to: todayISO, label: "Tout l'historique" };

  const days =
    period === "30d"
      ? 30
      : period === "3m"
        ? 90
        : period === "6m"
          ? 180
          : 365;
  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - days);
  const fromISO = fromDate.toISOString().slice(0, 10);

  const labels: Record<ExportPeriod, string> = {
    "30d": "30 derniers jours",
    "3m": "3 derniers mois",
    "6m": "6 derniers mois",
    "12m": "12 derniers mois",
    all: "Tout",
  };
  return { from: fromISO, to: todayISO, label: labels[period] };
}

/**
 * Fetch all data needed for export (Excel/PDF).
 * - The article list is filtered by purchase_date if from is set.
 * - Expenses are filtered by date if from is set.
 */
export async function fetchExportData(
  period: ExportPeriod = "12m",
): Promise<ExportData> {
  const supabase = createClient();
  const { from, to, label } = rangeFor(period);

  // ---- Profiles (always all) ----
  const profilesRes = await supabase
    .from("profiles")
    .select("id, username, full_name, color")
    .order("username");
  const profiles: Profile[] = profilesRes.data ?? [];
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  // ---- Purchases in period ----
  let purchasesQuery = supabase
    .from("purchases")
    .select("*")
    .lte("purchase_date", to);
  if (from) purchasesQuery = purchasesQuery.gte("purchase_date", from);
  const purchasesRes = await purchasesQuery;
  const purchases = purchasesRes.data ?? [];

  // ---- Article ids: union of (period-purchases) + (period-sales) ----
  let salesQuery = supabase.from("sales").select("*").lte("sale_date", to);
  if (from) salesQuery = salesQuery.gte("sale_date", from);
  const salesRes = await salesQuery;
  const sales = salesRes.data ?? [];

  const articleIdSet = new Set<string>();
  for (const p of purchases) articleIdSet.add(p.article_id);
  for (const s of sales) articleIdSet.add(s.article_id);
  const articleIds = Array.from(articleIdSet);

  let articles: Database["public"]["Tables"]["articles"]["Row"][] = [];
  if (articleIds.length > 0) {
    const articlesRes = await supabase
      .from("articles")
      .select("*")
      .in("id", articleIds);
    articles = articlesRes.data ?? [];
  }

  // For sales whose article's purchase is OUTSIDE the period, we still want
  // the cost. Fetch ALL purchases for these article IDs.
  let extraPurchases: Database["public"]["Tables"]["purchases"]["Row"][] = [];
  if (articleIds.length > 0) {
    const extraRes = await supabase
      .from("purchases")
      .select("*")
      .in("article_id", articleIds);
    extraPurchases = extraRes.data ?? [];
  }
  const purchaseByArticle = new Map(
    extraPurchases.map((p) => [p.article_id, p]),
  );
  const saleByArticle = new Map(sales.map((s) => [s.article_id, s]));

  // ---- Expenses in period ----
  let expensesQuery = supabase.from("expenses").select("*").lte("date", to);
  if (from) expensesQuery = expensesQuery.gte("date", from);
  const expensesRes = await expensesQuery;
  const rawExpenses = expensesRes.data ?? [];
  const expenses = rawExpenses.map((e) => ({
    ...e,
    user: profileById.get(e.user_id) ?? null,
  }));

  // ---- Compose articles ----
  const composed = articles.map((a) => {
    const purchase = purchaseByArticle.get(a.id) ?? null;
    const sale = saleByArticle.get(a.id) ?? null;
    const totalCost = purchase
      ? num(purchase.purchase_price) +
        num(purchase.shipping_cost_in) +
        num(purchase.packaging_cost) +
        num(purchase.authentication_cost) +
        num(purchase.other_costs)
      : 0;
    const netRevenue = sale
      ? num(sale.sale_price) -
        num(sale.shipping_cost_out) -
        num(sale.platform_fees_amount) -
        num(sale.other_fees)
      : null;
    const netProfit = netRevenue != null ? netRevenue - totalCost : null;
    const roiPct =
      netProfit != null && totalCost > 0 ? (netProfit / totalCost) * 100 : null;
    return {
      id: a.id,
      name: a.name,
      brand: a.brand,
      reference: a.reference,
      category: a.category,
      size: a.size,
      colorway: a.colorway,
      condition: a.condition,
      status: a.status,
      tags: a.tags,
      created_at: a.created_at,
      purchase,
      sale,
      buyer: purchase ? profileById.get(purchase.buyer_id) ?? null : null,
      seller: sale ? profileById.get(sale.seller_id) ?? null : null,
      total_cost: Math.round(totalCost),
      net_revenue: netRevenue != null ? Math.round(netRevenue) : null,
      net_profit: netProfit != null ? Math.round(netProfit) : null,
      roi_pct: roiPct != null ? Math.round(roiPct * 10) / 10 : null,
    };
  });

  return {
    periodLabel: label,
    from,
    to,
    profiles,
    articles: composed,
    expenses,
  };
}
