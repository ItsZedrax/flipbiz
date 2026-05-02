import Link from "next/link";
import Image from "next/image";
import { ImageOff, Pencil } from "lucide-react";
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
import { UserAvatar } from "@/components/layout/user-avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import type { SaleListItem } from "@/lib/queries/sales";

export function SaleTable({ items }: { items: SaleListItem[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Article</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Vendeur</TableHead>
            <TableHead>Plateforme</TableHead>
            <TableHead className="text-right">Prix</TableHead>
            <TableHead className="text-right">Net</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableEmpty colSpan={9}>
              Aucune vente ne correspond à ces filtres.
            </TableEmpty>
          ) : (
            items.map((s) => {
              const cover = s.article?.photos?.[0];
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={s.article ? `/articles/${s.article.id}` : "#"}
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
                    {s.article ? (
                      <Link
                        href={`/articles/${s.article.id}`}
                        className="block hover:underline"
                      >
                        <div className="font-medium">{s.article.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {CATEGORY_LABELS[s.article.category]}
                        </div>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(parseISO(s.sale_date), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {s.seller ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          fullName={s.seller.full_name}
                          username={s.seller.username}
                          color={s.seller.color}
                          className="h-6 w-6 text-[10px]"
                        />
                        <span className="text-sm">
                          {s.seller.full_name?.split(" ")[0] ?? s.seller.username}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {s.sale_platform ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(Number(s.sale_price))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCurrency(s.net_revenue)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold tabular-nums",
                      s.net_profit == null
                        ? "text-muted-foreground"
                        : s.net_profit >= 0
                          ? "text-success"
                          : "text-destructive",
                    )}
                  >
                    {s.net_profit != null
                      ? `${s.net_profit >= 0 ? "+" : ""}${formatCurrency(s.net_profit)}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/sales/${s.id}/edit`} aria-label="Modifier">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
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
