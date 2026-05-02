"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  totalCost: number | null;
};

const num = (v: number | string | null | undefined): number =>
  v == null || v === ""
    ? 0
    : typeof v === "string"
      ? parseFloat(v) || 0
      : v;

export function ProfitPreview({ form: f, totalCost }: Props) {
  const [price, shipping, fees, other] = useWatch({
    control: f.control,
    name: [
      "sale_price",
      "shipping_cost_out",
      "platform_fees_amount",
      "other_fees",
    ],
  }) as Array<number | string | null | undefined>;

  const salePrice = num(price);
  const totalFees = num(shipping) + num(fees) + num(other);
  const netRevenue = salePrice - totalFees;
  const profit = totalCost != null ? netRevenue - totalCost : null;
  const roi =
    totalCost != null && totalCost > 0 && profit != null
      ? Math.round((profit / totalCost) * 1000) / 10
      : null;

  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Aperçu
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          <li className="flex justify-between">
            <span className="text-muted-foreground">Prix de vente</span>
            <span className="tabular-nums">{formatCurrency(salePrice)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">− Frais de vente</span>
            <span className="tabular-nums">{formatCurrency(totalFees)}</span>
          </li>
          <li className="flex justify-between border-t pt-1">
            <span className="font-medium">Net encaissé</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(netRevenue)}
            </span>
          </li>
          {totalCost != null ? (
            <li className="flex justify-between">
              <span className="text-muted-foreground">− Coût total</span>
              <span className="tabular-nums">{formatCurrency(totalCost)}</span>
            </li>
          ) : null}
        </ul>
        {profit != null ? (
          <div className="mt-3 flex items-baseline justify-between border-t pt-3">
            <span className="text-sm font-medium">Profit net</span>
            <div className="text-right">
              <div
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  profit >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {profit >= 0 ? "+" : ""}
                {formatCurrency(profit)}
              </div>
              {roi != null ? (
                <div className="text-xs text-muted-foreground">
                  ROI {roi >= 0 ? "+" : ""}
                  {roi.toFixed(1)}%
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
            Coût d&apos;achat introuvable, profit non calculé.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
