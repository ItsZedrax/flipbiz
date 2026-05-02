"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
};

export function CostSummary({ form: f }: Props) {
  const values = useWatch({
    control: f.control,
    name: [
      "purchase.purchase_price",
      "purchase.shipping_cost_in",
      "purchase.packaging_cost",
      "purchase.authentication_cost",
      "purchase.other_costs",
    ],
  }) as Array<number | string | null | undefined>;

  const [price, shipping, packaging, auth, other] = values.map((v) =>
    v == null || v === "" ? 0 : typeof v === "string" ? parseFloat(v) || 0 : v,
  );
  const total =
    (price ?? 0) +
    (shipping ?? 0) +
    (packaging ?? 0) +
    (auth ?? 0) +
    (other ?? 0);

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Coût total estimé
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(total)}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          Prix : <span className="tabular-nums">{formatCurrency(price ?? 0)}</span>
          <br />
          Frais : <span className="tabular-nums">{formatCurrency(total - (price ?? 0))}</span>
        </div>
      </CardContent>
    </Card>
  );
}
