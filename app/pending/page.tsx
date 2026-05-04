import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { signOutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_approved, is_admin")
    .eq("id", user.id)
    .single();

  // Already approved or admin: bounce back to dashboard.
  if (profile?.is_approved || profile?.is_admin) redirect("/");

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-primary/5 via-background to-accent/30">
      <header className="flex items-center justify-between p-4 sm:p-6">
        <Link href="/" aria-label="FlipBiz">
          <SiteLogo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-warning/15 text-warning">
              <Clock className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Compte en attente d&apos;approbation
              </h1>
              <p className="text-sm text-muted-foreground">
                Ton inscription a bien été reçue. Un administrateur doit valider
                ton accès avant que tu puisses utiliser FlipBiz.
              </p>
              <p className="text-xs text-muted-foreground">
                Connecté en tant que <strong>{user.email}</strong>
              </p>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" className="w-full">
                Se déconnecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
