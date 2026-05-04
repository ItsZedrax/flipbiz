import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ArticleProfitRow = Database["public"]["Views"]["article_profit"]["Row"];

export type DashboardKpis = {
  capitalInvested: number;
  monthRevenue: number;
  monthProfit: number;
  averageRoi: number;
  inStockCount: number;
  monthSalesCount: number;
  /** Month-to-date deltas vs the same period in the previous month (in %). */
  deltas: {
    monthRevenuePct: number | null;
    monthProfitPct: number | null;
    monthSalesCountPct: number | null;
  };
};

export type MonthlySeries = {
  monthKey: string;
  month: string;
  profit: number;
  invested: number;
  cashed: number;
};

export type CategoryShare = {
  category: string;
  count: number;
  value: number;
};

export type TopArticle = {
  id: string;
  name: string;
  category: string;
  netProfit: number;
  roiPct: number;
};

export type UserPerformance = {
  userId: string;
  username: string;
  fullName: string | null;
  color: string;
  bought: number;
  sold: number;
  profit: number;
};

export type RecentActivityItem = {
  id: string;
  type: "purchase" | "sale";
  date: string;
  amount: number;
  article: { id: string; name: string; category: string } | null;
  user: {
    id: string;
    username: string;
    fullName: string | null;
    color: string;
  } | null;
};

export type DashboardAlerts = {
  agingArticles: Array<{ id: string; name: string; daysHeld: number }>;
  noPhotoCount: number;
  profitGoal: number | null;
  monthProfit: number;
};

export type DashboardData = {
  kpis: DashboardKpis;
  profitSeries: MonthlySeries[];
  categoryStock: CategoryShare[];
  topArticles: TopArticle[];
  userPerformance: UserPerformance[];
  recentActivity: RecentActivityItem[];
  alerts: DashboardAlerts;
};

