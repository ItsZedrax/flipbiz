import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSaleById } from "@/lib/queries/sales";
import { Button } from "@/components/ui/button";
import { EditSaleForm } from "@/components/sales/edit-sale-form";

export const metadata: Metadata = { title: "Modifier la vente" };

export default async function EditSalePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const detail = await getSaleById(params.id);
  if (!detail) notFound();

  const profilesRes = await supabase
    .from("profiles")
    .select("id, username, full_name, color")
    .order("username");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
        <Link
          href={detail.article ? `/articles/${detail.article.id}` : "/sales"}
        >
          <ArrowLeft />
          {detail.article ? "Retour à la fiche" : "Retour aux ventes"}
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Modifier la vente
        </h1>
        {detail.article ? (
          <p className="text-sm text-muted-foreground">{detail.article.name}</p>
        ) : null}
      </div>
      <EditSaleForm
        sale={detail.sale}
        totalCost={detail.totalCost}
        sellers={profilesRes.data ?? []}
      />
    </div>
  );
}
