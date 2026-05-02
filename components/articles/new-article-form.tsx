"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArticleFieldset } from "@/components/articles/article-fieldset";
import { PurchaseFieldset } from "@/components/articles/purchase-fieldset";
import { CostSummary } from "@/components/articles/cost-summary";
import {
  newArticleSchema,
  nullify,
  type NewArticleInput,
} from "@/lib/validations/article";

const today = new Date().toISOString().slice(0, 10);

export function NewArticleForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<NewArticleInput>({
    resolver: zodResolver(newArticleSchema),
    defaultValues: {
      article: {
        category: "sneakers",
        condition: "very_good",
        name: "",
        brand: "",
        reference: "",
        serial_number: "",
        size: "",
        colorway: "",
        certificate_number: "",
        accessories_description: "",
        notes: "",
        has_certificate: false,
        has_original_box: false,
        has_accessories: false,
        tags: [],
        photos: [],
      },
      purchase: {
        purchase_date: today,
        purchase_price: 0,
        purchase_platform: "",
        seller_name: "",
        shipping_cost_in: 0,
        packaging_cost: 0,
        authentication_cost: 0,
        other_costs: 0,
      },
    },
  });

  async function onSubmit(values: NewArticleInput) {
    setPending(true);
    const supabase = createClient();

    const a = values.article;
    const { data: inserted, error: artErr } = await supabase
      .from("articles")
      .insert({
        created_by: userId,
        category: a.category,
        name: a.name,
        brand: nullify(a.brand),
        reference: nullify(a.reference),
        serial_number: nullify(a.serial_number),
        size: nullify(a.size),
        colorway: nullify(a.colorway),
        condition: a.condition,
        has_certificate: a.has_certificate,
        certificate_number: nullify(a.certificate_number),
        has_original_box: a.has_original_box,
        has_accessories: a.has_accessories,
        accessories_description: nullify(a.accessories_description),
        notes: nullify(a.notes),
        tags: a.tags,
        photos: a.photos,
      })
      .select("id")
      .single();

    if (artErr || !inserted) {
      toast.error("Création échouée", {
        description: artErr?.message ?? "Erreur inconnue",
      });
      setPending(false);
      return;
    }

    const p = values.purchase;
    const { error: purchErr } = await supabase.from("purchases").insert({
      article_id: inserted.id,
      buyer_id: userId,
      purchase_date: p.purchase_date,
      purchase_price: p.purchase_price,
      purchase_platform: nullify(p.purchase_platform),
      seller_name: nullify(p.seller_name),
      shipping_cost_in: p.shipping_cost_in,
      packaging_cost: p.packaging_cost,
      authentication_cost: p.authentication_cost,
      other_costs: p.other_costs,
    });

    if (purchErr) {
      toast.error("Article créé mais l'achat n'a pas été enregistré", {
        description: purchErr.message,
      });
      setPending(false);
      router.push(`/articles/${inserted.id}`);
      return;
    }

    toast.success("Article créé");
    router.push(`/articles/${inserted.id}`);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations produit</CardTitle>
            <CardDescription>
              Les champs varient selon la catégorie sélectionnée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ArticleFieldset form={form} userId={userId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achat</CardTitle>
            <CardDescription>
              Quand, où, combien tu l&apos;as payé. Les frais s&apos;ajoutent au coût total.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PurchaseFieldset form={form} />
            <CostSummary form={form} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={pending}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            Créer l&apos;article
          </Button>
        </div>
      </form>
    </Form>
  );
}
