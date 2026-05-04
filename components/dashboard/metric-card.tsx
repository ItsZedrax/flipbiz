import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "danger" | "warning" | "hero";
  className?: string;
};

const TONE_STYLES: Record<Exclude<NonNullable<MetricCardProps["tone"]>, "hero">, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  danger: "bg-destructive/15 text-destructive",
  warning: "bg-warning/15 text-warning",
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
  className,
}: MetricCardProps) {
  if (tone === "hero") {
    return (
      <Card
        className={cn(
          "bg-hero-gradient relative overflow-hidden border-0 text-white shadow-lg shadow-primary/25",
          className,
        )}
      >
        {/* Subtle highlights */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <CardContent className="relative flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/20 backdrop-blur">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-xs font-medium uppercase leading-tight tracking-wide text-white/80">
              {label}
            </p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
            {hint ? (
              <p className="mt-0.5 truncate text-xs text-white/75">{hint}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-lg",
            TONE_STYLES[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-medium uppercase leading-tight tracking-wide text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-0.5 text-2xl font-semibold tracking-tight tabular-nums",
              tone === "success" && "text-success",
              tone === "danger" && "text-destructive",
              tone === "warning" && "text-warning",
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
