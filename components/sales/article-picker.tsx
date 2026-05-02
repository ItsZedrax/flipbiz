"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { InStockArticle } from "@/lib/queries/sales";

export function ArticlePicker({ articles }: { articles: InStockArticle[] }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? articles.filter((a) => {
        const hay = `${a.name} ${a.brand ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
    : articles;

  if (articles.length === 0) {
    return (
      <Card className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Aucun article en stock à vendre. Ajoute d&apos;abord un article.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Recherche par nom ou marque…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun résultat.
        </p>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((a) => {
            const cover = a.photos?.[0];
            return (
              <Link
                key={a.id}
                href={`/sales/new?article=${a.id}`}
                className="group block focus:outline-none"
              >
                <Card className="overflow-hidden transition-shadow group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary">
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={a.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground">
                        <ImageOff className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {CATEGORY_LABELS[a.category]}
                      {a.size ? ` · ${a.size}` : ""}
                    </p>
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">
                      {a.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Coût{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {a.total_cost != null
                          ? formatCurrency(a.total_cost)
                          : "—"}
                      </span>
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
