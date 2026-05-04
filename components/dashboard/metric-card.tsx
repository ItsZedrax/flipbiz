import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp } from "@/components/shared/count-up";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "danger" | "warning" | "hero";

type Delta = {
  /** Percentage delta vs previous period. Pass null when no comparison is possible. */
  pct: number | null;
  /** Optional label like "vs mois précédent". */
  label?: string;
};

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  /** Pre-formatted display value (used when no animation is needed). */
  value?: string;
  /**
   * If provided, the card animates from 0 → numericValue using `format`.
   * Overrides `value` when both are passed.
   */
  numericValue?: number;
  format?: (n: number) => string;
  hint?: string;
  tone?: Tone;
  delta?: Delta;
  className?: string;
};

const TONE_STYLES: Record<Exclude<Tone, "hero">, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  danger: "bg-destructive/15 text-destructive",
  warning: "bg-warning/15 text-warning",
};

function DeltaPill({ delta, hero = false }: { delta: Delta; hero?: boolean }) {
  if (delta.pct === null) return null;
  const pct = delta.pct;
  const positive = pct > 0.05;
  const negative = pct < -0.05;
  const Icon = positive ? ArrowUp : negative ? ArrowDown : Minus;

  const baseStyle = hero
    ? "bg-white/20 text-white"
    : positive
      ? "bg-success/15 text-success"
      : negative
        ? "bg-destructive/15 text-destructive"
        : "bg-muted text-muted-foreground";

  const formatted = `${positive ? "+" : ""}${pct.toFixed(0)}%`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums",
        baseStyle,
      )}
      title={delta.label}
    >
      <Icon className="h-2.5 w-2.5" />
      {formatted}
    </span>
  );
}

function CardInner({
  Icon,
  label,
  value,
  numericValue,
  format,
  hint,
  delta,
  iconWrap,
  labelClass,
  valueClass,
  hintClass,
  hero,
}: {
  Icon: LucideIcon;
  label: string;
  value?: string;
  numericValue?: number;
  format?: (n: number) => string;
  hint?: string;
  delta?: Delta;
  iconWrap: string;
  labelClass: string;
  valueClass: string;
  hintClass: string;
  hero?: boolean;
}) {
  const useAnimated =
    typeof numericValue === "number" && typeof format === "function";

  return (
    <CardContent className="relative flex items-center gap-4 p-5">
      <div className={iconWrap}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={labelClass}>{label}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <p className={valueClass}>
            {useAnimated ? (
              <CountUp value={numericValue!} format={format!} />
            ) : (
              value
            )}
          </p>
          {delta ? <DeltaPill delta={delta} hero={hero} /> : null}
        </div>
        {hint ? <p className={hintClass}>{hint}</p> : null}
      </div>
    </CardContent>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  numericValue,
  format,
  hint,
  tone = "default",
  delta,
  className,
}: MetricCardProps) {
  const hoverFx =
    "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg";

  if (tone === "hero") {
    return (
      <Card
        className={cn(
          "bg-hero-gradient relative overflow-hidden border-0 text-white shadow-md shadow-primary/25",
          hoverFx,
          "hover:shadow-xl hover:shadow-primary/40",
          className,
        )}
      >
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <CardInner
          Icon={Icon}
          label={label}
          value={value}
          numericValue={numericValue}
          format={format}
          hint={hint}
          delta={delta}
          hero
          iconWrap="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/20 backdrop-blur"
          labelClass="line-clamp-2 text-xs font-medium uppercase leading-tight tracking-wide text-white/80"
          valueClass="text-2xl font-semibold tracking-tight tabular-nums"
          hintClass="mt-0.5 truncate text-xs text-white/75"
        />
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", hoverFx, "hover:shadow-primary/10", className)}>
      <CardInner
        Icon={Icon}
        label={label}
        value={value}
        numericValue={numericValue}
        format={format}
        hint={hint}
        delta={delta}
        iconWrap={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-lg",
          TONE_STYLES[tone],
        )}
        labelClass="line-clamp-2 text-xs font-medium uppercase leading-tight tracking-wide text-muted-foreground"
        valueClass={cn(
          "text-2xl font-semibold tracking-tight tabular-nums",
          tone === "success" && "text-success",
          tone === "danger" && "text-destructive",
          tone === "warning" && "text-warning",
        )}
        hintClass="mt-0.5 truncate text-xs text-muted-foreground"
      />
    </Card>
  );
}
