"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, ExternalLink, Trash2, Link as LinkIcon, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type Props = {
  articleId: string;
  articleName: string;
  status?: string;
  children: React.ReactNode;
};

/**
 * Wraps any element in a right-click menu offering Open / Edit / Sell /
 * Copy link / Delete actions for an article.
 */
export function ArticleContextMenu({
  articleId,
  articleName,
  status,
  children,
}: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const canSell = status === "in_stock";

  async function handleDelete() {
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
    router.refresh();
  }

  async function copyLink() {
    const url = `${window.location.origin}/articles/${articleId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié");
    } catch {
      toast.error("Impossible de copier");
    }
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => router.push(`/articles/${articleId}`)}>
            <ExternalLink />
            Ouvrir la fiche
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => router.push(`/articles/${articleId}/edit`)}
          >
            <Pencil />
            Modifier
          </ContextMenuItem>
          {canSell ? (
            <ContextMenuItem onSelect={() => router.push(`/sales/new?article=${articleId}`)}>
              <ShoppingCart />
              Vendre
            </ContextMenuItem>
          ) : null}
          <ContextMenuItem onSelect={copyLink}>
            <LinkIcon />
            Copier le lien
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 />
            Supprimer
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Supprimer "${articleName}" ?`}
        description="L'article et toutes ses données associées (achat, vente) seront définitivement supprimés."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </>
  );
}
