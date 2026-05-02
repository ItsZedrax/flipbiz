import { History } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Tables } from "@/types/database";

const ACTION_LABELS: Record<string, string> = {
  INSERT: "créé",
  UPDATE: "modifié",
  DELETE: "supprimé",
};

const TABLE_LABELS: Record<string, string> = {
  articles: "l'article",
  purchases: "l'achat",
  sales: "la vente",
};

export function ArticleHistory({ entries }: { entries: Tables<"audit_log">[] }) {
  if (entries.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <History className="h-4 w-4" />
          Historique
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ul className="space-y-2 text-xs">
          {entries.slice(0, 8).map((e) => (
            <li
              key={e.id}
              className="flex items-baseline justify-between gap-2 border-l-2 border-border pl-3"
            >
              <span className="text-muted-foreground">
                {TABLE_LABELS[e.table_name] ?? e.table_name}{" "}
                <span className="text-foreground">
                  {ACTION_LABELS[e.action] ?? e.action.toLowerCase()}
                </span>
              </span>
              <span className="shrink-0 text-muted-foreground">
                {formatDistanceToNow(parseISO(e.created_at), {
                  locale: fr,
                  addSuffix: true,
                })}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
