import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/articles/status-badge";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import { UserAvatar } from "@/components/layout/user-avatar";
import type { ArticleListItem } from "@/lib/queries/articles";

export function ArticleTable({ items }: { items: ArticleListItem[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Article</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Acheteur</TableHead>
            <TableHead className="text-right">Coût</TableHead>
            <TableHead className="text-right">Vente</TableHead>
            <TableHead className="text-right">Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableEmpty colSpan={8}>
              Aucun article ne correspond à ces filtres.
            </TableEmpty>
          ) : (
            items.map((a) => {
              const cover = a.photos?.[0];
              return (
                <TableRow key={a.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/articles/${a.id}`}
                      className="block"
                      tabIndex={-1}
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                        {cover ? (
                          <Image
                            src={cover}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-muted-foreground">
                            <ImageOff className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/articles/${a.id}`}
                      className="block hover:underline"
                    >
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.brand ?? "—"}
                        {a.size ? ` · ${a.size}` : ""}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>{CATEGORY_LABELS[a.category]}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell>
                    {a.buyer ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          fullName={a.buyer.full_name}
                          username={a.buyer.username}
                          color={a.buyer.color}
                          className="h-6 w-6 text-[10px]"
                        />
                        <span className="text-sm">
                          {a.buyer.full_name?.split(" ")[0] ?? a.buyer.username}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {a.total_cost != null ? formatCurrency(a.total_cost) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {a.sale_price != null ? formatCurrency(a.sale_price) : "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold tabular-nums",
                      a.net_profit == null
                        ? "text-muted-foreground"
                        : a.net_profit >= 0
                          ? "text-success"
                          : "text-destructive",
                    )}
                  >
                    {a.net_profit != null
                      ? `${a.net_profit >= 0 ? "+" : ""}${formatCurrency(a.net_profit)}`
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
