import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
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
      <div className="flex min-h-screen flex-col lg:pl-60">
        <header className="glass-strong sticky top-0 z-20 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center justify-between border-b px-4 pt-[env(safe-area-inset-top)] sm:px-6">
          <Link href="/" aria-label="Tableau de bord" className="lg:hidden">
            <SiteLogo />
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            {profile ? (
              <UserMenu
                email={user.email ?? ""}
                fullName={profile.full_name}
                username={profile.username}
                avatarUrl={profile.avatar_url}
                color={profile.color}
              />
            ) : null}
          </div>
        </header>
        {announcement ? (
          <AnnouncementBanner
            message={announcement.message}
            type={announcement.type}
          />
        ) : null}
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <PullToRefresh>
            <PageTransition>{children}</PageTransition>
          </PullToRefresh>
        </main>
      </div>
      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
