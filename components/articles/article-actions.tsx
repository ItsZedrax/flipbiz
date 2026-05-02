"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type ArticleActionsProps = {
  articleId: string;
  articleName: string;
};

export function ArticleActions({ articleId, articleName }: ArticleActionsProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function deleteArticle() {
    const supabase = createClient();
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", articleId);
    if (error) {
      toast.error("Suppression impossible", { description: error.message });
      throw error;
    }
    toast.success("Article supprimé");
    router.push("/articles");
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/articles/${articleId}/edit`}>
            <Pencil />
            Modifier
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
          Supprimer
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Supprimer "${articleName}" ?`}
        description="L'article et toutes ses données associées (achat, vente) seront définitivement supprimés. Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={deleteArticle}
      />
    </>
  );
}
