"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageOff, ArrowUpDown } from "lucide-react";
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
import { AgingBadge } from "@/components/stock/aging-badge";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { StockItem, StockSort } from "@/lib/queries/stock";

type SortKey = "days" | "cost" | "name";
type SortDir = "asc" | "desc";

function parseSort(s: StockSort): { key: SortKey; dir: SortDir } {
  switch (s) {
    case "days_desc":
      return { key: "days", dir: "desc" };
    case "days_asc":
      return { key: "days", dir: "asc" };
    case "cost_desc":
      return { key: "cost", dir: "desc" };
    case "cost_asc":
      return { key: "cost", dir: "asc" };
    case "name_asc":
      return { key: "name", dir: "asc" };
    case "name_desc":
      return { key: "name", dir: "desc" };
  }
}

export function StockTable({
  items,
  sort,
}: {
  items: StockItem[];
  sort: StockSort;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const current = parseSort(sort);

  function toggleSort(key: SortKey) {
    let next: StockSort;
    if (current.key === key) {
      next = (`${key}_${current.dir === "asc" ? "desc" : "asc"}`) as StockSort;
    } else {
      next = (`${key}_${key === "name" ? "asc" : "desc"}`) as StockSort;
    }
    const qs = new URLSearchParams(params.toString());
    qs.set("sort", next);
    router.push(`/stock?${qs.toString()}`);
  }

  function SortHeader({ label, k }: { label: string; k: SortKey }) {
    const active = current.key === k;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-7 gap-1 px-2 font-medium uppercase tracking-wide text-xs text-muted-foreground hover:text-foreground"
        onClick={() => toggleSort(k)}
      >
        {label}
        <ArrowUpDown
          className={
            active ? "h-3 w-3 text-foreground" : "h-3 w-3 opacity-50"
          }
        />
      </Button>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>
              <SortHeader label="Article" k="name" />
            </TableHead>
            <TableHead>Acheté par</TableHead>
            <TableHead>Acheté le</TableHead>
            <TableHead>
              <SortHeader label="Détention" k="days" />
            </TableHead>
            <TableHead className="text-right">
              <SortHeader label="Coût total" k="cost" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableEmpty colSpan={6}>
              Stock vide. Ajoute un article pour commencer.
            </TableEmpty>
          ) : (
            items.map((a) => {
              const cover = a.photos?.[0];
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link href={`/articles/${a.id}`} tabIndex={-1}>
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
                        {CATEGORY_LABELS[a.category]}
                        {a.brand ? ` · ${a.brand}` : ""}
                        {a.size ? ` · ${a.size}` : ""}
                      </div>
                    </Link>
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
                  <TableCell className="whitespace-nowrap text-sm">
                    {a.purchase_date
                      ? format(parseISO(a.purchase_date), "d MMM yyyy", {
                          locale: fr,
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <AgingBadge tier={a.aging} days={a.days_held} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {a.total_cost != null ? formatCurrency(a.total_cost) : "—"}
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
