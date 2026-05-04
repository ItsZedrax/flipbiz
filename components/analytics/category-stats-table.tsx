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
            <TableHead className="hidden text-right sm:table-cell">Ventes</TableHead>
            <TableHead className="hidden text-right md:table-cell">CA net</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="hidden text-right md:table-cell">ROI moy.</TableHead>
            <TableHead className="hidden text-right lg:table-cell">Délai moy.</TableHead>
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
                    <div className="min-w-0">
                      <span className="block text-sm font-medium">
                        {CATEGORY_LABELS[c.category]}
                      </span>
                      <span className="block text-[11px] text-muted-foreground sm:hidden">
                        {c.salesCount} vente{c.salesCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {c.salesCount}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">
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
                <TableCell className="hidden text-right tabular-nums text-muted-foreground md:table-cell">
                  {c.avgRoi >= 0 ? "+" : ""}
                  {c.avgRoi.toFixed(1)}%
                </TableCell>
                <TableCell className="hidden text-right tabular-nums text-muted-foreground lg:table-cell">
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
