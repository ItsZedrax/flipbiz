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
import { formatCurrency } from "@/lib/utils";
import type { PurchaseListItem } from "@/lib/queries/purchases";

export function PurchaseTable({ items }: { items: PurchaseListItem[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Article</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Acheteur</TableHead>
            <TableHead>Plateforme</TableHead>
            <TableHead className="text-right">Prix</TableHead>
            <TableHead className="text-right">Frais</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableEmpty colSpan={9}>
              Aucun achat ne correspond à ces filtres.
            </TableEmpty>
          ) : (
            items.map((p) => {
              const cover = p.article?.photos?.[0];
              const fees = p.total_cost - Number(p.purchase_price);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={
                        p.article ? `/articles/${p.article.id}` : "#"
                      }
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
                    {p.article ? (
                      <Link
                        href={`/articles/${p.article.id}`}
                        className="block hover:underline"
                      >
                        <div className="font-medium">{p.article.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {CATEGORY_LABELS[p.article.category]}
                        </div>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(parseISO(p.purchase_date), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    {p.buyer ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          fullName={p.buyer.full_name}
                          username={p.buyer.username}
                          color={p.buyer.color}
                          className="h-6 w-6 text-[10px]"
                        />
                        <span className="text-sm">
                          {p.buyer.full_name?.split(" ")[0] ?? p.buyer.username}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.purchase_platform ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(Number(p.purchase_price))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fees > 0 ? `+${formatCurrency(fees)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(p.total_cost)}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/purchases/${p.id}/edit`} aria-label="Modifier">
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
