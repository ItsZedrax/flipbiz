"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChipListEditor } from "@/components/settings/chip-list-editor";
import {
  settingsFormSchema,
  type SettingsFormInput,
} from "@/lib/validations/settings";
import type { Settings } from "@/lib/queries/settings";

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<SettingsFormInput>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      platforms: settings.platforms,
      categories: settings.categories,
      monthly_profit_goal: Number(settings.monthly_profit_goal),
    },
  });

  async function onSubmit(values: SettingsFormInput) {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("settings")
      .update({
        platforms: values.platforms,
        categories: values.categories,
        monthly_profit_goal: values.monthly_profit_goal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
      setPending(false);
      return;
    }
    toast.success("Paramètres enregistrés");
    setPending(false);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Objectif business</CardTitle>
            <CardDescription>
              Cible mensuelle de profit net pour toute l&apos;équipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="monthly_profit_goal"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>Objectif mensuel (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={100}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Sert de référence partout dans l&apos;app.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plateformes</CardTitle>
            <CardDescription>
              Liste des plateformes d&apos;achat/vente disponibles dans les
              menus déroulants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              control={form.control}
              name="platforms"
              render={({ field }) => (
                <ChipListEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Vinted, eBay…"
                  emptyMessage="Aucune plateforme."
                  disabled={pending}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catégories de dépenses</CardTitle>
            <CardDescription>
              Catégories disponibles dans le journal des dépenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              control={form.control}
              name="categories"
              render={({ field }) => (
                <ChipListEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Emballage, Abonnement…"
                  emptyMessage="Aucune catégorie."
                  disabled={pending}
                />
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  );
}
