"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function ensureAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Accès refusé");
  return { currentUserId: user.id };
}

export async function toggleApproved(userId: string, approved: boolean) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_approved: approved })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleAdmin(userId: string, makeAdmin: boolean) {
  const { currentUserId } = await ensureAdmin();
  const admin = createAdminClient();

  // Prevent removing the last admin.
  if (!makeAdmin) {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_admin", true);
    if ((count ?? 0) <= 1) {
      throw new Error(
        "Impossible : il doit rester au moins un administrateur.",
      );
    }
    if (userId === currentUserId) {
      throw new Error("Tu ne peux pas retirer ton propre statut admin.");
    }
  }

  const update: { is_admin: boolean; is_approved?: boolean } = {
    is_admin: makeAdmin,
  };
  // An admin must be approved.
  if (makeAdmin) update.is_approved = true;

  const { error } = await admin
    .from("profiles")
    .update(update)
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteUser(userId: string, confirmEmail: string) {
  const { currentUserId } = await ensureAdmin();
  if (userId === currentUserId) {
    throw new Error("Tu ne peux pas supprimer ton propre compte ici.");
  }

  const admin = createAdminClient();

  // Verify the email matches before nuking anything.
  const { data: targetUser, error: getErr } =
    await admin.auth.admin.getUserById(userId);
  if (getErr || !targetUser?.user) {
    throw new Error("Utilisateur introuvable");
  }
  if (
    targetUser.user.email?.trim().toLowerCase() !==
    confirmEmail.trim().toLowerCase()
  ) {
    throw new Error("L'email saisi ne correspond pas.");
  }

  // Cascade-delete app data (sql function), then auth user.
  const { error: rpcErr } = await admin.rpc("delete_user_cascade", {
    target_user: userId,
  });
  if (rpcErr) throw new Error(rpcErr.message);

  // delete_user_cascade already removes auth.users; double-check to be safe.
  await admin.auth.admin.deleteUser(userId).catch(() => {});

  revalidatePath("/admin");
}
