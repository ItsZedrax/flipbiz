import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/components/layout/user-avatar";
import { formatCurrency } from "@/lib/utils";
import type { Tables } from "@/types/database";

type Profile = Pick<
  Tables<"profiles">,
  "id" | "username" | "full_name" | "avatar_url" | "color" | "monthly_profit_goal"
>;

export function UsersCard({ profiles }: { profiles: Profile[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Associés</CardTitle>
        <CardDescription>
          Tous les comptes ayant accès au business. Chacun gère son propre
          profil depuis « Mon profil ».
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profiles.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            Aucun associé pour l&apos;instant.
          </p>
        ) : (
          <ul className="divide-y">
            {profiles.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <UserAvatar
                  fullName={p.full_name}
                  username={p.username}
                  avatarUrl={p.avatar_url}
                  color={p.color}
                  className="h-10 w-10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {p.full_name ?? p.username}
                  </p>
                  <p className="text-xs text-muted-foreground">@{p.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Objectif perso
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {p.monthly_profit_goal != null
                      ? formatCurrency(Number(p.monthly_profit_goal))
                      : "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
