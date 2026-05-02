import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getArticles,
  type ArticleFilters,
  type ArticleSort,
} from "@/lib/queries/articles";
import { ListToolbar } from "@/components/articles/list-toolbar";
import { ArticleGridCard } from "@/components/articles/article-grid-card";
import { ArticleTable } from "@/components/articles/article-table";
import { Pagination } from "@/components/shared/pagination";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CONDITIONS,
  ARTICLE_STATUSES,
} from "@/lib/validations/article";
import type { Database } from "@/types/database";

export const metadata: Metadata = { title: "Articles" };

type SearchParams = Record<string, string | string[] | undefined>;

const ALLOWED_SORTS: ArticleSort[] = [
  "created_at:desc",
  "created_at:asc",
  "name:asc",
  "name:desc",
  "price:desc",
  "price:asc",
  "profit:desc",
  "profit:asc",
];

function parseSearchParams(searchParams: SearchParams) {
  const get = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const view = (get("view") === "list" ? "list" : "grid") as "grid" | "list";
  const sortRaw = get("sort") ?? "created_at:desc";
  const sort = (
    ALLOWED_SORTS.includes(sortRaw as ArticleSort)
      ? sortRaw
      : "created_at:desc"
  ) as ArticleSort;

  const page = Math.max(1, Number(get("page") ?? 1) || 1);
  const perPageRaw = Number(get("perPage") ?? 20);
  const perPage = [20, 50, 100].includes(perPageRaw) ? perPageRaw : 20;

  const filters: ArticleFilters = {};
  const search = get("search");
  if (search) filters.search = search;

  const cat = get("category");
  if (
    cat &&
    (ARTICLE_CATEGORIES as readonly string[]).includes(cat)
  ) {
    filters.category = cat as Database["public"]["Enums"]["article_category"];
  }
  const status = get("status");
  if (
    status &&
    (ARTICLE_STATUSES as readonly string[]).includes(status)
  ) {
    filters.status = status as Database["public"]["Enums"]["article_status"];
  }
  const condition = get("condition");
  if (
    condition &&
    (ARTICLE_CONDITIONS as readonly string[]).includes(condition)
  ) {
    filters.condition =
      condition as Database["public"]["Enums"]["article_condition"];
  }
  const buyer = get("buyer");
  if (buyer) filters.buyerId = buyer;

  return { filters, sort, page, perPage, view };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const { filters, sort, page, perPage, view } =
    parseSearchParams(searchParams);

  const [articlesRes, profilesRes] = await Promise.all([
    getArticles({ filters, sort, page, perPage }),
    supabase.from("profiles").select("id, username, full_name").order("username"),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 animate-fade-in">
      <ListToolbar
        totalCount={articlesRes.total}
        buyers={profilesRes.data ?? []}
      />

      {view === "grid" ? (
        articlesRes.items.length === 0 ? (
          <div className="rounded-md border bg-card py-16 text-center text-sm text-muted-foreground">
            Aucun article ne correspond à ces filtres.
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {articlesRes.items.map((a) => (
              <ArticleGridCard key={a.id} article={a} />
            ))}
          </div>
        )
      ) : (
        <ArticleTable items={articlesRes.items} />
      )}

      <Pagination
        page={articlesRes.page}
        totalPages={articlesRes.totalPages}
        basePath="/articles"
      />
    </div>
  );
}
