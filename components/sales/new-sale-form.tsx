"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { celebrateFirstSale } from "@/lib/confetti";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SaleFieldset } from "@/components/sales/sale-fieldset";
import { ProfitPreview } from "@/components/sales/profit-preview";
import {
  saleFormSchema,
  nullify,
  type SaleFormInput,
} from "@/lib/validations/sale";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { InStockArticle } from "@/lib/queries/sales";

const today = new Date().toISOString().slice(0, 10);

type NewSaleFormProps = {
  article: InStockArticle;
  currentUserId: string;
  sellers: Array<{
    id: string;
    username: string;
    full_name: string | null;
    color: string;
  }>;
};

export function NewSaleForm({
  article,
  currentUserId,
  sellers,
}: NewSaleFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<SaleFormInput>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      article_id: article.id,
      seller_id: currentUserId,
      sale_date: today,
      sale_price: 0,
      sale_platform: "",
      buyer_name: "",
      shipping_cost_out: 0,
      platform_fees_pct: 0,
      platform_fees_amount: 0,
      other_fees: 0,
      payment_method: "",
      tracking_number: "",
      notes: "",
    },
  });

  async function onSubmit(values: SaleFormInput) {
    setPending(true);
    const supabase = createClient();

    // Detect first-ever sale (across the workspace) so we can celebrate.
    const { count: priorCount } = await supabase
      .from("sales")
      .select("id", { count: "exact", head: true });

    const { error } = await supabase.from("sales").insert({
      article_id: values.article_id,
      seller_id: values.seller_id,
      sale_date: values.sale_date,
      sale_price: values.sale_price,
      sale_platform: nullify(values.sale_platform),
      buyer_name: nullify(values.buyer_name),
      shipping_cost_out: values.shipping_cost_out,
      platform_fees_pct: values.platform_fees_pct,
      platform_fees_amount: values.platform_fees_amount,
      other_fees: values.other_fees,
      payment_method: nullify(values.payment_method),
      tracking_number: nullify(values.tracking_number),
      notes: nullify(values.notes),
    });

    if (error) {
      toast.error("Vente impossible", { description: error.message });
      setPending(false);
      return;
    }

    if ((priorCount ?? 0) === 0) {
      celebrateFirstSale();
      toast.success("Première vente enregistrée 🎉", {
        description: "Bravo ! Que ce soit la première d'une longue série.",
      });
    } else {
      toast.success("Vente enregistrée");
    }
    router.push(`/articles/${values.article_id}`);
    router.refresh();
  }

  const cover = article.photos?.[0];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Selected article header */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {cover ? (
                <Image
                  src={cover}
                  alt={article.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {CATEGORY_LABELS[article.category]}
                {article.size ? ` · ${article.size}` : ""}
              </p>
              <p className="truncate text-base font-semibold">{article.name}</p>
              <p className="text-xs text-muted-foreground">
                Coût total{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {article.total_cost != null
                    ? formatCurrency(article.total_cost)
                    : "—"}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle>Détails de la vente</CardTitle>
              <CardDescription>
                Dès que tu enregistres, l&apos;article passe en statut « Vendu ».
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SaleFieldset form={form} sellers={sellers} />
            </CardContent>
          </Card>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <ProfitPreview form={form} totalCost={article.total_cost} />
          </div>
        </div>

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
            Enregistrer la vente
          </Button>
        </div>
      </form>
    </Form>
  );
}
