"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import type { Profile } from "@/types/domain";
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
import { ColorPicker } from "@/components/auth/color-picker";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username,
      full_name: profile.full_name ?? "",
      color: profile.color,
      monthly_profit_goal: profile.monthly_profit_goal,
    },
  });

  async function onSubmit(values: ProfileInput) {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        username: values.username,
        full_name: values.full_name,
        color: values.color,
        monthly_profit_goal: values.monthly_profit_goal,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
      setPending(false);
      return;
    }
    toast.success("Profil mis à jour");
    setPending(false);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom d&apos;utilisateur</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Couleur d&apos;avatar</FormLabel>
              <FormControl>
                <ColorPicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monthly_profit_goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objectif de profit mensuel (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={50}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </FormControl>
              <FormDescription>
                Affiché sur le tableau de bord pour suivre ta performance.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          Enregistrer
        </Button>
      </form>
    </Form>
  );
}
