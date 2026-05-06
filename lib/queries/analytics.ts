import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ArticleCategory = Database["public"]["Enums"]["article_category"];

export type AnalyticsPeriod = "7d" | "30d" | "3m" | "6m" | "12m" | "all";

export type AnalyticsKpis = {
  revenue: number;
  profit: number;
  avgRoi: number;
  marginPct: number;
  salesCount: number;
  unitsBought: number;
  capitalSpent: number;
};

export type UserStat = {
  userId: string;
  username: string;
  fullName: string | null;
  color: string;
  bought: number;
  spent: number;
  sold: number;
  revenue: number;
  profit: number;
};

export type CategoryStat = {
  category: ArticleCategory;
  salesCount: number;
  revenue: number;
  profit: number;
  avgRoi: number;
  avgDaysHeld: number;
};

export type PlatformStat = {
  platform: string;
  salesCount: number;
  revenue: number;
  profit: number;
};

export type ScatterPoint = {
  id: string;
  name: string;
  category: ArticleCategory;
  cost: number;
  profit: number;
  roi: number;
  days: number;
};

export type AnalyticsData = {
  period: AnalyticsPeriod;
  from: string | null;
  to: string;
  kpis: AnalyticsKpis;
  userStats: UserStat[];
  categoryStats: CategoryStat[];
  platformStats: PlatformStat[];
  scatter: ScatterPoint[];
};

export type DailyActivity = {
  /** YYYY-MM-DD */
  date: string;
  profit: number;
  salesCount: number;
};

const num = (v: number | string | null | undefined): number =>
  v == null ? 0 : typeof v === "string" ? parseFloat(v) : v;

/**
 * Daily profit + sale count for the last 365 days, used by the calendar
 * heatmap on Analytics. Independent from the page's period selector.
 */
