"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PLATFORMS } from "@/lib/constants";

const ALL = "all";

type Buyer = { id: string; username: string; full_name: string | null };

type Props = {
  totalCount: number;
  buyers: Buyer[];
};

export function PurchaseListToolbar({ totalCount, buyers }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");

  const buyerId = params.get("buyer") ?? ALL;
  const platform = params.get("platform") ?? ALL;
  const dateFrom = params.get("from") ?? "";
  const dateTo = params.get("to") ?? "";

  const update = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "" || v === ALL) next.delete(k);
        else next.set(k, v);
      }
      next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `/purchases?${qs}` : "/purchases");
      });
    },
    [params, router],
  );

  useEffect(() => {
    const current = params.get("search") ?? "";
    if (searchInput === current) return;
    const t = setTimeout(() => update({ search: searchInput }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const hasFilters =
    buyerId !== ALL ||
    platform !== ALL ||
    !!dateFrom ||
    !!dateTo ||
    !!params.get("search");

  function clearAll() {
    setSearchInput("");
    startTransition(() => router.push("/purchases"));
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Achats</h1>
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount > 1 ? "achats enregistrés" : "achat enregistré"}
          {hasFilters ? " (filtré)" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Recherche article (nom, marque, réf.)…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-muted"
              aria-label="Effacer"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={buyerId}
            onValueChange={(v) => update({ buyer: v })}
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Acheteur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous acheteurs</SelectItem>
              {buyers.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.full_name?.split(" ")[0] ?? b.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={platform}
            onValueChange={(v) => update({ platform: v })}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Plateforme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes plateformes</SelectItem>
              {DEFAULT_PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => update({ from: e.target.value })}
            className="h-9 w-[150px]"
            aria-label="Date min"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => update({ to: e.target.value })}
            className="h-9 w-[150px]"
            aria-label="Date max"
          />

          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X />
              Reset
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
