import Link from "next/link";
import { Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/layout/user-avatar";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseListItem } from "@/lib/queries/expenses";

export function ExpenseTable({ items }: { items: ExpenseListItem[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Engagée par</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableEmpty colSpan={6}>
              Aucune dépense ne correspond à ces filtres.
            </TableEmpty>
          ) : (
            items.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {format(parseISO(e.date), "d MMM yyyy", { locale: fr })}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {e.description}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{e.category}</Badge>
                </TableCell>
                <TableCell>
                  {e.user ? (
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        fullName={e.user.full_name}
                        username={e.user.username}
                        color={e.user.color}
                        className="h-6 w-6 text-[10px]"
                      />
                      <span className="text-sm">
                        {e.user.full_name?.split(" ")[0] ?? e.user.username}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(Number(e.amount))}
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link
                      href={`/expenses/${e.id}/edit`}
                      aria-label="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
