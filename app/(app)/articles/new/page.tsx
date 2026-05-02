import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
        <Link href="/articles">
          <ArrowLeft />
          Articles
        </Link>
      </Button>
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
