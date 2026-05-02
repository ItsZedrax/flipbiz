import { createClient } from "@/lib/supabase/server";
import type { Database, Tables } from "@/types/database";

type ArticleRow = Tables<"articles">;
type PurchaseRow = Tables<"purchases">;
type SaleRow = Tables<"sales">;
type ProfileRow = Tables<"profiles">;
type AuditLogRow = Tables<"audit_log">;

export type ArticleSort =
  | "created_at:desc"
  | "created_at:asc"
  | "name:asc"
  | "name:desc"
  | "price:desc"
  | "price:asc"
  | "profit:desc"
  | "profit:asc";

export type ArticleFilters = {
  search?: string;
  category?: Database["public"]["Enums"]["article_category"];
  status?: Database["public"]["Enums"]["article_status"];
  condition?: Database["public"]["Enums"]["article_condition"];
  buyerId?: string;
  priceMin?: number;
  priceMax?: number;
};

export type ArticleListItem = ArticleRow & {
  purchase_price: number | null;
  total_cost: number | null;
  sale_price: number | null;
  net_profit: number | null;
  roi_pct: number | null;
  buyer: Pick<ProfileRow, "id" | "username" | "full_name" | "color"> | null;
};

export type ArticleListResult = {
  items: ArticleListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

const num = (v: number | string | null | undefined): number | null =>
  v == null ? null : typeof v === "string" ? parseFloat(v) : v;

// ---------------------------------------------------------------------------

export async function getArticles({
  filters = {},
  sort = "created_at:desc",
  page = 1,
  perPage = 20,
}: {
  filters?: ArticleFilters;
  sort?: ArticleSort;
  page?: number;
  perPage?: number;
}): Promise<ArticleListResult> {
  const supabase = createClient();

  // 1. Get articles with filters/pagination (without sort by profit/price since those live in purchases/profit view)
  let query = supabase
    .from("articles")
    .select("*", { count: "exact" });

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.buyerId) query = query.eq("created_by", filters.buyerId);
  if (filters.search) {
    const s = filters.search.replace(/[%,]/g, "");
    query = query.or(`name.ilike.%${s}%,brand.ilike.%${s}%,reference.ilike.%${s}%`);
  }

  // Server-side sort for "name" and "created_at" on articles table
  if (sort.startsWith("name") || sort.startsWith("created_at")) {
    const [col, dir] = sort.split(":");
    query = query.order(col!, { ascending: dir === "asc" });
  } else {
    // Default ordering when sorting by profit/price (we'll re-sort in JS)
    query = query.order("created_at", { ascending: false });
  }

  // For price/profit sorts we need everything, can't paginate at DB level easily.
  // Trade-off: fetch all matching, sort in JS, slice. OK while volume stays low.
  const sortByDerived = sort.startsWith("price") || sort.startsWith("profit");

  if (!sortByDerived) {
    query = query.range((page - 1) * perPage, page * perPage - 1);
  }

  const articlesRes = await query;
  if (articlesRes.error) throw articlesRes.error;

  const articles = articlesRes.data ?? [];
  const totalUnfiltered = articlesRes.count ?? 0;
  const articleIds = articles.map((a) => a.id);

  if (articleIds.length === 0) {
    return {
      items: [],
      total: totalUnfiltered,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(totalUnfiltered / perPage)),
    };
  }

  // 2. Fetch profits + buyer profiles in parallel
  const [profitsRes, profilesRes, purchasesRes] = await Promise.all([
    supabase
      .from("article_profit")
      .select(
        "article_id, purchase_price, total_cost, sale_price, net_profit, roi_pct",
      )
      .in("article_id", articleIds),
    supabase
      .from("profiles")
      .select("id, username, full_name, color")
      .in(
        "id",
        Array.from(new Set(articles.map((a) => a.created_by))),
      ),
    // Apply price filters on the purchases of these articles, then re-filter article list
    filters.priceMin !== undefined || filters.priceMax !== undefined
      ? (() => {
          let q = supabase
            .from("purchases")
            .select("article_id, purchase_price")
            .in("article_id", articleIds);
          if (filters.priceMin !== undefined)
            q = q.gte("purchase_price", filters.priceMin);
          if (filters.priceMax !== undefined)
            q = q.lte("purchase_price", filters.priceMax);
          return q;
        })()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const profitByArticleId = new Map(
    (profitsRes.data ?? []).map((p) => [p.article_id, p]),
  );
  const profileById = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );

  let items: ArticleListItem[] = articles.map((a) => {
    const p = profitByArticleId.get(a.id);
    return {
      ...a,
      purchase_price: num(p?.purchase_price ?? null),
      total_cost: num(p?.total_cost ?? null),
      sale_price: num(p?.sale_price ?? null),
      net_profit: num(p?.net_profit ?? null),
      roi_pct: num(p?.roi_pct ?? null),
      buyer: profileById.get(a.created_by) ?? null,
    };
  });

  // Apply price filter post-hoc (purchases match list)
  if (purchasesRes.data) {
    const allowed = new Set(purchasesRes.data.map((p) => p.article_id));
    items = items.filter((i) => allowed.has(i.id));
  }

  // Apply derived-column sort + pagination in JS
  if (sortByDerived) {
    const [col, dir] = sort.split(":") as [string, "asc" | "desc"];
    const key = col === "price" ? "purchase_price" : "net_profit";
    items.sort((a, b) => {
      const av = a[key as keyof ArticleListItem] as number | null;
      const bv = b[key as keyof ArticleListItem] as number | null;
      const an = av ?? -Infinity;
      const bn = bv ?? -Infinity;
      return dir === "asc" ? an - bn : bn - an;
    });

    const start = (page - 1) * perPage;
    const total = items.length;
    items = items.slice(start, start + perPage);
    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  return {
    items,
    total: totalUnfiltered,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(totalUnfiltered / perPage)),
  };
}

