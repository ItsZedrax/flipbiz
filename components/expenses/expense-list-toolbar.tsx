"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState, useCallback } from "react";
import { Search, X, Plus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

type Props = {
  totalCount: number;
  totalAmount: number;
  categories: string[];
  users: Array<{ id: string; username: string; full_name: string | null }>;
};

export function ExpenseListToolbar({
  totalCount,
  totalAmount,
  categories,
  users,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");

  const cat = params.get("category") ?? ALL;
  const userId = params.get("user") ?? ALL;
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
        router.push(qs ? `/expenses?${qs}` : "/expenses");
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
    cat !== ALL ||
    userId !== ALL ||
    !!dateFrom ||
    !!dateTo ||
    !!params.get("search");

  function clearAll() {
    setSearchInput("");
    startTransition(() => router.push("/expenses"));
  }

  const fmt = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dépenses
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount > 1 ? "dépenses" : "dépense"}
            {hasFilters ? " (filtré)" : ""} ·{" "}
            <span className="font-medium text-foreground">
              {fmt.format(totalAmount)}
            </span>{" "}
            au total
          </p>
        </div>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/expenses/new">
            <Plus />
            Nouvelle dépense
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Recherche description…"
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
            value={cat}
            onValueChange={(v) => update({ category: v })}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes catégories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={userId}
            onValueChange={(v) => update({ user: v })}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Utilisateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.full_name?.split(" ")[0] ?? u.username}
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
