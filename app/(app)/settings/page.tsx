import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettings, getProfilesForSettings } from "@/lib/queries/settings";
import { SettingsForm } from "@/components/settings/settings-form";
import { UsersCard } from "@/components/settings/users-card";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [settings, profiles] = await Promise.all([
    getSettings(),
    getProfilesForSettings(),
  ]);

  if (!settings) {
    return (
      <div className="mx-auto max-w-3xl animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="mt-2 text-sm text-destructive">
          Configuration manquante. Vérifie que la table <code>settings</code> a
          bien été initialisée (migration 1).
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Paramètres
        </h1>
        <p className="text-sm text-muted-foreground">
          Configuration globale du business. Toute l&apos;équipe partage ces
          réglages.
        </p>
      </div>
      <UsersCard profiles={profiles} />
      <SettingsForm settings={settings} />
    </div>
  );
}
