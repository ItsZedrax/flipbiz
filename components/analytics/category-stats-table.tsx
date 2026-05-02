import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { CategoryIcon } from "@/components/articles/category-icon";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import type { CategoryStat } from "@/lib/queries/analytics";

export function CategoryStatsTable({ stats }: { stats: CategoryStat[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Catégorie</TableHead>
            <TableHead className="text-right">Ventes</TableHead>
            <TableHead className="text-right">CA net</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="text-right">ROI moy.</TableHead>
            <TableHead className="text-right">Délai moy.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.length === 0 ? (
            <TableEmpty colSpan={6}>
              Aucune vente sur la période.
            </TableEmpty>
          ) : (
            stats.map((c) => (
              <TableRow key={c.category}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CategoryIcon
                      category={c.category}
                      className="h-4 w-4 text-muted-foreground"
                    />
                    <span className="text-sm font-medium">
                      {CATEGORY_LABELS[c.category]}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.salesCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(c.revenue)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold tabular-nums",
                    c.profit >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {c.profit >= 0 ? "+" : ""}
                  {formatCurrency(c.profit)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {c.avgRoi >= 0 ? "+" : ""}
                  {c.avgRoi.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {c.avgDaysHeld}j
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
