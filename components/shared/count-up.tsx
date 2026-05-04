"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/utils";

export type CountUpFormat =
  | "currency"
  | "integer"
  | "percent-1"
  | "percent-0";

function formatNumber(value: number, format: CountUpFormat): string {
  switch (format) {
    case "currency":
      return formatCurrency(Math.round(value));
    case "integer":
      return Math.round(value).toString();
    case "percent-1":
      return `${value.toFixed(1)}%`;
    case "percent-0":
      return `${Math.round(value)}%`;
  }
}

type CountUpProps = {
  value: number;
  format: CountUpFormat;
  /** Animation duration in ms. */
  duration?: number;
};

/**
 * Tweens a numeric value from previous → new over `duration` ms with an
 * ease-out curve. Format is a string (not a function) so it stays
 * serializable across the server/client component boundary.
 */
export function CountUp({ value, format, duration = 800 }: CountUpProps) {
  const [display, setDisplay] = React.useState<number>(value);
  const fromRef = React.useRef<number>(0);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const from = startedRef.current ? fromRef.current : 0;
    const to = value;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // easeOutQuint
      const eased = 1 - Math.pow(1 - t, 5);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    startedRef.current = true;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{formatNumber(display, format)}</>;
}
