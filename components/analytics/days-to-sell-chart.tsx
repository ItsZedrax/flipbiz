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
import { CATEGORY_LABELS } from "@/lib/constants";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import type { CategoryStat } from "@/lib/queries/analytics";

export function DaysToSellChart({ stats }: { stats: CategoryStat[] }) {
  if (stats.length === 0) {
    return (
      <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
        Aucune donnée sur la période.
      </div>
    );
  }
  const data = stats.map((s) => ({
    name: CATEGORY_LABELS[s.category],
    days: s.avgDaysHeld,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={32}
          tickFormatter={(v) => `${v}j`}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted)/0.4)" }}
          content={<ChartTooltip formatter={(v) => `${v} jours`} />}
        />
        <Bar
          name="Délai moyen"
          dataKey="days"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
