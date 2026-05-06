import { ActivityLog } from "@/components/admin/activity-log";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const admin = createAdminClient();

  const { data: entries } = await admin
    .from("audit_log")
    .select("id, table_name, record_id, action, user_id, changes, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  // Resolve user labels in one shot.
  const userIds = Array.from(
    new Set((entries ?? []).map((e) => e.user_id).filter(Boolean) as string[]),
  );
  const profilesById = new Map<
    string,
    { username: string; full_name: string | null; color: string }
  >();
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, username, full_name, color")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      profilesById.set(p.id, {
        username: p.username,
        full_name: p.full_name,
        color: p.color,
      });
    }
  }

  const rows = (entries ?? []).map((e) => ({
    id: e.id,
    tableName: e.table_name,
    recordId: e.record_id,
    action: e.action as "INSERT" | "UPDATE" | "DELETE",
    createdAt: e.created_at,
    user: e.user_id ? profilesById.get(e.user_id) ?? null : null,
    changes: e.changes,
  }));

  return <ActivityLog entries={rows} />;
}
