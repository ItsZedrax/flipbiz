import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { NewArticleForm } from "@/components/articles/new-article-form";

export const metadata: Metadata = { title: "Nouvel article" };

export default async function NewArticlePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 animate-fade-in">
      <Breadcrumbs
        items={[{ label: "Articles", href: "/articles" }, { label: "Nouveau" }]}
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Nouvel article
        </h1>
        <p className="text-sm text-muted-foreground">
          Renseigne le produit et ton achat. Le statut sera « En stock » par
          défaut.
        </p>
      </div>
      <NewArticleForm userId={user.id} />
    </div>
  );
}
