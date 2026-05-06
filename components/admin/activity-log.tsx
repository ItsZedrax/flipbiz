import { ArrowDownToLine, Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/layout/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export type ActivityEntry = {
  id: string;
  tableName: string;
  recordId: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  createdAt: string;
  user: {
    username: string;
    full_name: string | null;
    color: string;
  } | null;
  changes: unknown;
};

const TABLE_LABELS: Record<string, string> = {
  articles: "article",
  purchases: "achat",
  sales: "vente",
  expenses: "dépense",
  profiles: "profil",
};

const ACTION_META: Record<
  ActivityEntry["action"],
  { label: string; icon: LucideIcon; tone: string }
> = {
  INSERT: { label: "créé", icon: Plus, tone: "bg-success/15 text-success" },
  UPDATE: { label: "modifié", icon: Pencil, tone: "bg-primary/10 text-primary" },
  DELETE: {
    label: "supprimé",
    icon: Trash2,
    tone: "bg-destructive/15 text-destructive",
  },
};

export function ActivityLog({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={ArrowDownToLine}
        title="Aucune activité enregistrée"
        description="Toutes les créations / modifications / suppressions apparaîtront ici."
      />
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Les 200 dernières actions, plus récentes d&apos;abord.
      </p>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {entries.map((e) => {
              const meta = ACTION_META[e.action];
              const Icon = meta.icon;
              const tableLabel = TABLE_LABELS[e.tableName] ?? e.tableName;
              return (
                <li
                  key={e.id}
                  className="flex items-start gap-3 px-4 py-3 sm:px-5"
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-md",
                      meta.tone,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                      {e.user ? (
                        <span className="flex items-center gap-1.5">
                          <UserAvatar
                            fullName={e.user.full_name}
                            username={e.user.username}
                            color={e.user.color}
                            className="h-5 w-5 text-[9px]"
                          />
                          <span className="font-medium">
                            {e.user.full_name?.split(" ")[0] ??
                              e.user.username}
                          </span>
                        </span>
                      ) : (
                        <span className="font-medium text-muted-foreground">
                          Système
                        </span>
                      )}
                      <span className="text-muted-foreground">a</span>
                      <span>{meta.label}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {tableLabel}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      ID&nbsp;: {e.recordId} ·{" "}
                      {formatDistanceToNow(parseISO(e.createdAt), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
