import type { Metadata } from "next";
import { Coins, TrendingUp, Percent, ShoppingBag, ShoppingCart, ChartPie } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  getAnalyticsData,
  getDailyActivity,
  type AnalyticsPeriod,
} from "@/lib/queries/analytics";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { UserStatsTable } from "@/components/analytics/user-stats-table";
import { CategoryStatsTable } from "@/components/analytics/category-stats-table";
import { PlatformStatsTable } from "@/components/analytics/platform-stats-table";
import { DaysToSellChart } from "@/components/analytics/days-to-sell-chart";
import { ProfitScatterChart } from "@/components/analytics/profit-scatter-chart";
import { YearlyHeatmap } from "@/components/analytics/yearly-heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

const ALLOWED_PERIODS: AnalyticsPeriod[] = [
  "7d",
  "30d",
  "3m",
  "6m",
  "12m",
  "all",
];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const periodRaw = Array.isArray(searchParams.period)
    ? searchParams.period[0]
    : searchParams.period;
  const period = (
    ALLOWED_PERIODS.includes(periodRaw as AnalyticsPeriod)
      ? periodRaw
      : "30d"
  ) as AnalyticsPeriod;

  const [data, dailyActivity] = await Promise.all([
    getAnalyticsData(period),
    getDailyActivity(),
  ]);
  const { kpis, from, to } = data;

  const periodLabel =
    period === "all"
      ? "depuis le début"
      : `du ${format(parseISO(from!), "d MMM yyyy", { locale: fr })} au ${format(
          parseISO(to),
          "d MMM yyyy",
          { locale: fr },
        )}`;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-fade-in">
      {/* Header + period picker */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Performance {periodLabel}
          </p>
        </div>
        <PeriodSelector current={period} />
      </div>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={Coins}
          label="CA net"
          value={formatCurrency(kpis.revenue)}
          tone="default"
        />
        <MetricCard
          icon={TrendingUp}
          label="Profit"
          value={formatCurrency(kpis.profit)}
          tone={kpis.profit >= 0 ? "success" : "danger"}
        />
        <MetricCard
          icon={Percent}
          label="ROI moyen"
          value={`${kpis.avgRoi}%`}
          tone={kpis.avgRoi >= 0 ? "success" : "danger"}
        />
        <MetricCard
          icon={ChartPie}
          label="Marge"
          value={`${kpis.marginPct}%`}
          tone="default"
        />
        <MetricCard
          icon={ShoppingBag}
          label="Ventes"
          value={`${kpis.salesCount}`}
          tone="default"
        />
        <MetricCard
          icon={ShoppingCart}
          label="Achats"
          value={`${kpis.unitsBought}`}
          hint={formatCurrency(kpis.capitalSpent)}
          tone="default"
        />
      </div>

      {/* Yearly activity heatmap (independent from period) */}
      <YearlyHeatmap data={dailyActivity} />

      {/* Per user */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Performance par associé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserStatsTable stats={data.userStats} />
        </CardContent>
      </Card>

      {/* Two-column: category + platform */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryStatsTable stats={data.categoryStats} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Par plateforme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformStatsTable stats={data.platformStats} />
          </CardContent>
        </Card>
      </div>

      {/* Days-to-sell chart */}
      <ChartCard
        title="Délai moyen de revente"
        description="Temps entre l'achat et la vente, par catégorie."
      >
        <DaysToSellChart stats={data.categoryStats} />
      </ChartCard>

      {/* Scatter */}
      <ChartCard
        title="Coût vs profit par article"
        description="Chaque point représente une vente — survole pour voir les détails."
      >
        <ProfitScatterChart points={data.scatter} />
      </ChartCard>
    </div>
  );
}