// ----- Date helpers -----
function startOfMonthISO(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

function startOfMonthsAgoISO(date: Date, monthsAgo: number): string {
  return new Date(date.getFullYear(), date.getMonth() - monthsAgo, 1)
    .toISOString()
    .slice(0, 10);
}

function daysAgoISO(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const num = (v: number | string | null | undefined): number =>
  v == null ? 0 : typeof v === "string" ? parseFloat(v) : v;

// ---------------------------------------------------------------------------

export async function getDashboardData(
  currentUserId: string,
): Promise<DashboardData> {
  const supabase = createClient();
  const now = new Date();
  const startOfMonth = startOfMonthISO(now);
  const startOf12 = startOfMonthsAgoISO(now, 11);
  const sixtyDaysAgo = daysAgoISO(now, 60);

  const [
    profitsRes,
    profilesRes,
    purchasesRes,
    salesRes,
    articlesRes,
    recentPurchasesRes,
    recentSalesRes,
  ] = await Promise.all([
    supabase.from("article_profit").select("*"),
    supabase
      .from("profiles")
      .select("id, username, full_name, color, monthly_profit_goal"),
    supabase
      .from("purchases")
      .select("article_id, buyer_id, purchase_date, purchase_price")
      .gte("purchase_date", startOf12),
    supabase
      .from("sales")
      .select("article_id, seller_id, sale_date, sale_price")
      .gte("sale_date", startOf12),
    supabase.from("articles").select("id, name, category, status, photos"),
    supabase
      .from("purchases")
      .select("id, article_id, buyer_id, created_at, purchase_price")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("sales")
      .select("id, article_id, seller_id, created_at, sale_price")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const profits: ArticleProfitRow[] = profitsRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const purchases12mo = purchasesRes.data ?? [];
  const sales12mo = salesRes.data ?? [];
  const articles = articlesRes.data ?? [];
  const recentPurchases = recentPurchasesRes.data ?? [];
  const recentSales = recentSalesRes.data ?? [];

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const articleById = new Map(articles.map((a) => [a.id, a]));

  // ===== KPIs =====
  const capitalInvested = profits
    .filter((p) => p.status === "in_stock")
    .reduce((acc, p) => acc + num(p.total_cost), 0);

  const inStockCount = profits.filter((p) => p.status === "in_stock").length;

  const monthSales = sales12mo.filter((s) => s.sale_date >= startOfMonth);
  const monthRevenue = monthSales.reduce(
    (acc, s) => acc + num(s.sale_price),
    0,
  );
  const monthSalesCount = monthSales.length;

  const monthProfit = profits
    .filter((p) => p.sale_date && p.sale_date >= startOfMonth)
    .reduce((acc, p) => acc + num(p.net_profit), 0);

  // ===== MTD vs previous month (same number of days into the month) =====
  const dayOfMonth = now.getDate(); // 1..31
  const startPrevMonth = startOfMonthsAgoISO(now, 1);
  const prevMtdEnd = (() => {
    // Same day of month last month, or last day of last month if shorter.
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfPrevMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
    ).getDate();
    const targetDay = Math.min(dayOfMonth, lastDayOfPrevMonth);
    return new Date(lastMonth.getFullYear(), lastMonth.getMonth(), targetDay)
      .toISOString()
      .slice(0, 10);
  })();

  const prevMtdSales = sales12mo.filter(
    (s) => s.sale_date >= startPrevMonth && s.sale_date <= prevMtdEnd,
  );
  const prevMtdRevenue = prevMtdSales.reduce(
    (acc, s) => acc + num(s.sale_price),
    0,
  );
  const prevMtdSalesCount = prevMtdSales.length;
  const prevMtdProfit = profits
    .filter(
      (p) =>
        p.sale_date && p.sale_date >= startPrevMonth && p.sale_date <= prevMtdEnd,
    )
    .reduce((acc, p) => acc + num(p.net_profit), 0);

  const pctDelta = (curr: number, prev: number): number | null => {
    if (prev === 0) return curr === 0 ? 0 : null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const sold = profits.filter((p) => p.roi_pct !== null);
  const averageRoi =
    sold.length > 0
      ? sold.reduce((acc, p) => acc + num(p.roi_pct), 0) / sold.length
      : 0;

  // ===== 12-month series (profit / invested / cashed) =====
  const monthMap = new Map<
    string,
    { profit: number; invested: number; cashed: number }
  >();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, { profit: 0, invested: 0, cashed: 0 });
  }

  for (const p of profits) {
    if (p.sale_date) {
      const key = p.sale_date.slice(0, 7);
      const slot = monthMap.get(key);
      if (slot) slot.profit += num(p.net_profit);
    }
  }
  for (const p of purchases12mo) {
    const key = p.purchase_date.slice(0, 7);
    const slot = monthMap.get(key);
    if (slot) slot.invested += num(p.purchase_price);
  }
  for (const s of sales12mo) {
    const key = s.sale_date.slice(0, 7);
    const slot = monthMap.get(key);
    if (slot) slot.cashed += num(s.sale_price);
  }

  const profitSeries: MonthlySeries[] = Array.from(monthMap.entries()).map(
    ([key, val]) => {
      const [y, m] = key.split("-").map(Number);
      const monthLabel = new Date(y!, m! - 1, 1).toLocaleDateString("fr-FR", {
        month: "short",
      });
      return {
        monthKey: key,
        month: `${monthLabel} ${String(y).slice(2)}`,
        profit: Math.round(val.profit),
        invested: Math.round(val.invested),
        cashed: Math.round(val.cashed),
      };
    },
  );

  // ===== Category stock =====
  const stockByCategory = new Map<string, { count: number; value: number }>();
  for (const p of profits) {
    if (p.status !== "in_stock" || !p.category) continue;
    const slot = stockByCategory.get(p.category) ?? { count: 0, value: 0 };
    slot.count += 1;
    slot.value += num(p.total_cost);
    stockByCategory.set(p.category, slot);
  }
  const categoryStock: CategoryShare[] = Array.from(
    stockByCategory.entries(),
  ).map(([category, v]) => ({
    category,
    count: v.count,
    value: Math.round(v.value),
  }));

  // ===== Top 5 articles by profit =====
  const topArticles: TopArticle[] = profits
    .filter(
      (p) => p.net_profit !== null && p.article_id && p.name && p.category,
    )
    .sort((a, b) => num(b.net_profit) - num(a.net_profit))
    .slice(0, 5)
    .map((p) => ({
      id: p.article_id!,
      name: p.name!,
      category: p.category!,
      netProfit: Math.round(num(p.net_profit)),
      roiPct: Math.round(num(p.roi_pct) * 10) / 10,
    }));

  // ===== User performance =====
  const userStats = new Map<
    string,
    { bought: number; sold: number; profit: number }
  >();
  for (const p of profits) {
    if (p.buyer_id) {
      const slot = userStats.get(p.buyer_id) ?? {
        bought: 0,
        sold: 0,
        profit: 0,
      };
      slot.bought += 1;
      userStats.set(p.buyer_id, slot);
    }
    if (p.seller_id) {
      const slot = userStats.get(p.seller_id) ?? {
        bought: 0,
        sold: 0,
        profit: 0,
      };
      slot.sold += 1;
      slot.profit += num(p.net_profit);
      userStats.set(p.seller_id, slot);
    }
  }

  const userPerformance: UserPerformance[] = profiles.map((p) => {
    const stats = userStats.get(p.id) ?? { bought: 0, sold: 0, profit: 0 };
    return {
      userId: p.id,
      username: p.username,
      fullName: p.full_name,
      color: p.color,
      bought: stats.bought,
      sold: stats.sold,
      profit: Math.round(stats.profit),
    };
  });

  // ===== Recent activity =====
  const recentActivity: RecentActivityItem[] = [
    ...recentPurchases.map((p): RecentActivityItem => {
      const a = articleById.get(p.article_id);
      const u = profileById.get(p.buyer_id);
      return {
        id: `p-${p.id}`,
        type: "purchase",
        date: p.created_at,
        amount: num(p.purchase_price),
        article: a
          ? { id: a.id, name: a.name, category: a.category }
          : null,
        user: u
          ? {
              id: u.id,
              username: u.username,
              fullName: u.full_name,
              color: u.color,
            }
          : null,
      };
    }),
    ...recentSales.map((s): RecentActivityItem => {
      const a = articleById.get(s.article_id);
      const u = profileById.get(s.seller_id);
      return {
        id: `s-${s.id}`,
        type: "sale",
        date: s.created_at,
        amount: num(s.sale_price),
        article: a
          ? { id: a.id, name: a.name, category: a.category }
          : null,
        user: u
          ? {
              id: u.id,
              username: u.username,
              fullName: u.full_name,
              color: u.color,
            }
          : null,
      };
    }),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  // ===== Alerts =====
  const agingArticles = profits
    .filter(
      (p) =>
        p.status === "in_stock" &&
        p.purchase_date &&
        p.purchase_date <= sixtyDaysAgo,
    )
    .map((p) => {
      const days = Math.floor(
        (now.getTime() - new Date(p.purchase_date!).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return {
        id: p.article_id!,
        name: p.name ?? "—",
        daysHeld: days,
      };
    })
    .sort((a, b) => b.daysHeld - a.daysHeld)
    .slice(0, 5);

  const noPhotoCount = articles.filter(
    (a) => a.status === "in_stock" && (a.photos?.length ?? 0) === 0,
  ).length;

  const profitGoal = profileById.get(currentUserId)?.monthly_profit_goal ?? null;

  return {
    kpis: {
      capitalInvested: Math.round(capitalInvested),
      monthRevenue: Math.round(monthRevenue),
      monthProfit: Math.round(monthProfit),
      averageRoi: Math.round(averageRoi * 10) / 10,
      inStockCount,
      monthSalesCount,
      deltas: {
        monthRevenuePct: pctDelta(monthRevenue, prevMtdRevenue),
        monthProfitPct: pctDelta(monthProfit, prevMtdProfit),
        monthSalesCountPct: pctDelta(monthSalesCount, prevMtdSalesCount),
      },
    },
    profitSeries,
    categoryStock,
    topArticles,
    userPerformance,
    recentActivity,
    alerts: {
      agingArticles,
      noPhotoCount,
      profitGoal,
      monthProfit: Math.round(monthProfit),
    },
  };
}
