"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PurchaseFieldset } from "@/components/articles/purchase-fieldset";
import { CostSummary } from "@/components/articles/cost-summary";
import { InvoiceUploader } from "@/components/shared/invoice-uploader";
import {
  purchaseFormSchema,
  nullify,
} from "@/lib/validations/article";
import type { Tables } from "@/types/database";

const editSchema = z.object({
  purchase: purchaseFormSchema,
  invoice_url: z.string().nullable(),
});
type EditInput = z.input<typeof editSchema>;

export function EditPurchaseForm({
  purchase,
  userId,
}: {
  purchase: Tables<"purchases">;
  userId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<EditInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      purchase: {
        purchase_date: purchase.purchase_date,
        purchase_price: Number(purchase.purchase_price),
        purchase_platform: purchase.purchase_platform ?? "",
        seller_name: purchase.seller_name ?? "",
        shipping_cost_in: Number(purchase.shipping_cost_in),
        packaging_cost: Number(purchase.packaging_cost),
        authentication_cost: Number(purchase.authentication_cost),
        other_costs: Number(purchase.other_costs),
        notes: purchase.notes ?? "",
      },
      invoice_url: purchase.invoice_url,
    },
  });

  async function onSubmit(values: EditInput) {
    setPending(true);
    const supabase = createClient();
    const p = values.purchase;

    const { error } = await supabase
      .from("purchases")
      .update({
        purchase_date: p.purchase_date,
        purchase_price: p.purchase_price,
        purchase_platform: nullify(p.purchase_platform),
        seller_name: nullify(p.seller_name),
        shipping_cost_in: p.shipping_cost_in,
        packaging_cost: p.packaging_cost,
        authentication_cost: p.authentication_cost,
        other_costs: p.other_costs,
        notes: nullify(p.notes),
        invoice_url: values.invoice_url,
      })
      .eq("id", purchase.id);

    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
      setPending(false);
      return;
    }

    toast.success("Achat mis à jour");
    router.push(`/articles/${purchase.article_id}`);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails de l&apos;achat</CardTitle>
            <CardDescription>
              Date, prix, plateforme et frais annexes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PurchaseFieldset form={form} />
            <CostSummary form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Facture</CardTitle>
            <CardDescription>
              Importe la facture ou le reçu (PDF, JPG, PNG).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="invoice_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Facture</FormLabel>
                  <FormControl>
                    <InvoiceUploader
                      value={field.value}
                      onChange={field.onChange}
                      userId={userId}
                      scope={`purchases/${purchase.id}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  );
}
