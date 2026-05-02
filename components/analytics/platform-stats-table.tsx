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
            <TableHead className="text-right">Ventes</TableHead>
            <TableHead className="text-right">CA net</TableHead>
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
                <TableCell className="text-sm font-medium">
                  {p.platform}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.salesCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
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
