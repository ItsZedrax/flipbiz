import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries/settings";
import { Button } from "@/components/ui/button";
import { EditExpenseForm } from "@/components/expenses/edit-expense-form";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = { title: "Modifier la dépense" };

export default async function EditExpensePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [expenseRes, settings, profilesRes] = await Promise.all([
    supabase.from("expenses").select("*").eq("id", params.id).maybeSingle(),
    getSettings(),
    supabase
      .from("profiles")
      .select("id, username, full_name, color")
      .order("username"),
  ]);

  if (!expenseRes.data) notFound();

  const categories =
    settings?.categories && settings.categories.length > 0
      ? settings.categories
      : DEFAULT_EXPENSE_CATEGORIES;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
        <Link href="/expenses">
          <ArrowLeft />
          Retour aux dépenses
        </Link>
      </Button>
      <EditExpenseForm
        expense={expenseRes.data}
        categories={categories}
        users={profilesRes.data ?? []}
      />
    </div>
  );
}