export async function getDailyActivity(): Promise<DailyActivity[]> {
  const supabase = createClient();
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  const startISO = start.toISOString().slice(0, 10);

  const { data: profits } = await supabase
    .from("article_profit")
    .select("sale_date, net_profit")
    .gte("sale_date", startISO)
    .lte("sale_date", todayISO);

  const map = new Map<string, { profit: number; salesCount: number }>();
  for (const p of profits ?? []) {
    if (!p.sale_date) continue;
    const key = p.sale_date.slice(0, 10);
    const slot = map.get(key) ?? { profit: 0, salesCount: 0 };
    slot.profit += num(p.net_profit);
    slot.salesCount += 1;
    map.set(key, slot);
  }

  // Build a continuous 365-day series from start → today.
  const out: DailyActivity[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().slice(0, 10);
    const slot = map.get(key) ?? { profit: 0, salesCount: 0 };
    out.push({
      date: key,
      profit: Math.round(slot.profit),
      salesCount: slot.salesCount,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function rangeFor(period: AnalyticsPeriod): {
  from: string | null;
  to: string;
} {
  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  if (period === "all") return { from: null, to: todayISO };

  const days =
    period === "7d"
      ? 7
      : period === "30d"
        ? 30
        : period === "3m"
          ? 90
          : period === "6m"
            ? 180
            : 365;
  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - days);
  return { from: fromDate.toISOString().slice(0, 10), to: todayISO };
}

export async function getAnalyticsData(
  period: AnalyticsPeriod = "30d",
): Promise<AnalyticsData> {
  const supabase = createClient();
  const { from, to } = rangeFor(period);

  // 1. Sales filtered by period
  let salesQuery = supabase.from("sales").select("*").lte("sale_date", to);
  if (from) salesQuery = salesQuery.gte("sale_date", from);

  // 2. Purchases filtered by period (for "bought" stats)
  let purchasesPeriodQuery = supabase
    .from("purchases")
    .select("article_id, buyer_id, purchase_date, purchase_price, shipping_cost_in, packaging_cost, authentication_cost, other_costs")
    .lte("purchase_date", to);
  if (from) purchasesPeriodQuery = purchasesPeriodQuery.gte("purchase_date", from);

  // 3. ALL purchases (for cost lookup of period's sold articles)
  const allPurchasesQuery = supabase
    .from("purchases")
    .select("article_id, purchase_price, shipping_cost_in, packaging_cost, authentication_cost, other_costs, purchase_date");

  const articlesQuery = supabase
    .from("articles")
    .select("id, name, category");

  const profilesQuery = supabase
    .from("profiles")
    .select("id, username, full_name, color");

  const [salesRes, purchasesPeriodRes, allPurchasesRes, articlesRes, profilesRes] =
    await Promise.all([
      salesQuery,
      purchasesPeriodQuery,
      allPurchasesQuery,
      articlesQuery,
      profilesQuery,
    ]);

  const sales = salesRes.data ?? [];
  const purchasesPeriod = purchasesPeriodRes.data ?? [];
  const allPurchases = allPurchasesRes.data ?? [];
  const articles = articlesRes.data ?? [];
  const profiles = profilesRes.data ?? [];

  const articleById = new Map(articles.map((a) => [a.id, a]));
  const costByArticle = new Map<string, { cost: number; date: string }>();
  for (const p of allPurchases) {
    costByArticle.set(p.article_id, {
      cost:
        num(p.purchase_price) +
        num(p.shipping_cost_in) +
        num(p.packaging_cost) +
        num(p.authentication_cost) +
        num(p.other_costs),
      date: p.purchase_date,
    });
  }

  // ===== KPIs =====
  let revenue = 0;
  let profit = 0;
  let roiSum = 0;
  let roiCount = 0;
  for (const s of sales) {
    const netRev =
      num(s.sale_price) -
      num(s.shipping_cost_out) -
      num(s.platform_fees_amount) -
      num(s.other_fees);
    const cost = costByArticle.get(s.article_id)?.cost ?? null;
    revenue += netRev;
    if (cost != null) {
      const p = netRev - cost;
      profit += p;
      if (cost > 0) {
        roiSum += (p / cost) * 100;
        roiCount++;
      }
    }
  }
  const avgRoi = roiCount > 0 ? roiSum / roiCount : 0;
  const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;

  const unitsBought = purchasesPeriod.length;
  const capitalSpent = purchasesPeriod.reduce(
    (acc, p) =>
      acc +
      num(p.purchase_price) +
      num(p.shipping_cost_in) +
      num(p.packaging_cost) +
      num(p.authentication_cost) +
      num(p.other_costs),
    0,
  );

  // ===== Per-user stats =====
  const userStatsMap = new Map<
    string,
    Omit<UserStat, "userId" | "username" | "fullName" | "color">
  >();
  function userSlot(id: string) {
    let s = userStatsMap.get(id);
    if (!s) {
      s = { bought: 0, spent: 0, sold: 0, revenue: 0, profit: 0 };
      userStatsMap.set(id, s);
    }
    return s;
  }
  for (const p of purchasesPeriod) {
    const slot = userSlot(p.buyer_id);
    slot.bought++;
    slot.spent +=
      num(p.purchase_price) +
      num(p.shipping_cost_in) +
      num(p.packaging_cost) +
      num(p.authentication_cost) +
      num(p.other_costs);
  }
  for (const s of sales) {
    const slot = userSlot(s.seller_id);
    slot.sold++;
    const netRev =
      num(s.sale_price) -
      num(s.shipping_cost_out) -
      num(s.platform_fees_amount) -
      num(s.other_fees);
    const cost = costByArticle.get(s.article_id)?.cost ?? null;
    slot.revenue += netRev;
    if (cost != null) slot.profit += netRev - cost;
  }
  const userStats: UserStat[] = profiles
    .map((p) => {
      const slot = userStatsMap.get(p.id) ?? {
        bought: 0,
        spent: 0,
        sold: 0,
        revenue: 0,
        profit: 0,
      };
      return {
        userId: p.id,
        username: p.username,
        fullName: p.full_name,
        color: p.color,
        bought: slot.bought,
        spent: Math.round(slot.spent),
        sold: slot.sold,
        revenue: Math.round(slot.revenue),
        profit: Math.round(slot.profit),
      };
    })
    .sort((a, b) => b.profit - a.profit);

  // ===== Per-category stats =====
  const catMap = new Map<
    ArticleCategory,
    {
      salesCount: number;
      revenue: number;
      profit: number;
      roiSum: number;
      roiCount: number;
      daysSum: number;
      daysCount: number;
    }
  >();
  for (const s of sales) {
    const a = articleById.get(s.article_id);
    if (!a) continue;
    let slot = catMap.get(a.category);
    if (!slot) {
      slot = {
        salesCount: 0,
        revenue: 0,
        profit: 0,
        roiSum: 0,
        roiCount: 0,
        daysSum: 0,
        daysCount: 0,
      };
      catMap.set(a.category, slot);
    }
    const netRev =
      num(s.sale_price) -
      num(s.shipping_cost_out) -
      num(s.platform_fees_amount) -
      num(s.other_fees);
    const costEntry = costByArticle.get(s.article_id);
    slot.salesCount++;
    slot.revenue += netRev;
    if (costEntry) {
      const p = netRev - costEntry.cost;
      slot.profit += p;
      if (costEntry.cost > 0) {
        slot.roiSum += (p / costEntry.cost) * 100;
        slot.roiCount++;
      }
      const days = Math.max(
        0,
        Math.floor(
          (new Date(s.sale_date).getTime() -
            new Date(costEntry.date).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      slot.daysSum += days;
      slot.daysCount++;
    }
  }
  const categoryStats: CategoryStat[] = Array.from(catMap.entries())
    .map(([category, v]) => ({
      category,
      salesCount: v.salesCount,
      revenue: Math.round(v.revenue),
      profit: Math.round(v.profit),
      avgRoi: v.roiCount > 0 ? Math.round((v.roiSum / v.roiCount) * 10) / 10 : 0,
      avgDaysHeld: v.daysCount > 0 ? Math.round(v.daysSum / v.daysCount) : 0,
    }))
    .sort((a, b) => b.profit - a.profit);

  // ===== Per-platform stats =====
  const platMap = new Map<
    string,
    { salesCount: number; revenue: number; profit: number }
  >();
  for (const s of sales) {
    const key = s.sale_platform ?? "—";
    let slot = platMap.get(key);
    if (!slot) {
      slot = { salesCount: 0, revenue: 0, profit: 0 };
      platMap.set(key, slot);
    }
    const netRev =
      num(s.sale_price) -
      num(s.shipping_cost_out) -
      num(s.platform_fees_amount) -
      num(s.other_fees);
    const costEntry = costByArticle.get(s.article_id);
    slot.salesCount++;
    slot.revenue += netRev;
    if (costEntry) slot.profit += netRev - costEntry.cost;
  }
  const platformStats: PlatformStat[] = Array.from(platMap.entries())
    .map(([platform, v]) => ({
      platform,
      salesCount: v.salesCount,
      revenue: Math.round(v.revenue),
      profit: Math.round(v.profit),
    }))
    .sort((a, b) => b.profit - a.profit);

  // ===== Scatter: cost vs profit per sold article =====
  const scatter: ScatterPoint[] = [];
  for (const s of sales) {
    const a = articleById.get(s.article_id);
    const costEntry = costByArticle.get(s.article_id);
    if (!a || !costEntry) continue;
    const netRev =
      num(s.sale_price) -
      num(s.shipping_cost_out) -
      num(s.platform_fees_amount) -
      num(s.other_fees);
    const profit = netRev - costEntry.cost;
    const roi = costEntry.cost > 0 ? (profit / costEntry.cost) * 100 : 0;
    const days = Math.max(
      0,
      Math.floor(
        (new Date(s.sale_date).getTime() -
          new Date(costEntry.date).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    scatter.push({
      id: a.id,
      name: a.name,
      category: a.category,
      cost: Math.round(costEntry.cost),
      profit: Math.round(profit),
      roi: Math.round(roi * 10) / 10,
      days,
    });
  }

  return {
    period,
    from,
    to,
    kpis: {
      revenue: Math.round(revenue),
      profit: Math.round(profit),
      avgRoi: Math.round(avgRoi * 10) / 10,
      marginPct: Math.round(marginPct * 10) / 10,
      salesCount: sales.length,
      unitsBought,
      capitalSpent: Math.round(capitalSpent),
    },
    userStats,
    categoryStats,
    platformStats,
    scatter,
  };
}
