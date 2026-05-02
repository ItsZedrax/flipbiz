import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getInStockArticles } from "@/lib/queries/sales";
import { Button } from "@/components/ui/button";
import { ArticlePicker } from "@/components/sales/article-picker";
import { NewSaleForm } from "@/components/sales/new-sale-form";

export const metadata: Metadata = { title: "Nouvelle vente" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const articleParam = searchParams.article;
  const articleId = Array.isArray(articleParam) ? articleParam[0] : articleParam;

  // ===== Step 2: form for the chosen article =====
  if (articleId) {
    const articles = await getInStockArticles();
    const article = articles.find((a) => a.id === articleId);

    const profilesRes = await supabase
      .from("profiles")
      .select("id, username, full_name, color")
      .order("username");

    if (!article) {
      return (
        <div className="mx-auto max-w-3xl animate-fade-in">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/sales/new">
              <ArrowLeft />
              Retour
            </Link>
          </Button>
          <div className="mt-6 rounded-md border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Cet article n&apos;est pas disponible (déjà vendu ou inexistant).
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 animate-fade-in">
        <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
          <Link href="/sales/new">
            <ArrowLeft />
            Choisir un autre article
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Nouvelle vente
          </h1>
          <p className="text-sm text-muted-foreground">
            Renseigne le prix de vente et les frais — le profit s&apos;affiche en
            temps réel.
          </p>
        </div>
        <NewSaleForm
          article={article}
          currentUserId={user.id}
          sellers={profilesRes.data ?? []}
        />
      </div>
    );
  }

  // ===== Step 1: pick an in-stock article =====
  const articles = await getInStockArticles();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
        <Link href="/sales">
          <ArrowLeft />
          Retour aux ventes
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Nouvelle vente
        </h1>
        <p className="text-sm text-muted-foreground">
          Choisis l&apos;article que tu viens de vendre dans ton stock.
        </p>
      </div>
      <ArticlePicker articles={articles} />
    </div>
  );
}
