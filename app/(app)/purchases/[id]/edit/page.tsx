import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EditPurchaseForm } from "@/components/purchases/edit-purchase-form";

export const metadata: Metadata = { title: "Modifier l'achat" };

export default async function EditPurchasePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [purchaseRes] = await Promise.all([
    supabase
      .from("purchases")
      .select("*")
      .eq("id", params.id)
      .maybeSingle(),
  ]);

  if (!purchaseRes.data) notFound();

  const { data: article } = await supabase
    .from("articles")
    .select("id, name")
    .eq("id", purchaseRes.data.article_id)
    .maybeSingle();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
        <Link href={article ? `/articles/${article.id}` : "/purchases"}>
          <ArrowLeft />
          Retour {article ? "à la fiche" : "aux achats"}
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Modifier l&apos;achat
        </h1>
        {article ? (
          <p className="text-sm text-muted-foreground">{article.name}</p>
        ) : null}
      </div>
      <EditPurchaseForm purchase={purchaseRes.data} userId={user.id} />
    </div>
  );
}
