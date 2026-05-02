import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Settings = Tables<"settings">;

export async function getSettings(): Promise<Settings | null> {
  const supabase = createClient();
  const res = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return res.data;
}

export async function getProfilesForSettings() {
  const supabase = createClient();
  const res = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, color, monthly_profit_goal, created_at")
    .order("created_at");
  return res.data ?? [];
}
