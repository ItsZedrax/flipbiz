"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldOff, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/layout/user-avatar";
import {
  toggleApproved,
  toggleAdmin,
  deleteUser,
} from "@/app/(app)/admin/actions";

export type AdminUser = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  color: string;
  isAdmin: boolean;
  isApproved: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminUser | null>(null);

  async function handleApprove(u: AdminUser, approve: boolean) {
    setPendingId(u.id);
    try {
      await toggleApproved(u.id, approve);
      toast.success(approve ? "Compte approuvé" : "Approbation retirée");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPendingId(null);
    }
  }

  async function handleAdmin(u: AdminUser, makeAdmin: boolean) {
    setPendingId(u.id);
    try {
      await toggleAdmin(u.id, makeAdmin);
      toast.success(makeAdmin ? "Admin promu" : "Admin retiré");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Inscrit le</TableHead>
              <TableHead className="hidden lg:table-cell">
                Dernière connexion
              </TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  Aucun utilisateur
                </TableCell>
              </TableRow>
            ) : null}
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const busy = pendingId === u.id;
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        fullName={u.fullName}
                        username={u.username}
                        color={u.color}
                        className="h-8 w-8"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {u.fullName || u.username}
                        </div>
                        <div className="truncate text-xs text-muted-foreground md:hidden">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {u.email}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {formatDate(u.lastSignInAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.isAdmin ? (
                        <Badge className="bg-primary text-primary-foreground">
                          Admin
                        </Badge>
                      ) : null}
                      {u.isApproved ? (
                        <Badge variant="secondary">Approuvé</Badge>
                      ) : (
                        <Badge variant="outline" className="border-warning text-warning">
                          En attente
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {!u.isApproved && !u.isAdmin ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => handleApprove(u, true)}
                        >
                          {busy ? <Loader2 className="animate-spin" /> : <Check />}
                          Approuver
                        </Button>
                      ) : !isSelf && u.isApproved && !u.isAdmin ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => handleApprove(u, false)}
                          title="Retirer l'approbation"
                        >
                          <X />
                        </Button>
                      ) : null}
                      {!isSelf && u.isApproved ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => handleAdmin(u, !u.isAdmin)}
                          title={u.isAdmin ? "Retirer admin" : "Promouvoir admin"}
                        >
                          {u.isAdmin ? <ShieldOff /> : <ShieldCheck />}
                        </Button>
                      ) : null}
                      {!isSelf ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={busy}
                          onClick={() => setDeleteTarget(u)}
                          title="Supprimer le compte"
                        >
                          <Trash2 />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DeleteUserDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => router.refresh()}
      />
    </>
  );
}

function DeleteUserDialog({
  target,
  onClose,
  onDeleted,
}: {
  target: AdminUser | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [confirmEmail, setConfirmEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!target) setConfirmEmail("");
  }, [target]);

  async function handleDelete() {
    if (!target) return;
    setPending(true);
    try {
      await deleteUser(target.id, confirmEmail);
      toast.success("Utilisateur supprimé");
      onDeleted();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPending(false);
    }
  }

  const open = !!target;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer {target?.username} ?</DialogTitle>
          <DialogDescription>
            Tous les articles, achats, ventes et dépenses de cet utilisateur
            seront définitivement supprimés. Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="confirm-email">
            Pour confirmer, saisis l&apos;email :{" "}
            <span className="font-mono text-xs">{target?.email}</span>
          </Label>
          <Input
            id="confirm-email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            autoComplete="off"
            placeholder={target?.email}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={
              pending ||
              !target ||
              confirmEmail.trim().toLowerCase() !==
                target.email.trim().toLowerCase()
            }
          >
            {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
