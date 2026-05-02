"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { AnalyticsPeriod } from "@/lib/queries/analytics";

const OPTIONS: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: "7d", label: "7j" },
  { value: "30d", label: "30j" },
  { value: "3m", label: "3 mois" },
  { value: "6m", label: "6 mois" },
  { value: "12m", label: "12 mois" },
  { value: "all", label: "Tout" },
];

export function PeriodSelector({ current }: { current: AnalyticsPeriod }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function pick(p: AnalyticsPeriod) {
    const next = new URLSearchParams(params.toString());
    if (p === "30d") next.delete("period");
    else next.set("period", p);
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `/analytics?${qs}` : "/analytics");
    });
  }

  return (
    <div
      role="tablist"
      aria-label="Période"
      className="inline-flex flex-wrap gap-1 rounded-md border bg-card p-1"
    >
      {OPTIONS.map((o) => {
        const active = o.value === current;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => pick(o.value)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
