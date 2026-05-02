"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { ScatterPoint } from "@/lib/queries/analytics";

const COLORS: Record<string, string> = {
  sneakers: "#6366f1",
  cards: "#10b981",
  watches: "#f59e0b",
  other: "#94a3b8",
};

type Props = {
  points: ScatterPoint[];
};

export function ProfitScatterChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <div className="grid h-[320px] place-items-center text-sm text-muted-foreground">
        Aucune vente sur la période.
      </div>
    );
  }

  // Group by category for separate Scatter series (each gets its own color)
  const categories = Array.from(new Set(points.map((p) => p.category)));
  const series = categories.map((cat) => ({
    category: cat,
    color: COLORS[cat] ?? "#94a3b8",
    data: points.filter((p) => p.category === cat),
  }));

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
          />
          <XAxis
            type="number"
            dataKey="cost"
            name="Coût"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Coût total (€)",
              position: "insideBottom",
              offset: -5,
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
            tickFormatter={(v) =>
              v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`
            }
          />
          <YAxis
            type="number"
            dataKey="profit"
            name="Profit"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              v >= 1000
                ? `${Math.round(v / 100) / 10}k`
                : v <= -1000
                  ? `${Math.round(v / 100) / 10}k`
                  : `${v}`
            }
            width={48}
          />
          <ZAxis range={[60, 60]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]?.payload as ScatterPoint;
              if (!p) return null;
              return (
                <div className="rounded-md border bg-popover/95 px-3 py-2 text-xs shadow-md backdrop-blur">
                  <div className="mb-1 font-medium text-foreground">
                    {p.name}
                  </div>
                  <div className="space-y-0.5 text-muted-foreground">
                    <div>
                      Coût{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {formatCurrency(p.cost)}
                      </span>
                    </div>
                    <div>
                      Profit{" "}
                      <span
                        className="font-medium tabular-nums"
                        style={{
                          color:
                            p.profit >= 0
                              ? "hsl(var(--success))"
                              : "hsl(var(--destructive))",
                        }}
                      >
                        {p.profit >= 0 ? "+" : ""}
                        {formatCurrency(p.profit)}
                      </span>
                    </div>
                    <div>
                      ROI{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {p.roi >= 0 ? "+" : ""}
                        {p.roi.toFixed(1)}%
                      </span>{" "}
                      · {p.days}j
                    </div>
                  </div>
                </div>
              );
            }}
          />
          {series.map((s) => (
            <Scatter
              key={s.category}
              name={CATEGORY_LABELS[s.category]}
              data={s.data}
              fill={s.color}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <ul className="flex flex-wrap justify-center gap-4 text-xs">
        {series.map((s) => (
          <li key={s.category} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground">
              {CATEGORY_LABELS[s.category]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
