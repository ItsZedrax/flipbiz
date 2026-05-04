import { redirect } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  Coins,
  Percent,
  Boxes,
  ShoppingBag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/queries/dashboard";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { ProfitLineChart } from "@/components/dashboard/profit-line-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { TopArticlesChart } from "@/components/dashboard/top-articles-chart";
import { UserPerformanceChart } from "@/components/dashboard/user-performance-chart";
import { CapitalAreaChart } from "@/components/dashboard/capital-area-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { SmartAlerts } from "@/components/dashboard/smart-alerts";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await getDashboardData(user.id);
  const { kpis } = data;

  const monthName = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Tableau de bord
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue d&apos;ensemble du business · {monthName}
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={Wallet}
          label="Capital investi"
          value={formatCurrency(kpis.capitalInvested)}
          hint={`${kpis.inStockCount} articles en stock`}
          tone="default"
        />
        <MetricCard
          icon={Coins}
          label="CA du mois"
          value={formatCurrency(kpis.monthRevenue)}
          hint={`${kpis.monthSalesCount} vente${kpis.monthSalesCount > 1 ? "s" : ""}`}
          tone="default"
        />
        <MetricCard
          icon={TrendingUp}
          label="Profit du mois"
          value={formatCurrency(kpis.monthProfit)}
          tone={kpis.monthProfit >= 0 ? "hero" : "danger"}
        />
        <MetricCard
          icon={Percent}
          label="ROI moyen"
          value={`${kpis.averageRoi}%`}
          hint="sur articles vendus"
          tone={kpis.averageRoi >= 0 ? "success" : "danger"}
        />
        <MetricCard
          icon={Boxes}
          label="En stock"
          value={`${kpis.inStockCount}`}
          tone="default"
        />
        <MetricCard
          icon={ShoppingBag}
          label="Ventes ce mois"
          value={`${kpis.monthSalesCount}`}
          tone="default"
        />
      </div>

      {/* Row 1: profit + categories */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Profit net (12 derniers mois)"
          description="Marge nette par mois après tous frais."
        >
          <ProfitLineChart data={data.profitSeries} />
        </ChartCard>
        <ChartCard
          title="Stock par catégorie"
          description="Répartition de la valeur immobilisée."
        >
          <CategoryPieChart data={data.categoryStock} />
        </ChartCard>
      </div>

      {/* Row 2: top articles + user perf */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Top 5 articles"
          description="Les ventes les plus rentables (profit net)."
        >
          <TopArticlesChart data={data.topArticles} />
        </ChartCard>
        <ChartCard
          title="Performance des associés"
          description="Articles achetés / vendus par chacun."
        >
          <UserPerformanceChart data={data.userPerformance} />
        </ChartCard>
      </div>

      {/* Row 3: capital area chart full width */}
      <ChartCard
        title="Capital investi vs encaissé"
        description="Flux mensuel sur 12 mois."
      >
        <CapitalAreaChart data={data.profitSeries} />
      </ChartCard>

      {/* Row 4: activity + alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity items={data.recentActivity} />
        </div>
        <div>
          <SmartAlerts alerts={data.alerts} />
        </div>
      </div>
    </div>
  );
}
