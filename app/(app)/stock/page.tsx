import type { Metadata } from "next";
import { Wallet, Package, Clock, AlertTriangle } from "lucide-react";
import { getStockData, type StockSort } from "@/lib/queries/stock";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StockTable } from "@/components/stock/stock-table";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Stock" };

const ALLOWED_SORTS: StockSort[] = [
  "days_desc",
  "days_asc",
  "cost_desc",
  "cost_asc",
  "name_asc",
  "name_desc",
];

export default async function StockPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sortRaw = Array.isArray(searchParams.sort)
    ? searchParams.sort[0]
    : searchParams.sort;
  const sort = (
    ALLOWED_SORTS.includes(sortRaw as StockSort) ? sortRaw : "days_desc"
  ) as StockSort;

  const data = await getStockData(sort);
  const { kpis } = data;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Stock</h1>
        <p className="text-sm text-muted-foreground">
          {kpis.totalCount} {kpis.totalCount > 1 ? "articles" : "article"} en
          stock — capital immobilisé{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(kpis.totalValue)}
          </span>
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Wallet}
          label="Capital immobilisé"
          value={formatCurrency(kpis.totalValue)}
          tone="default"
        />
        <MetricCard
          icon={Package}
          label="Articles"
          value={`${kpis.totalCount}`}
          tone="default"
        />
        <MetricCard
          icon={Clock}
          label="Durée moyenne"
          value={`${kpis.avgDaysHeld}j`}
          tone="default"
        />
        <MetricCard
          icon={AlertTriangle}
          label="À écouler (>60j)"
          value={`${kpis.agingBreakdown.stale}`}
          tone={kpis.agingBreakdown.stale > 0 ? "danger" : "default"}
        />
      </div>

      {/* Aging legend */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4 text-xs">
          <span className="font-medium uppercase tracking-wide text-muted-foreground">
            Vieillissement :
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            {kpis.agingBreakdown.fresh} récents (&lt; 30j)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-warning" />
            {kpis.agingBreakdown.warming} à surveiller (30–60j)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            {kpis.agingBreakdown.stale} à écouler (&gt; 60j)
          </span>
        </CardContent>
      </Card>

      <StockTable items={data.items} sort={sort} />
    </div>
  );
}
