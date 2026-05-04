import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsersTable, type AdminUser } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  // Fetch up to 1000 auth users (plenty for this app).
  const { data: authData } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const authUsers = authData?.users ?? [];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, username, full_name, color, is_admin, is_approved");

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id as string, p]),
  );

  const users: AdminUser[] = authUsers
    .map((u) => {
      const p = profileById.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        username: p?.username ?? "—",
        fullName: p?.full_name ?? null,
        color: p?.color ?? "#6366f1",
        isAdmin: p?.is_admin ?? false,
        isApproved: p?.is_approved ?? false,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
      };
    })
    .sort((a, b) => {
      // Pending first, then by creation date desc.
      if (a.isApproved !== b.isApproved) return a.isApproved ? 1 : -1;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

  const pendingCount = users.filter((u) => !u.isApproved && !u.isAdmin).length;

  return (
    <div className="space-y-4">
      {pendingCount > 0 ? (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          {pendingCount} compte{pendingCount > 1 ? "s" : ""} en attente
          d&apos;approbation.
        </div>
      ) : null}
      <UsersTable users={users} currentUserId={currentUser?.id ?? ""} />
    </div>
  );
}
