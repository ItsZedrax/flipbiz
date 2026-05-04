"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAnnouncement,
  toggleAnnouncementActive,
  deleteAnnouncement,
} from "@/app/(app)/admin/announcements/actions";

export type AdminAnnouncement = {
  id: string;
  message: string;
  type: "info" | "warning" | "danger";
  isActive: boolean;
  createdAt: string;
};

const TYPE_LABEL = {
  info: "Info",
  warning: "Avertissement",
  danger: "Critique",
} as const;

const TYPE_BADGE = {
  info: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AnnouncementsManager({
  announcements,
}: {
  announcements: AdminAnnouncement[];
}) {
  const router = useRouter();
  const [message, setMessage] = React.useState("");
  const [type, setType] = React.useState<"info" | "warning" | "danger">("info");
  const [creating, setCreating] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleCreate() {
    if (!message.trim()) return;
    setCreating(true);
    try {
      await createAnnouncement(message, type);
      toast.success("Annonce publiée");
      setMessage("");
      setType("info");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(a: AdminAnnouncement) {
    setPendingId(a.id);
    try {
      await toggleAnnouncementActive(a.id, !a.isActive);
      toast.success(a.isActive ? "Annonce désactivée" : "Annonce activée");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(a: AdminAnnouncement) {
    if (!confirm(`Supprimer cette annonce ?`)) return;
    setPendingId(a.id);
    try {
      await deleteAnnouncement(a.id);
      toast.success("Annonce supprimée");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nouvelle annonce</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="ann-msg">Message</Label>
            <Textarea
              id="ann-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex : Maintenance prévue dimanche de 22h à minuit."
              rows={3}
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="ann-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger id="ann-type" className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Avertissement</SelectItem>
                  <SelectItem value="danger">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={creating || !message.trim()}>
              {creating ? <Loader2 className="animate-spin" /> : <Plus />}
              Publier
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            La bannière la plus récente parmi les annonces actives s&apos;affiche
            en haut de l&apos;app pour tous les utilisateurs.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Historique</h2>
        {announcements.length === 0 ? (
          <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
            Aucune annonce.
          </p>
        ) : (
          announcements.map((a) => (
            <Card key={a.id} className={a.isActive ? "" : "opacity-60"}>
              <CardContent className="flex flex-wrap items-start gap-3 p-4">
                <Badge className={TYPE_BADGE[a.type]}>{TYPE_LABEL[a.type]}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{a.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(a.createdAt)}
                    {a.isActive ? " · active" : " · inactive"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingId === a.id}
                    onClick={() => handleToggle(a)}
                    title={a.isActive ? "Désactiver" : "Activer"}
                  >
                    {a.isActive ? <PowerOff /> : <Power />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={pendingId === a.id}
                    onClick={() => handleDelete(a)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
