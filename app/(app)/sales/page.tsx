import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSales, type SaleFilters } from "@/lib/queries/sales";
import { SaleListToolbar } from "@/components/sales/sale-list-toolbar";
import { SaleTable } from "@/components/sales/sale-table";
import { Pagination } from "@/components/shared/pagination";

export const metadata: Metadata = { title: "Ventes" };

type SearchParams = Record<string, string | string[] | undefined>;

function parseParams(searchParams: SearchParams) {
  const get = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const filters: SaleFilters = {};
  const search = get("search");
  if (search) filters.search = search;
  const seller = get("seller");
  if (seller) filters.sellerId = seller;
  const platform = get("platform");
  if (platform) filters.platform = platform;
  const dateFrom = get("from");
  if (dateFrom) filters.dateFrom = dateFrom;
  const dateTo = get("to");
  if (dateTo) filters.dateTo = dateTo;

  const page = Math.max(1, Number(get("page") ?? 1) || 1);
  const perPage = 50;

  return { filters, page, perPage };
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const { filters, page, perPage } = parseParams(searchParams);

  const [salesRes, profilesRes] = await Promise.all([
    getSales({ filters, page, perPage }),
    supabase
      .from("profiles")
      .select("id, username, full_name")
      .order("username"),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 animate-fade-in">
      <SaleListToolbar
        totalCount={salesRes.total}
        sellers={profilesRes.data ?? []}
      />
      <SaleTable items={salesRes.items} />
      <Pagination
        page={salesRes.page}
        totalPages={salesRes.totalPages}
        basePath="/sales"
      />
    </div>
  );
}
