import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppHeader } from "@/components/layout/app-header";
import { MobileFab } from "@/components/layout/mobile-fab";
import { CommandPalette } from "@/components/layout/command-palette";
import { AnnouncementBanner } from "@/components/admin/announcement-banner";
import { PageTransition } from "@/components/layout/page-transition";
import { PullToRefresh } from "@/components/layout/pull-to-refresh";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, color, is_admin, is_approved")
    .eq("id", user.id)
    .single();

  // Gate access: pending users must wait for admin approval.
  if (profile && !profile.is_approved && !profile.is_admin) {
    redirect("/pending");
  }

  const { data: announcement } = await supabase
    .from("announcements")
    .select("id, message, type")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isAdmin = profile?.is_admin ?? false;

  return (
    <div className="min-h-screen">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex min-h-screen flex-col transition-[padding] duration-200 lg:pl-[var(--sidebar-w)]">
        <AppHeader
          email={user.email ?? ""}
          fullName={profile?.full_name ?? null}
          username={profile?.username ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
          color={profile?.color ?? "#6366f1"}
          hasProfile={!!profile}
        />
        {announcement ? (
          <AnnouncementBanner
            message={announcement.message}
            type={announcement.type}
          />
        ) : null}
        <main className="w-full max-w-full flex-1 overflow-x-clip px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <PullToRefresh>
            <PageTransition>{children}</PageTransition>
          </PullToRefresh>
        </main>
      </div>
      <BottomNav isAdmin={isAdmin} />
      <MobileFab />
      <CommandPalette isAdmin={isAdmin} />
    </div>
  );
}
