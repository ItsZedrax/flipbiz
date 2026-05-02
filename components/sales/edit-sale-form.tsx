"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
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
import { SaleFieldset } from "@/components/sales/sale-fieldset";
import { ProfitPreview } from "@/components/sales/profit-preview";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  saleFormSchema,
  nullify,
  type SaleFormInput,
} from "@/lib/validations/sale";
import type { Tables } from "@/types/database";

type EditSaleFormProps = {
  sale: Tables<"sales">;
  totalCost: number | null;
  sellers: Array<{
    id: string;
    username: string;
    full_name: string | null;
    color: string;
  }>;
};

export function EditSaleForm({
  sale,
  totalCost,
  sellers,
}: EditSaleFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const form = useForm<SaleFormInput>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      article_id: sale.article_id,
      seller_id: sale.seller_id,
      sale_date: sale.sale_date,
      sale_price: Number(sale.sale_price),
      sale_platform: sale.sale_platform ?? "",
      buyer_name: sale.buyer_name ?? "",
      shipping_cost_out: Number(sale.shipping_cost_out),
      platform_fees_pct: Number(sale.platform_fees_pct),
      platform_fees_amount: Number(sale.platform_fees_amount),
      other_fees: Number(sale.other_fees),
      payment_method: sale.payment_method ?? "",
      tracking_number: sale.tracking_number ?? "",
      notes: sale.notes ?? "",
    },
  });

  async function onSubmit(values: SaleFormInput) {
    setPending(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("sales")
      .update({
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
      })
      .eq("id", sale.id);

    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
      setPending(false);
      return;
    }

    toast.success("Vente mise à jour");
    router.push(`/articles/${sale.article_id}`);
    router.refresh();
  }

  async function deleteSale() {
    const supabase = createClient();
    // Delete sale, then revert article status to in_stock
    const { error: saleErr } = await supabase
      .from("sales")
      .delete()
      .eq("id", sale.id);
    if (saleErr) {
      toast.error("Suppression impossible", { description: saleErr.message });
      throw saleErr;
    }
    await supabase
      .from("articles")
      .update({ status: "in_stock" })
      .eq("id", sale.article_id);
    toast.success("Vente supprimée — article remis en stock");
    router.push(`/articles/${sale.article_id}`);
    router.refresh();
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader>
                <CardTitle>Détails de la vente</CardTitle>
                <CardDescription>
                  Modifie n&apos;importe quel champ — la vente reste liée à cet article.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SaleFieldset form={form} sellers={sellers} />
              </CardContent>
            </Card>

            <div className="lg:sticky lg:top-20 lg:self-start">
              <ProfitPreview form={form} totalCost={totalCost} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              disabled={pending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
              Supprimer la vente
            </Button>
            <div className="flex gap-2">
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
                Enregistrer
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Supprimer cette vente ?"
        description="L'article sera remis en statut « En stock ». Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={deleteSale}
      />
    </>
  );
}
