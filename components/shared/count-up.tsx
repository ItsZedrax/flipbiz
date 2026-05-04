"use client";

import * as React from "react";

type CountUpProps = {
  value: number;
  format: (n: number) => string;
  /** Animation duration in ms. */
  duration?: number;
};

/**
 * Tweens a numeric value from 0 → `value` (or from previous → new) over
 * `duration` ms with an ease-out curve. Renders the running value via
 * `format`. Re-runs the animation when `value` changes.
 */
export function CountUp({ value, format, duration = 800 }: CountUpProps) {
  // SSR + first paint show the final formatted value to avoid layout shift.
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

  return <>{format(display)}</>;
}
