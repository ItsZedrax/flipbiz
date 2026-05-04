import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/articles/status-badge";
import { CategoryBadge } from "@/components/articles/category-icon";
import { ArticleContextMenu } from "@/components/articles/article-context-menu";
import { SmartImage } from "@/components/shared/smart-image";
import { formatCurrency, cn } from "@/lib/utils";
import type { ArticleListItem } from "@/lib/queries/articles";

export function ArticleGridCard({ article }: { article: ArticleListItem }) {
  const cover = article.photos?.[0];
  const profit = article.net_profit;

  return (
    <ArticleContextMenu
      articleId={article.id}
      articleName={article.name}
      status={article.status}
    >
      <Link
        href={`/articles/${article.id}`}
        className="group block focus:outline-none"
      >
        <Card className="h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-primary/10 group-focus-visible:ring-2 group-focus-visible:ring-ring">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            {cover ? (
              <SmartImage
                src={cover}
                alt={article.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageOff className="h-8 w-8" />
              </div>
            )}
            <div className="absolute left-2 top-2">
              <StatusBadge status={article.status} />
            </div>
          </div>
          <div className="p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CategoryBadge category={article.category} />
              {article.brand ? (
                <span className="truncate">{article.brand}</span>
              ) : null}
            </div>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
              {article.name}
            </h3>
            <div className="mt-2 flex items-baseline justify-between gap-2 text-xs">
              <span className="text-muted-foreground">
                Coût{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {article.total_cost != null
                    ? formatCurrency(article.total_cost)
                    : "—"}
                </span>
              </span>
              {profit != null ? (
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    profit >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {profit >= 0 ? "+" : ""}
                  {formatCurrency(profit)}
                </span>
              ) : null}
            </div>
          </div>
        </Card>
      </Link>
    </ArticleContextMenu>
  );
}
