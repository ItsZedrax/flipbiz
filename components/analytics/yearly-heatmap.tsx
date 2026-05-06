"use client";

import * as React from "react";
import { format, parseISO, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { DailyActivity } from "@/lib/queries/analytics";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sept",
  "Oct",
  "Nov",
  "Déc",
];

type HoverInfo = {
  date: string;
  profit: number;
  salesCount: number;
} | null;

export function YearlyHeatmap({ data }: { data: DailyActivity[] }) {
  const [hover, setHover] = React.useState<HoverInfo>(null);

  // Index data by date for fast lookup.
  const byDate = React.useMemo(() => {
    const m = new Map<string, DailyActivity>();
    data.forEach((d) => m.set(d.date, d));
    return m;
  }, [data]);

  // Build a 53-column × 7-row grid starting from the Monday of the week
  // containing the first day of `data`. Empty cells are rendered as null.
  const { weeks, monthLabels } = React.useMemo(() => {
    if (data.length === 0) return { weeks: [], monthLabels: [] };
    const firstDate = parseISO(data[0]!.date);
    const today = parseISO(data[data.length - 1]!.date);
    const gridStart = startOfWeek(firstDate, { weekStartsOn: 1 });

    const weeks: Array<Array<{ date: Date; key: string } | null>> = [];
    const cursor = new Date(gridStart);
    while (cursor <= today) {
      const week: Array<{ date: Date; key: string } | null> = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(cursor);
        if (day < firstDate || day > today) {
          week.push(null);
        } else {
          week.push({ date: day, key: format(day, "yyyy-MM-dd") });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    // Month labels: a label is shown above the week where its 1st day starts.
    const monthLabels: Array<{ col: number; label: string }> = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const firstReal = week.find((c) => c !== null);
      if (!firstReal) return;
      const m = firstReal.date.getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ col, label: MONTHS[m] ?? "" });
        lastMonth = m;
      }
    });

    return { weeks, monthLabels };
  }, [data]);

  // Compute color scale based on profit. Negative values use red shades.
  const { maxProfit, minProfit } = React.useMemo(() => {
    let max = 0;
    let min = 0;
    for (const d of data) {
      if (d.profit > max) max = d.profit;
      if (d.profit < min) min = d.profit;
    }
    return { maxProfit: max, minProfit: min };
  }, [data]);

  function colorFor(profit: number): string {
    if (profit === 0) return "bg-muted/40";
    if (profit > 0) {
      const ratio = maxProfit > 0 ? profit / maxProfit : 0;
      if (ratio > 0.66) return "bg-success";
      if (ratio > 0.33) return "bg-success/70";
      if (ratio > 0.1) return "bg-success/45";
      return "bg-success/25";
    }
    // negative
    const ratio = minProfit < 0 ? profit / minProfit : 0;
    if (ratio > 0.66) return "bg-destructive";
    if (ratio > 0.33) return "bg-destructive/70";
    return "bg-destructive/40";
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle className="text-base font-semibold">
            Activité de l&apos;année
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Profit net par jour · 365 derniers jours
          </p>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="relative overflow-x-auto pb-2 scrollbar-thin">
          <div className="inline-block min-w-full">
            {/* Month axis */}
            <div
              className="relative ml-7 h-3 text-[10px] text-muted-foreground"
              style={{ width: `${weeks.length * 14}px` }}
            >
              {monthLabels.map((m) => (
                <span
                  key={`${m.col}-${m.label}`}
                  className="absolute"
                  style={{ left: `${m.col * 14}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className="flex gap-1">
              {/* Day-of-week axis */}
              <div className="grid grid-rows-7 gap-[2px] pr-1 text-[10px] text-muted-foreground">
                {DAYS.map((d, i) => (
                  <div key={d} className="h-3 leading-3">
                    {i % 2 === 0 ? d : ""}
                  </div>
                ))}
              </div>

              {/* Cells */}
              <div className="flex gap-[2px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-rows-7 gap-[2px]">
                    {week.map((cell, di) => {
                      if (!cell)
                        return (
                          <div
                            key={di}
                            className="h-3 w-3 rounded-[2px]"
                            aria-hidden
                          />
                        );
                      const entry = byDate.get(cell.key);
                      const profit = entry?.profit ?? 0;
                      const salesCount = entry?.salesCount ?? 0;
                      return (
                        <button
                          key={di}
                          type="button"
                          onMouseEnter={() =>
                            setHover({
                              date: cell.key,
                              profit,
                              salesCount,
                            })
                          }
                          onMouseLeave={() => setHover(null)}
                          onFocus={() =>
                            setHover({
                              date: cell.key,
                              profit,
                              salesCount,
                            })
                          }
                          onBlur={() => setHover(null)}
                          aria-label={`${cell.key} : ${formatCurrency(profit)}`}
                          className={cn(
                            "h-3 w-3 rounded-[2px] transition-transform hover:scale-150",
                            colorFor(profit),
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hover panel */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          {hover ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {format(parseISO(hover.date), "d MMM yyyy", { locale: fr })}
              </span>
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  hover.profit > 0
                    ? "text-success"
                    : hover.profit < 0
                      ? "text-destructive"
                      : "text-muted-foreground",
                )}
              >
                {hover.profit >= 0 ? "+" : ""}
                {formatCurrency(hover.profit)}
              </span>
              <span className="text-muted-foreground">
                · {hover.salesCount} vente{hover.salesCount > 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              Survole une case pour voir le détail.
            </span>
          )}
          <div className="ml-auto flex items-center gap-1 text-muted-foreground">
            <span>moins</span>
            <span className="h-3 w-3 rounded-[2px] bg-muted/40" />
            <span className="h-3 w-3 rounded-[2px] bg-success/25" />
            <span className="h-3 w-3 rounded-[2px] bg-success/45" />
            <span className="h-3 w-3 rounded-[2px] bg-success/70" />
            <span className="h-3 w-3 rounded-[2px] bg-success" />
            <span>plus</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
