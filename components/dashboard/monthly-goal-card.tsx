import Link from "next/link";
import { Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";

type Props = {
  goal: number | null;
  current: number;
};

/**
 * Big monthly profit goal card with progress bar. Shown on the dashboard
 * when a goal is set; otherwise prompts the user to define one in Profile.
 */
export function MonthlyGoalCard({ goal, current }: Props) {
  if (goal == null || goal <= 0) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Définis un objectif de profit mensuel
              </p>
              <p className="text-xs text-muted-foreground">
                Suis ta progression en temps réel directement ici.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/profile">Définir un objectif</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pct = Math.max(0, (current / goal) * 100);
  const reached = current >= goal;
  const overflow = pct > 100;
  const fillWidth = Math.min(100, pct);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 text-white shadow-lg",
        reached
          ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-400 shadow-emerald-500/30"
          : "bg-hero-gradient shadow-primary/25",
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl"
        aria-hidden
      />
      <CardContent className="relative space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/20 backdrop-blur">
              {reached ? (
                <Trophy className="h-5 w-5" />
              ) : (
                <Target className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-white/80">
                Objectif du mois
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(Math.round(current))}
                <span className="text-sm font-normal text-white/80">
                  {" "}
                  / {formatCurrency(Math.round(goal))}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">
              {Math.round(pct)}%
            </p>
            <p className="text-xs text-white/80">
              {reached
                ? overflow
                  ? "objectif dépassé 🎉"
                  : "objectif atteint 🎯"
                : `${formatCurrency(Math.max(0, Math.round(goal - current)))} restants`}
            </p>
          </div>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-[width] duration-700 ease-out"
            style={{ width: `${fillWidth}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
