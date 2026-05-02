import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/auth/profile-form";
import { UserAvatar } from "@/components/layout/user-avatar";

export const metadata: Metadata = { title: "Mon profil" };

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6 flex items-center gap-4">
        <UserAvatar
          fullName={profile.full_name}
          username={profile.username}
          avatarUrl={profile.avatar_url}
          color={profile.color}
          className="h-16 w-16 text-lg"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mon profil</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Modifie ton nom, ton avatar et ton objectif mensuel. Visible par
            tous les associés.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
