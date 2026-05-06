"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Database } from "@/types/database";

type Status = Database["public"]["Enums"]["article_status"];

const STATUS_OPTIONS: Array<{ value: Status; label: string }> = [
  { value: "in_stock", label: "En stock" },
  { value: "reserved", label: "Réservé" },
  { value: "sold", label: "Vendu" },
  { value: "returned", label: "Retourné" },
];

type Props = {
  selectedIds: string[];
  onClear: () => void;
};

export function BulkActionsBar({ selectedIds, onClear }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  if (selectedIds.length === 0) return null;

  async function applyStatus(status: Status) {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("articles")
      .update({ status })
      .in("id", selectedIds);
    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
    } else {
      toast.success(
        `Statut mis à jour pour ${selectedIds.length} article${selectedIds.length > 1 ? "s" : ""}`,
      );
      onClear();
      router.refresh();
    }
    setPending(false);
  }

  async function handleDelete() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("articles")
      .delete()
      .in("id", selectedIds);
    if (error) {
      toast.error("Suppression impossible", { description: error.message });
      setPending(false);
      throw error;
    }
    toast.success(
      `${selectedIds.length} article${selectedIds.length > 1 ? "s supprimés" : " supprimé"}`,
    );
    onClear();
    router.refresh();
    setPending(false);
  }

  return (
    <>
      <div
        className="glass-strong fixed inset-x-3 bottom-20 z-30 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-xl border p-3 shadow-lg shadow-primary/20 lg:bottom-6 lg:left-[calc(var(--sidebar-w)+1.5rem)] lg:right-6 lg:mx-0"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 4.5rem)" }}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            aria-label="Vider la sélection"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {selectedIds.length} sélectionné
            {selectedIds.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Select
            disabled={pending}
            onValueChange={(v) => applyStatus(v as Status)}
          >
            <SelectTrigger className="h-9 w-[150px] text-xs">
              <Tag className="h-3.5 w-3.5" />
              <SelectValue placeholder="Changer le statut" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => setConfirmDelete(true)}
            className="text-destructive hover:text-destructive"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Supprimer
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Supprimer ${selectedIds.length} article${selectedIds.length > 1 ? "s" : ""} ?`}
        description="Tous les achats et ventes liés seront aussi supprimés. Action irréversible."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </>
  );
}
