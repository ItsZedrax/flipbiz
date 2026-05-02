import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type SaleRow = Tables<"sales">;
type ArticleRow = Tables<"articles">;
type PurchaseRow = Tables<"purchases">;
type ProfileRow = Tables<"profiles">;

export type SaleFilters = {
  search?: string;
  sellerId?: string;
  platform?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type SaleListItem = SaleRow & {
  article: Pick<ArticleRow, "id" | "name" | "category" | "photos"> | null;
  seller: Pick<ProfileRow, "id" | "username" | "full_name" | "color"> | null;
  net_revenue: number;
  net_profit: number | null;
  total_cost: number | null;
};

export type SaleListResult = {
  items: SaleListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

const num = (v: number | string | null | undefined): number =>
  v == null ? 0 : typeof v === "string" ? parseFloat(v) : v;

export async function getSales({
  filters = {},
  page = 1,
  perPage = 20,
}: {
  filters?: SaleFilters;
  page?: number;
  perPage?: number;
}): Promise<SaleListResult> {
  const supabase = createClient();

  let q = supabase
    .from("sales")
    .select("*", { count: "exact" })
    .order("sale_date", { ascending: false });

  if (filters.sellerId) q = q.eq("seller_id", filters.sellerId);
  if (filters.platform) q = q.eq("sale_platform", filters.platform);
  if (filters.dateFrom) q = q.gte("sale_date", filters.dateFrom);
  if (filters.dateTo) q = q.lte("sale_date", filters.dateTo);

  if (filters.search) {
    const s = filters.search.replace(/[%,]/g, "");
    const articleSearch = await supabase
      .from("articles")
      .select("id")
      .or(`name.ilike.%${s}%,brand.ilike.%${s}%,reference.ilike.%${s}%`);
    const allowed = new Set((articleSearch.data ?? []).map((a) => a.id));
    if (allowed.size === 0) {
      return { items: [], total: 0, page, perPage, totalPages: 1 };
    }
    q = q.in("article_id", Array.from(allowed));
  }

  q = q.range((page - 1) * perPage, page * perPage - 1);

  const salesRes = await q;
  if (salesRes.error) throw salesRes.error;

  const sales = salesRes.data ?? [];
  const total = salesRes.count ?? 0;

  if (sales.length === 0) {
    return {
      items: [],
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  const articleIds = Array.from(new Set(sales.map((s) => s.article_id)));
  const sellerIds = Array.from(new Set(sales.map((s) => s.seller_id)));

  const [articlesRes, profilesRes, purchasesRes] = await Promise.all([
    supabase
      .from("articles")
      .select("id, name, category, photos")
      .in("id", articleIds),
    supabase
      .from("profiles")
      .select("id, username, full_name, color")
      .in("id", sellerIds),
    // Pull related purchases to compute net profit
    supabase
      .from("purchases")
      .select(
        "article_id, purchase_price, shipping_cost_in, packaging_cost, authentication_cost, other_costs",
      )
      .in("article_id", articleIds),
  ]);

  const articleById = new Map(
    (articlesRes.data ?? []).map((a) => [a.id, a]),
  );
  const profileById = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );
  const costByArticle = new Map<string, number>();
  for (const p of purchasesRes.data ?? []) {
    costByArticle.set(
      p.article_id,
      num(p.purchase_price) +
        num(p.shipping_cost_in) +
        num(p.packaging_cost) +
        num(p.authentication_cost) +
        num(p.other_costs),
    );
  }

  const items: SaleListItem[] = sales.map((s) => {
    const netRevenue =
      num(s.sale_price) -
      num(s.shipping_cost_out) -
      num(s.platform_fees_amount) -
      num(s.other_fees);
    const totalCost = costByArticle.get(s.article_id) ?? null;
    return {
      ...s,
      article: articleById.get(s.article_id) ?? null,
      seller: profileById.get(s.seller_id) ?? null,
      net_revenue: Math.round(netRevenue),
      total_cost: totalCost != null ? Math.round(totalCost) : null,
      net_profit:
        totalCost != null ? Math.round(netRevenue - totalCost) : null,
    };
  });

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export type SaleDetail = {
  sale: SaleRow;
  article: ArticleRow | null;
  seller: Pick<ProfileRow, "id" | "username" | "full_name" | "color"> | null;
  totalCost: number | null;
  netProfit: number | null;
};

export async function getSaleById(id: string): Promise<SaleDetail | null> {
  const supabase = createClient();

  const saleRes = await supabase
    .from("sales")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!saleRes.data) return null;
  const sale = saleRes.data;

  const [articleRes, sellerRes, purchaseRes] = await Promise.all([
    supabase.from("articles").select("*").eq("id", sale.article_id).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, username, full_name, color")
      .eq("id", sale.seller_id)
      .maybeSingle(),
    supabase
      .from("purchases")
      .select(
        "purchase_price, shipping_cost_in, packaging_cost, authentication_cost, other_costs",
      )
      .eq("article_id", sale.article_id)
      .maybeSingle(),
  ]);

  const totalCost = purchaseRes.data
    ? num(purchaseRes.data.purchase_price) +
      num(purchaseRes.data.shipping_cost_in) +
      num(purchaseRes.data.packaging_cost) +
      num(purchaseRes.data.authentication_cost) +
      num(purchaseRes.data.other_costs)
    : null;

  const netRevenue =
    num(sale.sale_price) -
    num(sale.shipping_cost_out) -
    num(sale.platform_fees_amount) -
    num(sale.other_fees);

  return {
    sale,
    article: articleRes.data ?? null,
    seller: sellerRes.data ?? null,
    totalCost,
    netProfit: totalCost != null ? netRevenue - totalCost : null,
  };
}

// ---------------------------------------------------------------------------
// In-stock articles for the "new sale" picker
// ---------------------------------------------------------------------------

export type InStockArticle = Pick<
  ArticleRow,
  "id" | "name" | "brand" | "category" | "photos" | "size"
> & {
  total_cost: number | null;
  purchase_date: string | null;
};

export async function getInStockArticles(): Promise<InStockArticle[]> {
  const supabase = createClient();
  const articlesRes = await supabase
    .from("articles")
    .select("id, name, brand, category, photos, size, created_at")
    .eq("status", "in_stock")
    .order("created_at", { ascending: false });

  const articles = articlesRes.data ?? [];
  if (articles.length === 0) return [];

  const purchasesRes = await supabase
    .from("purchases")
    .select(
      "article_id, purchase_date, purchase_price, shipping_cost_in, packaging_cost, authentication_cost, other_costs",
    )
    .in(
      "article_id",
      articles.map((a) => a.id),
    );

  const purchaseByArticleId = new Map<string, PurchaseRow>();
  for (const p of purchasesRes.data ?? []) {
    purchaseByArticleId.set(p.article_id, p as PurchaseRow);
  }

  return articles.map((a) => {
    const p = purchaseByArticleId.get(a.id);
    const totalCost = p
      ? num(p.purchase_price) +
        num(p.shipping_cost_in) +
        num(p.packaging_cost) +
        num(p.authentication_cost) +
        num(p.other_costs)
      : null;
    return {
      id: a.id,
      name: a.name,
      brand: a.brand,
      category: a.category,
      photos: a.photos,
      size: a.size,
      total_cost: totalCost != null ? Math.round(totalCost) : null,
      purchase_date: p?.purchase_date ?? null,
    };
  });
}
