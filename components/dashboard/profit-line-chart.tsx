"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlySeries } from "@/lib/queries/dashboard";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";

export function ProfitLineChart({ data }: { data: MonthlySeries[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
      >
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
        <Line
          type="monotone"
          name="Profit net"
          dataKey="profit"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "hsl(var(--primary))" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
