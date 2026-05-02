"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TopArticle } from "@/lib/queries/dashboard";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";

export function TopArticlesChart({ data }: { data: TopArticle[] }) {
  if (data.length === 0) {
    return (
      <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
        Aucune vente enregistrée
      </div>
    );
  }
  // Truncate long names for axis
  const chartData = data.map((d) => ({
    name:
      d.name.length > 22 ? d.name.slice(0, 20).trimEnd() + "…" : d.name,
    profit: d.netProfit,
    roi: d.roiPct,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 12, bottom: 0, left: 8 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          horizontal={false}
        />
        <XAxis
          type="number"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) =>
            v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`
          }
        />
        <YAxis
          dataKey="name"
          type="category"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip cursor={{ fill: "hsl(var(--muted)/0.4)" }} content={<ChartTooltip />} />
        <Bar
          name="Profit net"
          dataKey="profit"
          fill="hsl(var(--primary))"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
