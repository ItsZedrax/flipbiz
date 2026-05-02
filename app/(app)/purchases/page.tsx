import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getPurchases,
  type PurchaseFilters,
} from "@/lib/queries/purchases";
import { PurchaseListToolbar } from "@/components/purchases/purchase-list-toolbar";
import { PurchaseTable } from "@/components/purchases/purchase-table";
import { Pagination } from "@/components/shared/pagination";

export const metadata: Metadata = { title: "Achats" };

type SearchParams = Record<string, string | string[] | undefined>;

function parseParams(searchParams: SearchParams) {
  const get = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const filters: PurchaseFilters = {};
  const search = get("search");
  if (search) filters.search = search;
  const buyer = get("buyer");
  if (buyer) filters.buyerId = buyer;
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

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const { filters, page, perPage } = parseParams(searchParams);

  const [purchasesRes, profilesRes] = await Promise.all([
    getPurchases({ filters, page, perPage }),
    supabase
      .from("profiles")
      .select("id, username, full_name")
      .order("username"),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 animate-fade-in">
      <PurchaseListToolbar
        totalCount={purchasesRes.total}
        buyers={profilesRes.data ?? []}
      />
      <PurchaseTable items={purchasesRes.items} />
      <Pagination
        page={purchasesRes.page}
        totalPages={purchasesRes.totalPages}
        basePath="/purchases"
      />
    </div>
  );
}
