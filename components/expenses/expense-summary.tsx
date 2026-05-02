import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseSummary as Summary } from "@/lib/queries/expenses";

export function ExpenseSummary({ summary }: { summary: Summary }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <MetricCard
        icon={Receipt}
        label="Total dépenses"
        value={formatCurrency(summary.totalAmount)}
        hint={`${summary.countTotal} ${summary.countTotal > 1 ? "lignes" : "ligne"}`}
        tone="warning"
      />
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Répartition par catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.byCategory.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Aucune dépense.
            </p>
          ) : (
            <ul className="space-y-2">
              {summary.byCategory.map((c) => {
                const pct =
                  summary.totalAmount > 0
                    ? (c.total / summary.totalAmount) * 100
                    : 0;
                return (
                  <li key={c.category}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium">{c.category}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatCurrency(c.total)}{" "}
                        <span className="text-xs">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
