import { AlertTriangle, ImageOff, Target, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardAlerts } from "@/lib/queries/dashboard";
import { cn, formatCurrency } from "@/lib/utils";

export function SmartAlerts({ alerts }: { alerts: DashboardAlerts }) {
  const items: AlertEntry[] = [];

  // Aging articles
  if (alerts.agingArticles.length > 0) {
    items.push({
      icon: AlertTriangle,
      tone: "warning",
      title: `${alerts.agingArticles.length} article${alerts.agingArticles.length > 1 ? "s" : ""} en stock depuis +60 jours`,
      detail: alerts.agingArticles
        .slice(0, 3)
        .map((a) => `${a.name} (${a.daysHeld}j)`)
        .join(" · "),
    });
  }

  // No photos
  if (alerts.noPhotoCount > 0) {
    items.push({
      icon: ImageOff,
      tone: "warning",
      title: `${alerts.noPhotoCount} article${alerts.noPhotoCount > 1 ? "s" : ""} sans photo`,
      detail: "Ajoute des photos pour faciliter les ventes.",
    });
  }

  // Monthly profit goal
  if (alerts.profitGoal && alerts.profitGoal > 0) {
    const pct = Math.min(
      100,
      Math.round((alerts.monthProfit / alerts.profitGoal) * 100),
    );
    const tone: AlertEntry["tone"] =
      pct >= 100 ? "success" : pct >= 50 ? "default" : "danger";
    items.push({
      icon: Target,
      tone,
      title: `Objectif mensuel : ${formatCurrency(alerts.monthProfit)} / ${formatCurrency(alerts.profitGoal)}`,
      detail: `${pct}% atteint`,
      progress: pct,
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Alertes intelligentes
        </CardTitle>
        <CardDescription className="text-xs">
          Ce qui mérite ton attention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {items.length === 0 ? (
          <div className="flex items-center gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-success" />
            Tout est sous contrôle. 🎉
          </div>
        ) : (
          items.map((item, i) => <AlertRow key={i} {...item} />)
        )}
      </CardContent>
    </Card>
  );
}

type AlertEntry = {
  icon: typeof AlertTriangle;
  tone: "default" | "success" | "warning" | "danger";
  title: string;
  detail?: string;
  progress?: number;
};

const TONE_BG: Record<AlertEntry["tone"], string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
};

const PROGRESS_COLOR: Record<AlertEntry["tone"], string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

function AlertRow({ icon: Icon, tone, title, detail, progress }: AlertEntry) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-md",
            TONE_BG[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{title}</p>
          {detail ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {detail}
            </p>
          ) : null}
          {progress !== undefined ? (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", PROGRESS_COLOR[tone])}
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
