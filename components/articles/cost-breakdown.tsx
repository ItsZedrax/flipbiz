import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, cn } from "@/lib/utils";
import type { ArticleDetail } from "@/lib/queries/articles";

export function CostBreakdown({
  purchase,
  sale,
  totalCost,
  netProfit,
  roiPct,
}: Pick<
  ArticleDetail,
  "purchase" | "sale" | "totalCost" | "netProfit" | "roiPct"
>) {
  if (!purchase) return null;

  const rows: Array<[string, number, "in" | "out" | "neutral"]> = [
    ["Prix d'achat", purchase.purchase_price, "in"],
    ["Livraison achat", purchase.shipping_cost_in, "in"],
    ["Emballage", purchase.packaging_cost, "in"],
    ["Authentification", purchase.authentication_cost, "in"],
    ["Autres frais d'achat", purchase.other_costs, "in"],
  ];
  if (sale) {
    rows.push(["Prix de vente", sale.sale_price, "out"]);
    rows.push(["Livraison vente", -sale.shipping_cost_out, "neutral"]);
    rows.push([
      `Frais plateforme (${sale.platform_fees_pct}%)`,
      -sale.platform_fees_amount,
      "neutral",
    ]);
    if (sale.other_fees > 0) {
      rows.push(["Autres frais vente", -sale.other_fees, "neutral"]);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Détail financier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <ul className="space-y-1.5">
          {rows
            .filter((r) => r[1] !== 0)
            .map(([label, amount, kind], i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    kind === "out" ? "text-success" : "",
                  )}
                >
                  {amount >= 0 ? "" : "−"}
                  {formatCurrency(Math.abs(amount))}
                </span>
              </li>
            ))}
        </ul>

        <Separator />

        <div className="flex justify-between text-sm">
          <span className="font-medium">Coût total</span>
          <span className="font-semibold tabular-nums">
            {totalCost != null ? formatCurrency(totalCost) : "—"}
          </span>
        </div>

        {sale && netProfit != null ? (
          <>
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Profit net</span>
              <div className="text-right">
                <div
                  className={cn(
                    "text-2xl font-bold tabular-nums",
                    netProfit >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {netProfit >= 0 ? "+" : ""}
                  {formatCurrency(netProfit)}
                </div>
                {roiPct != null ? (
                  <div className="text-xs text-muted-foreground">
                    ROI {roiPct >= 0 ? "+" : ""}
                    {roiPct.toFixed(1)}%
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
