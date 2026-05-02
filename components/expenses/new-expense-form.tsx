"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpenseFieldset } from "@/components/expenses/expense-fieldset";
import {
  expenseFormSchema,
  type ExpenseFormInput,
} from "@/lib/validations/expense";

const today = new Date().toISOString().slice(0, 10);

export function NewExpenseForm({
  currentUserId,
  categories,
  users,
}: {
  currentUserId: string;
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

  const form = useForm<ExpenseFormInput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: categories[0] ?? "",
      description: "",
      amount: 0,
      date: today,
      user_id: currentUserId,
    },
  });

  async function onSubmit(values: ExpenseFormInput) {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.from("expenses").insert({
      user_id: values.user_id,
      category: values.category,
      description: values.description,
      amount: values.amount,
      date: values.date,
    });
    if (error) {
      toast.error("Création impossible", { description: error.message });
      setPending(false);
      return;
    }
    toast.success("Dépense ajoutée");
    router.push("/expenses");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle dépense</CardTitle>
            <CardDescription>
              Frais business : emballage, abonnements, transport, marketing…
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseFieldset
              form={form}
              categories={categories}
              users={users}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
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
      </form>
    </Form>
  );
}
