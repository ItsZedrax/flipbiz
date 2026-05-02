import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type PurchaseRow = Tables<"purchases">;
type ArticleRow = Tables<"articles">;
type ProfileRow = Tables<"profiles">;

export type PurchaseFilters = {
  search?: string;
  buyerId?: string;
  platform?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type PurchaseListItem = PurchaseRow & {
  article: Pick<
    ArticleRow,
    "id" | "name" | "category" | "photos" | "status"
  > | null;
  buyer: Pick<ProfileRow, "id" | "username" | "full_name" | "color"> | null;
  total_cost: number;
};

export type PurchaseListResult = {
  items: PurchaseListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

const num = (v: number | string | null | undefined): number =>
  v == null ? 0 : typeof v === "string" ? parseFloat(v) : v;

export async function getPurchases({
  filters = {},
  page = 1,
  perPage = 20,
}: {
  filters?: PurchaseFilters;
  page?: number;
  perPage?: number;
}): Promise<PurchaseListResult> {
  const supabase = createClient();

  // 1. Base purchases query with filters
  let q = supabase
    .from("purchases")
    .select("*", { count: "exact" })
    .order("purchase_date", { ascending: false });

  if (filters.buyerId) q = q.eq("buyer_id", filters.buyerId);
  if (filters.platform) q = q.eq("purchase_platform", filters.platform);
  if (filters.dateFrom) q = q.gte("purchase_date", filters.dateFrom);
  if (filters.dateTo) q = q.lte("purchase_date", filters.dateTo);

  // For search we need to find articles first (search is on article name/brand)
  let allowedArticleIds: Set<string> | null = null;
  if (filters.search) {
    const s = filters.search.replace(/[%,]/g, "");
    const articleSearch = await supabase
      .from("articles")
      .select("id")
      .or(`name.ilike.%${s}%,brand.ilike.%${s}%,reference.ilike.%${s}%`);
    allowedArticleIds = new Set(
      (articleSearch.data ?? []).map((a) => a.id),
    );
    if (allowedArticleIds.size === 0) {
      return {
        items: [],
        total: 0,
        page,
        perPage,
        totalPages: 1,
      };
    }
    q = q.in("article_id", Array.from(allowedArticleIds));
  }

  q = q.range((page - 1) * perPage, page * perPage - 1);

  const purchasesRes = await q;
  if (purchasesRes.error) throw purchasesRes.error;

  const purchases = purchasesRes.data ?? [];
  const total = purchasesRes.count ?? 0;

  if (purchases.length === 0) {
    return {
      items: [],
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  // 2. Fetch related articles + buyers in parallel
  const articleIds = Array.from(new Set(purchases.map((p) => p.article_id)));
  const buyerIds = Array.from(new Set(purchases.map((p) => p.buyer_id)));

  const [articlesRes, profilesRes] = await Promise.all([
    supabase
      .from("articles")
      .select("id, name, category, photos, status")
      .in("id", articleIds),
    supabase
      .from("profiles")
      .select("id, username, full_name, color")
      .in("id", buyerIds),
  ]);

  const articleById = new Map(
    (articlesRes.data ?? []).map((a) => [a.id, a]),
  );
  const profileById = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );

  const items: PurchaseListItem[] = purchases.map((p) => ({
    ...p,
    article: articleById.get(p.article_id) ?? null,
    buyer: profileById.get(p.buyer_id) ?? null,
    total_cost:
      num(p.purchase_price) +
      num(p.shipping_cost_in) +
      num(p.packaging_cost) +
      num(p.authentication_cost) +
      num(p.other_costs),
  }));

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export type PurchaseDetail = {
  purchase: PurchaseRow;
  article: ArticleRow | null;
  buyer: Pick<ProfileRow, "id" | "username" | "full_name" | "color"> | null;
};

export async function getPurchaseById(
  id: string,
): Promise<PurchaseDetail | null> {
  const supabase = createClient();

  const purchaseRes = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!purchaseRes.data) return null;
  const purchase = purchaseRes.data;

  const [articleRes, buyerRes] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .eq("id", purchase.article_id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, username, full_name, color")
      .eq("id", purchase.buyer_id)
      .maybeSingle(),
  ]);

  return {
    purchase,
    article: articleRes.data ?? null,
    buyer: buyerRes.data ?? null,
  };
}
