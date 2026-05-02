"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { UserPerformance } from "@/lib/queries/dashboard";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";

export function UserPerformanceChart({ data }: { data: UserPerformance[] }) {
  if (data.length === 0) {
    return (
      <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
        Aucun associé
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.fullName?.split(" ")[0] ?? d.username,
    achetés: d.bought,
    vendus: d.sold,
    profit: d.profit,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
      >
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
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted)/0.4)" }}
          content={
            <ChartTooltip
              formatter={(v) => `${v}`}
            />
          }
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="achetés"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="vendus"
          fill="hsl(var(--success))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
