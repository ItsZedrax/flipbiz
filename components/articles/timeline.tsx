import Link from "next/link";
import { ShoppingCart, TrendingUp, ArrowRight, Clock, Pencil, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layout/user-avatar";
import { formatCurrency, cn } from "@/lib/utils";
import type { ArticleDetail } from "@/lib/queries/articles";

export function Timeline({
  articleId,
  articleStatus,
  purchase,
  buyer,
  sale,
  seller,
  daysHeld,
}: {
  articleId: string;
  articleStatus: ArticleDetail["article"]["status"];
} & Pick<ArticleDetail, "purchase" | "buyer" | "sale" | "seller" | "daysHeld">) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Purchase */}
          {purchase ? (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                {sale ? (
                  <div className="my-1 w-px flex-1 bg-border" aria-hidden />
                ) : null}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Achat
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Link href={`/purchases/${purchase.id}/edit`}>
                      <Pencil className="h-3 w-3" />
                      Modifier
                    </Link>
                  </Button>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {buyer ? (
                    <UserAvatar
                      fullName={buyer.full_name}
                      username={buyer.username}
                      color={buyer.color}
                      className="h-6 w-6 text-[10px]"
                    />
                  ) : null}
                  <span className="text-sm font-medium">
                    {buyer?.full_name ?? buyer?.username ?? "—"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    le{" "}
                    {format(parseISO(purchase.purchase_date), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                  <span className="ml-auto text-sm font-semibold tabular-nums">
                    {formatCurrency(purchase.purchase_price)}
                  </span>
                </div>
                {purchase.purchase_platform || purchase.seller_name ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {purchase.purchase_platform ?? "—"}
                    {purchase.seller_name ? ` · vendeur : ${purchase.seller_name}` : ""}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Sale */}
          {sale ? (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Vente
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Link href={`/sales/${sale.id}/edit`}>
                      <Pencil className="h-3 w-3" />
                      Modifier
                    </Link>
                  </Button>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {seller ? (
                    <UserAvatar
                      fullName={seller.full_name}
                      username={seller.username}
                      color={seller.color}
                      className="h-6 w-6 text-[10px]"
                    />
                  ) : null}
                  <span className="text-sm font-medium">
                    {seller?.full_name ?? seller?.username ?? "—"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    le{" "}
                    {format(parseISO(sale.sale_date), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                  <span className="ml-auto text-sm font-semibold tabular-nums text-success">
                    {formatCurrency(sale.sale_price)}
                  </span>
                </div>
                {sale.sale_platform || sale.buyer_name ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {sale.sale_platform ?? "—"}
                    {sale.buyer_name ? ` · acheteur : ${sale.buyer_name}` : ""}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={cn(purchase ? "ml-12" : "")}>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  Pas encore vendu
                </div>
                {articleStatus === "in_stock" ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/sales/new?article=${articleId}`}>
                      <Plus className="h-3 w-3" />
                      Enregistrer la vente
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          )}

          {daysHeld != null ? (
            <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {daysHeld} jour{daysHeld > 1 ? "s" : ""} de détention
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
