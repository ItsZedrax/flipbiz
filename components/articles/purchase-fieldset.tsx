"use client";

import { type UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PLATFORMS } from "@/lib/constants";

type Props = {
  // RHF can't infer through nested path prefixes — accept loose form type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
};

export function PurchaseFieldset({ form: f }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={f.control}
          name="purchase.purchase_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d&apos;achat *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={f.control}
          name="purchase.purchase_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix d&apos;achat (€) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={f.control}
          name="purchase.purchase_platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plateforme</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DEFAULT_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={f.control}
          name="purchase.seller_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendeur</FormLabel>
              <FormControl>
                <Input
                  placeholder="Pseudo / nom"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <FormLabel className="mb-2 block">Frais annexes (€)</FormLabel>
        <FormDescription className="mb-3">
          Tout ce qui s&apos;ajoute au prix d&apos;achat (livraison, emballage, auth…).
        </FormDescription>
        <div className="grid gap-3 sm:grid-cols-4">
          {(
            [
              ["shipping_cost_in", "Livraison"],
              ["packaging_cost", "Emballage"],
              ["authentication_cost", "Auth"],
              ["other_costs", "Autre"],
            ] as const
          ).map(([name, label]) => (
            <FormField
              key={name}
              control={f.control}
              name={`purchase.${name}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    {label}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={1}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
