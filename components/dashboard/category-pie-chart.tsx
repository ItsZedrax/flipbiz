"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryShare } from "@/lib/queries/dashboard";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Enums } from "@/types/database";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { formatCurrency } from "@/lib/utils";

const COLORS: Record<string, string> = {
  sneakers: "#6366f1",
  cards: "#10b981",
  watches: "#f59e0b",
  other: "#94a3b8",
};

export function CategoryPieChart({ data }: { data: CategoryShare[] }) {
  if (data.length === 0) {
    return (
      <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
        Aucun article en stock
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const chartData = data.map((d) => ({
    name: CATEGORY_LABELS[d.category as Enums<"article_category">] ?? d.category,
    value: d.value,
    count: d.count,
    color: COLORS[d.category] ?? "#94a3b8",
  }));

  return (
    <div className="flex flex-col items-center gap-2">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center">
        <div className="text-xs text-muted-foreground">Valeur totale</div>
        <div className="text-lg font-semibold tabular-nums">
          {formatCurrency(total)}
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {chartData.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="ml-auto font-medium tabular-nums">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
