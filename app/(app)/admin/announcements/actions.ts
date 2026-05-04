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
  return user.id;
}

export async function createAnnouncement(
  message: string,
  type: "info" | "warning" | "danger",
) {
  const userId = await ensureAdmin();
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Le message ne peut pas être vide.");

  const admin = createAdminClient();
  const { error } = await admin.from("announcements").insert({
    message: trimmed,
    type,
    is_active: true,
    created_by: userId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
}

export async function toggleAnnouncementActive(id: string, active: boolean) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("announcements")
    .update({ is_active: active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
}

export async function deleteAnnouncement(id: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
}
