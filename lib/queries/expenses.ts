import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type ExpenseRow = Tables<"expenses">;
type ProfileRow = Tables<"profiles">;

export type ExpenseFilters = {
  search?: string;
  category?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type ExpenseListItem = ExpenseRow & {
  user: Pick<ProfileRow, "id" | "username" | "full_name" | "color"> | null;
};

export type ExpenseListResult = {
  items: ExpenseListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type ExpenseSummary = {
  totalAmount: number;
  countTotal: number;
  byCategory: Array<{ category: string; total: number; count: number }>;
};

const num = (v: number | string | null | undefined): number =>
  v == null ? 0 : typeof v === "string" ? parseFloat(v) : v;

export async function getExpenses({
  filters = {},
  page = 1,
  perPage = 50,
}: {
  filters?: ExpenseFilters;
  page?: number;
  perPage?: number;
}): Promise<ExpenseListResult> {
  const supabase = createClient();

  let q = supabase
    .from("expenses")
    .select("*", { count: "exact" })
    .order("date", { ascending: false });

  if (filters.category) q = q.eq("category", filters.category);
  if (filters.userId) q = q.eq("user_id", filters.userId);
  if (filters.dateFrom) q = q.gte("date", filters.dateFrom);
  if (filters.dateTo) q = q.lte("date", filters.dateTo);
  if (filters.search) {
    const s = filters.search.replace(/[%,]/g, "");
    q = q.ilike("description", `%${s}%`);
  }

  q = q.range((page - 1) * perPage, page * perPage - 1);

  const expensesRes = await q;
  if (expensesRes.error) throw expensesRes.error;

  const expenses = expensesRes.data ?? [];
  const total = expensesRes.count ?? 0;

  if (expenses.length === 0) {
    return {
      items: [],
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  const userIds = Array.from(new Set(expenses.map((e) => e.user_id)));
  const profilesRes = await supabase
    .from("profiles")
    .select("id, username, full_name, color")
    .in("id", userIds);
  const profileById = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );

  const items: ExpenseListItem[] = expenses.map((e) => ({
    ...e,
    user: profileById.get(e.user_id) ?? null,
  }));

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getExpenseSummary(
  filters: ExpenseFilters = {},
): Promise<ExpenseSummary> {
  const supabase = createClient();
  let q = supabase.from("expenses").select("category, amount");
  if (filters.category) q = q.eq("category", filters.category);
  if (filters.userId) q = q.eq("user_id", filters.userId);
  if (filters.dateFrom) q = q.gte("date", filters.dateFrom);
  if (filters.dateTo) q = q.lte("date", filters.dateTo);

  const res = await q;
  const rows = res.data ?? [];

  const byCategoryMap = new Map<string, { total: number; count: number }>();
  let totalAmount = 0;
  for (const r of rows) {
    const amt = num(r.amount);
    totalAmount += amt;
    let slot = byCategoryMap.get(r.category);
    if (!slot) {
      slot = { total: 0, count: 0 };
      byCategoryMap.set(r.category, slot);
    }
    slot.total += amt;
    slot.count++;
  }

  const byCategory = Array.from(byCategoryMap.entries())
    .map(([category, v]) => ({
      category,
      total: Math.round(v.total),
      count: v.count,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    totalAmount: Math.round(totalAmount),
    countTotal: rows.length,
    byCategory,
  };
}
