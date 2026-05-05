"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState, useCallback } from "react";
import { Search, X, LayoutGrid, List, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CONDITIONS,
  ARTICLE_STATUSES,
} from "@/lib/validations/article";
import type { ArticleSort } from "@/lib/queries/articles";

const SORT_LABELS: Record<ArticleSort, string> = {
  "created_at:desc": "Plus récent",
  "created_at:asc": "Plus ancien",
  "name:asc": "Nom (A→Z)",
  "name:desc": "Nom (Z→A)",
  "price:desc": "Prix achat ↓",
  "price:asc": "Prix achat ↑",
  "profit:desc": "Profit ↓",
  "profit:asc": "Profit ↑",
};

const ALL = "all";

export function ListToolbar({
  totalCount,
  buyers,
}: {
  totalCount: number;
  buyers: Array<{ id: string; username: string; full_name: string | null }>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");

  const view = (params.get("view") ?? "grid") as "grid" | "list";
  const category = params.get("category") ?? ALL;
  const status = params.get("status") ?? ALL;
  const condition = params.get("condition") ?? ALL;
  const buyerId = params.get("buyer") ?? ALL;
  const sort = (params.get("sort") ?? "created_at:desc") as ArticleSort;
  const perPage = params.get("perPage") ?? "20";

  const updateParam = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "" || v === ALL) next.delete(k);
        else next.set(k, v);
      }
      // Reset page when filters change (but keep page when only `view` toggles)
      if ("page" in updates === false && Object.keys(updates).some((k) => k !== "view")) {
        next.delete("page");
      }
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `/articles?${qs}` : "/articles");
      });
    },
    [params, router],
  );

  // Debounce search
  useEffect(() => {
    const current = params.get("search") ?? "";
    if (searchInput === current) return;
    const t = setTimeout(() => {
      updateParam({ search: searchInput });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const hasFilters =
    category !== ALL ||
    status !== ALL ||
    condition !== ALL ||
    buyerId !== ALL ||
    !!params.get("search");

  function clearAll() {
    setSearchInput("");
    startTransition(() => router.push("/articles"));
  }

  return (
    <div className="space-y-3">
      {/* Top row: title + add button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Articles
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount > 1 ? "articles" : "article"}
            {hasFilters ? " (filtré)" : ""}
          </p>
        </div>
        {/* Hidden on mobile — the contextual FAB handles creation there. */}
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/articles/new">
            <Plus />
            Nouvel article
          </Link>
        </Button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Recherche par nom, marque, référence…"
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={category}
            onValueChange={(v) => updateParam({ category: v })}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes catégories</SelectItem>
              {ARTICLE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(v) => updateParam({ status: v })}
          >
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous statuts</SelectItem>
              {ARTICLE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={condition}
            onValueChange={(v) => updateParam({ condition: v })}
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="État" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous états</SelectItem>
              {ARTICLE_CONDITIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {CONDITION_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {buyers.length > 0 ? (
            <Select
              value={buyerId}
              onValueChange={(v) => updateParam({ buyer: v })}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Acheteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tous</SelectItem>
                {buyers.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.full_name?.split(" ")[0] ?? b.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={isPending}
            >
              <X />
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      {/* Sort + per page + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select
            value={sort}
            onValueChange={(v) => updateParam({ sort: v })}
          >
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(SORT_LABELS) as [ArticleSort, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select
            value={perPage}
            onValueChange={(v) => updateParam({ perPage: v })}
          >
            <SelectTrigger className="h-9 w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs
          value={view}
          onValueChange={(v) => updateParam({ view: v })}
        >
          <TabsList className="h-9">
            <TabsTrigger value="grid" className="px-3">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grille</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="px-3">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
