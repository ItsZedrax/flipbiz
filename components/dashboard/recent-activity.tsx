import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/layout/user-avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import type { RecentActivityItem } from "@/lib/queries/dashboard";
import type { Enums } from "@/types/database";

export function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Activité récente
        </CardTitle>
        <CardDescription className="text-xs">
          Les 10 dernières actions de l&apos;équipe
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Pas encore d&apos;activité.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((item) => {
              const isPurchase = item.type === "purchase";
              const verb = isPurchase ? "a acheté" : "a vendu";
              const userLabel =
                item.user?.fullName?.split(" ")[0] ??
                item.user?.username ??
                "Quelqu'un";
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <UserAvatar
                    fullName={item.user?.fullName}
                    username={item.user?.username}
                    color={item.user?.color}
                    className="h-9 w-9"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      <span className="font-medium">{userLabel}</span>{" "}
                      <span className="text-muted-foreground">{verb}</span>{" "}
                      <span className="font-medium">
                        {item.article?.name ?? "—"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.article
                        ? CATEGORY_LABELS[
                            item.article.category as Enums<"article_category">
                          ]
                        : "—"}{" "}
                      ·{" "}
                      {formatDistanceToNow(parseISO(item.date), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      isPurchase ? "text-muted-foreground" : "text-success",
                    )}
                  >
                    {isPurchase ? "−" : "+"}
                    {formatCurrency(item.amount)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 border-t pt-3 text-center">
          <Link
            href="/articles"
            className="text-xs font-medium text-primary hover:underline"
          >
            Voir tous les articles →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
