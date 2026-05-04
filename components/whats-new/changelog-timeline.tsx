import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChangelogEntry, ChangelogItemType } from "@/data/changelog";

const TYPE_LABEL: Record<ChangelogItemType, string> = {
  new: "Nouveau",
  improvement: "Amélioration",
  fix: "Correctif",
};

const TYPE_STYLE: Record<ChangelogItemType, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  improvement: "bg-success/10 text-success border-success/20",
  fix: "bg-warning/10 text-warning border-warning/20",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ChangelogTimeline({ entries }: { entries: ChangelogEntry[] }) {
  return (
    <div className="space-y-4">
      {entries.map((entry, idx) => (
        <Card key={entry.version} className="overflow-hidden">
          <CardContent className="space-y-3 p-5">
            <header className="flex flex-wrap items-baseline gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[10px]",
                  idx === 0 && "border-primary text-primary",
                )}
              >
                v{entry.version}
              </Badge>
              <h2 className="text-base font-semibold">{entry.title}</h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDate(entry.date)}
              </span>
            </header>
            <ul className="space-y-2">
              {entry.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-[10px] font-medium",
                      TYPE_STYLE[item.type],
                    )}
                  >
                    {TYPE_LABEL[item.type]}
                  </Badge>
                  <span className="leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
