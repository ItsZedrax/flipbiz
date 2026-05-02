"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpenseFieldset } from "@/components/expenses/expense-fieldset";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  expenseFormSchema,
  type ExpenseFormInput,
} from "@/lib/validations/expense";
import type { Tables } from "@/types/database";

export function EditExpenseForm({
  expense,
  categories,
  users,
}: {
  expense: Tables<"expenses">;
  categories: string[];
  users: Array<{
    id: string;
    username: string;
    full_name: string | null;
    color: string;
  }>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const form = useForm<ExpenseFormInput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: expense.category,
      description: expense.description,
      amount: Number(expense.amount),
      date: expense.date,
      user_id: expense.user_id,
    },
  });

  async function onSubmit(values: ExpenseFormInput) {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("expenses")
      .update({
        user_id: values.user_id,
        category: values.category,
        description: values.description,
        amount: values.amount,
        date: values.date,
      })
      .eq("id", expense.id);
    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
      setPending(false);
      return;
    }
    toast.success("Dépense mise à jour");
    router.push("/expenses");
    router.refresh();
  }

  async function deleteExpense() {
    const supabase = createClient();
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expense.id);
    if (error) {
      toast.error("Suppression impossible", { description: error.message });
      throw error;
    }
    toast.success("Dépense supprimée");
    router.push("/expenses");
    router.refresh();
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modifier la dépense</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseFieldset
                form={form}
                categories={categories}
                users={users}
              />
            </CardContent>
          </Card>
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              disabled={pending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
              Supprimer
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={pending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : null}
                Enregistrer
              </Button>
            </div>
          </div>
        </form>
      </Form>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Supprimer cette dépense ?"
        description="Action irréversible."
        confirmLabel="Supprimer"
        onConfirm={deleteExpense}
      />
    </>
  );
}
