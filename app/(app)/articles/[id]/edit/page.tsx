import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EditArticleForm } from "@/components/articles/edit-article-form";

export const metadata: Metadata = { title: "Modifier l'article" };

export default async function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!article) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
        <Link href={`/articles/${article.id}`}>
          <ArrowLeft />
          Retour à la fiche
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Modifier l&apos;article
        </h1>
        <p className="text-sm text-muted-foreground">{article.name}</p>
      </div>
      <EditArticleForm article={article} userId={user.id} />
    </div>
  );
}
