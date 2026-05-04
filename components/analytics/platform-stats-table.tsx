import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { formatCurrency, cn } from "@/lib/utils";
import type { PlatformStat } from "@/lib/queries/analytics";

export function PlatformStatsTable({ stats }: { stats: PlatformStat[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plateforme</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Ventes</TableHead>
            <TableHead className="hidden text-right md:table-cell">CA net</TableHead>
            <TableHead className="text-right">Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.length === 0 ? (
            <TableEmpty colSpan={4}>
              Aucune vente sur la période.
            </TableEmpty>
          ) : (
            stats.map((p) => (
              <TableRow key={p.platform}>
                <TableCell>
                  <span className="block text-sm font-medium">{p.platform}</span>
                  <span className="block text-[11px] text-muted-foreground sm:hidden">
                    {p.salesCount} vente{p.salesCount > 1 ? "s" : ""}
                  </span>
                </TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {p.salesCount}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">
                  {formatCurrency(p.revenue)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold tabular-nums",
                    p.profit >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {p.profit >= 0 ? "+" : ""}
                  {formatCurrency(p.profit)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
