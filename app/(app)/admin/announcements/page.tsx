import { createAdminClient } from "@/lib/supabase/admin";
import {
  AnnouncementsManager,
  type AdminAnnouncement,
} from "@/components/admin/announcements-manager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("announcements")
    .select("id, message, type, is_active, created_at")
    .order("created_at", { ascending: false });

  const announcements: AdminAnnouncement[] = (data ?? []).map((a) => ({
    id: a.id,
    message: a.message,
    type: a.type,
    isActive: a.is_active,
    createdAt: a.created_at,
  }));

  return <AnnouncementsManager announcements={announcements} />;
}