// ---------------------------------------------------------------------------

export type ArticleDetail = {
  article: ArticleRow;
  creator: Pick<ProfileRow, "id" | "username" | "full_name" | "color"> | null;
  purchase: PurchaseRow | null;
  buyer: Pick<ProfileRow, "id" | "username" | "full_name" | "color"> | null;
  sale: SaleRow | null;
  seller: Pick<ProfileRow, "id" | "username" | "full_name" | "color"> | null;
  totalCost: number | null;
  netProfit: number | null;
  roiPct: number | null;
  daysHeld: number | null;
  history: AuditLogRow[];
};

export async function getArticleById(id: string): Promise<ArticleDetail | null> {
  const supabase = createClient();

  const [articleRes, purchaseRes, saleRes, profitRes, historyRes, profilesRes] =
    await Promise.all([
      supabase.from("articles").select("*").eq("id", id).maybeSingle(),
      supabase.from("purchases").select("*").eq("article_id", id).maybeSingle(),
      supabase.from("sales").select("*").eq("article_id", id).maybeSingle(),
      supabase
        .from("article_profit")
        .select("total_cost, net_profit, roi_pct, days_held")
        .eq("article_id", id)
        .maybeSingle(),
      supabase
        .from("audit_log")
        .select("*")
        .or(`record_id.eq.${id},and(table_name.eq.purchases,record_id.in.(${id}))`)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("profiles").select("id, username, full_name, color"),
    ]);

  if (!articleRes.data) return null;
  const article = articleRes.data;
  const purchase = purchaseRes.data;
  const sale = saleRes.data;
  const profit = profitRes.data;

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );

  return {
    article,
    creator: profileMap.get(article.created_by) ?? null,
    purchase,
    buyer: purchase ? profileMap.get(purchase.buyer_id) ?? null : null,
    sale,
    seller: sale ? profileMap.get(sale.seller_id) ?? null : null,
    totalCost: num(profit?.total_cost ?? null),
    netProfit: num(profit?.net_profit ?? null),
    roiPct: num(profit?.roi_pct ?? null),
    daysHeld: profit?.days_held ?? null,
    history: historyRes.data ?? [],
  };
}
