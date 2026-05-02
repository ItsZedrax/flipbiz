"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlySeries } from "@/lib/queries/dashboard";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";

export function CapitalAreaChart({ data }: { data: MonthlySeries[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="invested" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cashed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="month"
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
          tickFormatter={(v) =>
            v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`
          }
          width={40}
        />
        <Tooltip
          cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
          content={<ChartTooltip />}
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          name="Investi"
          dataKey="invested"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#invested)"
        />
        <Area
          type="monotone"
          name="Encaissé"
          dataKey="cashed"
          stroke="hsl(var(--success))"
          strokeWidth={2}
          fill="url(#cashed)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
