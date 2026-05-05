import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getArticleById } from "@/lib/queries/articles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoGallery } from "@/components/articles/photo-gallery";
import { StatusBadge } from "@/components/articles/status-badge";
import { CategoryIcon } from "@/components/articles/category-icon";
import { ArticleActions } from "@/components/articles/article-actions";
import { Timeline } from "@/components/articles/timeline";
import { CostBreakdown } from "@/components/articles/cost-breakdown";
import { ArticleHistory } from "@/components/articles/article-history";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { UserAvatar } from "@/components/layout/user-avatar";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const detail = await getArticleById(params.id);
  return { title: detail?.article.name ?? "Article" };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const detail = await getArticleById(params.id);
  if (!detail) notFound();

  const { article, creator, purchase, buyer, sale, seller, history } = detail;

  const SPEC_FIELDS: Array<[string, string | null]> = [
    ["Marque", article.brand ?? null],
    ["Référence", article.reference ?? null],
    ["Taille", article.size ?? null],
    ["Coloris", article.colorway ?? null],
    ["N° de série", article.serial_number ?? null],
    [
      "Certificat",
      article.has_certificate
        ? article.certificate_number
          ? `Oui · ${article.certificate_number}`
          : "Oui"
        : null,
    ],
    ["Boîte d'origine", article.has_original_box ? "Oui" : null],
    [
      "Accessoires",
      article.has_accessories
        ? article.accessories_description ?? "Oui"
        : null,
    ],
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 animate-fade-in">
      {/* Top: breadcrumbs + actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Breadcrumbs
            items={[
              { label: "Articles", href: "/articles" },
              { label: article.name },
            ]}
          />
          <Button asChild variant="ghost" size="sm" className="-ml-2 hidden sm:inline-flex">
            <Link href="/articles">
              <ArrowLeft />
              Retour
            </Link>
          </Button>
        </div>
        <ArticleActions articleId={article.id} articleName={article.name} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: gallery + meta */}
        <div className="min-w-0 space-y-4">
          <PhotoGallery photos={article.photos} alt={article.name} />

          {/* Title + status */}
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <CategoryIcon category={article.category} className="h-3.5 w-3.5" />
              <span>{CATEGORY_LABELS[article.category]}</span>
              <span>·</span>
              <span>{CONDITION_LABELS[article.condition]}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {article.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={article.status} />
              {creator ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserAvatar
                    fullName={creator.full_name}
                    username={creator.username}
                    color={creator.color}
                    className="h-5 w-5 text-[9px]"
                  />
                  ajouté par {creator.full_name?.split(" ")[0] ?? creator.username}
                </span>
              ) : null}
            </div>
          </div>

          {/* Specs grid */}
          {SPEC_FIELDS.some(([, v]) => v) ? (
            <Card>
              <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
                {SPEC_FIELDS.filter(([, v]) => v).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {/* Tags */}
          {article.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          ) : null}

          {/* Notes */}
          {article.notes ? (
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{article.notes}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Right column: timeline + cost + history */}
        <div className="min-w-0 space-y-4">
          <Timeline
            articleId={article.id}
            articleStatus={article.status}
            purchase={purchase}
            buyer={buyer}
            sale={sale}
            seller={seller}
            daysHeld={detail.daysHeld}
          />
          <CostBreakdown
            purchase={purchase}
            sale={sale}
            totalCost={detail.totalCost}
            netProfit={detail.netProfit}
            roiPct={detail.roiPct}
          />
          <ArticleHistory entries={history} />
        </div>
      </div>
    </div>
  );
}
