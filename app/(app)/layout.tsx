import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

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
    .select("id, username, full_name, avatar_url, color")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6">
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
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
