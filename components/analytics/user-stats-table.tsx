import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/layout/user-avatar";
import { formatCurrency, cn } from "@/lib/utils";
import type { UserStat } from "@/lib/queries/analytics";

export function UserStatsTable({ stats }: { stats: UserStat[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Associé</TableHead>
            <TableHead className="text-right">Achetés</TableHead>
            <TableHead className="text-right">Investi</TableHead>
            <TableHead className="text-right">Vendus</TableHead>
            <TableHead className="text-right">Encaissé</TableHead>
            <TableHead className="text-right">Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.length === 0 ? (
            <TableEmpty colSpan={6}>Aucun associé.</TableEmpty>
          ) : (
            stats.map((u) => (
              <TableRow key={u.userId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      fullName={u.fullName}
                      username={u.username}
                      color={u.color}
                      className="h-7 w-7 text-[10px]"
                    />
                    <span className="text-sm font-medium">
                      {u.fullName ?? u.username}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {u.bought}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatCurrency(u.spent)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {u.sold}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatCurrency(u.revenue)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold tabular-nums",
                    u.profit >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {u.profit >= 0 ? "+" : ""}
                  {formatCurrency(u.profit)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
