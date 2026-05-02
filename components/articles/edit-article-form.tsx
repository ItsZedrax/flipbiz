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
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArticleFieldset } from "@/components/articles/article-fieldset";
import {
  articleFormSchema,
  nullify,
  type ArticleFormInput,
} from "@/lib/validations/article";
import type { Article } from "@/types/domain";

const editSchema = z.object({ article: articleFormSchema });
type EditInput = z.input<typeof editSchema>;

export function EditArticleForm({
  article,
  userId,
}: {
  article: Article;
  userId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const defaults: ArticleFormInput = {
    category: article.category,
    condition: article.condition,
    name: article.name,
    brand: article.brand ?? "",
    reference: article.reference ?? "",
    serial_number: article.serial_number ?? "",
    size: article.size ?? "",
    colorway: article.colorway ?? "",
    certificate_number: article.certificate_number ?? "",
    accessories_description: article.accessories_description ?? "",
    notes: article.notes ?? "",
    has_certificate: article.has_certificate,
    has_original_box: article.has_original_box,
    has_accessories: article.has_accessories,
    tags: article.tags,
    photos: article.photos,
  };

  const form = useForm<EditInput>({
    resolver: zodResolver(editSchema),
    defaultValues: { article: defaults },
  });

  async function onSubmit(values: EditInput) {
    setPending(true);
    const supabase = createClient();
    const a = values.article;

    const { error } = await supabase
      .from("articles")
      .update({
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
      .eq("id", article.id);

    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
      setPending(false);
      return;
    }

    toast.success("Article mis à jour");
    router.push(`/articles/${article.id}`);
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
            <ArticleFieldset
              form={form}
              userId={userId}
              articleId={article.id}
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
