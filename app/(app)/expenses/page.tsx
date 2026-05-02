import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getExpenses,
  getExpenseSummary,
  type ExpenseFilters,
} from "@/lib/queries/expenses";
import { getSettings } from "@/lib/queries/settings";
import { ExpenseListToolbar } from "@/components/expenses/expense-list-toolbar";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { ExpenseSummary } from "@/components/expenses/expense-summary";
import { Pagination } from "@/components/shared/pagination";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = { title: "Dépenses" };

type SearchParams = Record<string, string | string[] | undefined>;

function parseParams(searchParams: SearchParams) {
  const get = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const filters: ExpenseFilters = {};
  const search = get("search");
  if (search) filters.search = search;
  const cat = get("category");
  if (cat) filters.category = cat;
  const userId = get("user");
  if (userId) filters.userId = userId;
  const dateFrom = get("from");
  if (dateFrom) filters.dateFrom = dateFrom;
  const dateTo = get("to");
  if (dateTo) filters.dateTo = dateTo;

  const page = Math.max(1, Number(get("page") ?? 1) || 1);
  const perPage = 50;
  return { filters, page, perPage };
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const { filters, page, perPage } = parseParams(searchParams);

  const [expensesRes, summary, settings, profilesRes] = await Promise.all([
    getExpenses({ filters, page, perPage }),
    getExpenseSummary(filters),
    getSettings(),
    supabase
      .from("profiles")
      .select("id, username, full_name")
      .order("username"),
  ]);

  const categories =
    settings?.categories && settings.categories.length > 0
      ? settings.categories
      : DEFAULT_EXPENSE_CATEGORIES;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 animate-fade-in">
      <ExpenseListToolbar
        totalCount={expensesRes.total}
        totalAmount={summary.totalAmount}
        categories={categories}
        users={profilesRes.data ?? []}
      />
      <ExpenseSummary summary={summary} />
      <ExpenseTable items={expensesRes.items} />
      <Pagination
        page={expensesRes.page}
        totalPages={expensesRes.totalPages}
        basePath="/expenses"
      />
    </div>
  );
}
