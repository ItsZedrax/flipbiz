"use client";

import { useEffect } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PLATFORMS } from "@/lib/constants";
import { UserAvatar } from "@/components/layout/user-avatar";

const PAYMENT_METHODS = ["Carte", "PayPal", "Virement", "Espèces", "Autre"];

type Seller = {
  id: string;
  username: string;
  full_name: string | null;
  color: string;
};

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  sellers: Seller[];
};

export function SaleFieldset({ form: f, sellers }: Props) {
  // Auto-recompute platform_fees_amount when price or pct changes.
  const [salePrice, feesPct] = useWatch({
    control: f.control,
    name: ["sale_price", "platform_fees_pct"],
  }) as Array<number | string | null | undefined>;

  useEffect(() => {
    const price =
      salePrice == null || salePrice === ""
        ? 0
        : typeof salePrice === "string"
          ? parseFloat(salePrice) || 0
          : salePrice;
    const pct =
      feesPct == null || feesPct === ""
        ? 0
        : typeof feesPct === "string"
          ? parseFloat(feesPct) || 0
          : feesPct;
    const amount = Math.round((price * pct) / 100);
    f.setValue("platform_fees_amount", amount, { shouldDirty: true });
  }, [salePrice, feesPct, f]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={f.control}
          name="seller_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendeur (associé) *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          fullName={s.full_name}
                          username={s.username}
                          color={s.color}
                          className="h-5 w-5 text-[9px]"
                        />
                        {s.full_name ?? s.username}
                      </div>
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
          name="sale_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de vente *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={f.control}
          name="sale_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix de vente (€) *</FormLabel>
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
        <FormField
          control={f.control}
          name="sale_platform"
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
      </div>

      <div>
        <FormLabel className="mb-2 block">Frais de vente (€)</FormLabel>
        <FormDescription className="mb-3">
          Le montant de commission est recalculé automatiquement à partir du
          pourcentage et du prix de vente.
        </FormDescription>
        <div className="grid gap-3 sm:grid-cols-4">
          <FormField
            control={f.control}
            name="shipping_cost_out"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Livraison
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
          <FormField
            control={f.control}
            name="platform_fees_pct"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Commission %
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step={0.5}
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
          <FormField
            control={f.control}
            name="platform_fees_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  = Commission €
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
          <FormField
            control={f.control}
            name="other_fees"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Autres
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
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={f.control}
          name="buyer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acheteur (externe)</FormLabel>
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
        <FormField
          control={f.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paiement</FormLabel>
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
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={f.control}
        name="tracking_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Numéro de suivi</FormLabel>
            <FormControl>
              <Input
                placeholder="LP00…FR"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={f.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Détails de la transaction, remarques, négo…"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
