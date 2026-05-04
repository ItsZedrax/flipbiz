"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const THRESHOLD = 70;
const MAX_PULL = 130;
const RESISTANCE = 0.5;

/**
 * Touch-only pull-to-refresh wrapper.
 *
 * - Activates only when the document is scrolled to the top.
 * - Disables itself if a `[role="dialog"]` is open (e.g. lightbox / modal).
 * - On release past `THRESHOLD`, calls `router.refresh()` and shows a
 *   spinner until the next render commits.
 */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pullRef = React.useRef(0);
  const startYRef = React.useRef(0);
  const trackingRef = React.useRef(false);
  const [pull, setPull] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("ontouchstart" in window)) return;

    const isBlocked = () => {
      // A modal/dialog is open — yield to it.
      return !!document.querySelector('[role="dialog"]');
    };

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return;
      if (isBlocked()) return;
      startYRef.current = e.touches[0].clientY;
      trackingRef.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!trackingRef.current) return;
      if (window.scrollY > 0) {
        trackingRef.current = false;
        pullRef.current = 0;
        setPull(0);
        return;
      }
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        const eased = Math.min(MAX_PULL, delta * RESISTANCE);
        pullRef.current = eased;
        setPull(eased);
        // Suppress native overscroll/bounce while we own the gesture.
        if (e.cancelable) e.preventDefault();
      } else if (delta < 0) {
        // User reversed direction — abandon.
        trackingRef.current = false;
        pullRef.current = 0;
        setPull(0);
      }
    };

    const onTouchEnd = async () => {
      if (!trackingRef.current) return;
      trackingRef.current = false;
      const distance = pullRef.current;
      pullRef.current = 0;

      if (distance >= THRESHOLD) {
        setRefreshing(true);
        setPull(50); // hold spinner at fixed visible offset
        try {
          router.refresh();
        } finally {
          // Keep the spinner visible briefly so the gesture feels acknowledged.
          window.setTimeout(() => {
            setRefreshing(false);
            setPull(0);
          }, 700);
        }
      } else {
        setPull(0);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [router]);

  const progress = Math.min(1, pull / THRESHOLD);
  const ready = pull >= THRESHOLD;

  return (
    <>
      {/* Indicator — fixed at the top, fades + slides in with the pull. */}
      <div
        aria-hidden={!pull && !refreshing}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center lg:hidden"
        style={{
          transform: `translateY(${pull}px)`,
          opacity: pull > 0 || refreshing ? 1 : 0,
          transition: trackingRef.current
            ? "none"
            : "transform 220ms ease-out, opacity 220ms ease-out",
        }}
      >
        <div
          className={cn(
            "mt-2 grid h-10 w-10 place-items-center rounded-full shadow-md transition-colors",
            ready || refreshing
              ? "bg-hero-gradient text-white"
              : "bg-card text-muted-foreground",
          )}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowDown
              className="h-4 w-4 transition-transform"
              style={{ transform: `rotate(${progress * 180}deg)` }}
            />
          )}
        </div>
      </div>
      {children}
    </>
  );
}
