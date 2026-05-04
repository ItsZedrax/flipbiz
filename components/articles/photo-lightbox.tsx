"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type PhotoLightboxProps = {
  photos: string[];
  initialIndex: number;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Fullscreen photo viewer with prev/next, swipe, and keyboard nav.
 * Uses a fixed overlay (not Radix Dialog) so we can keep the layout simple
 * and avoid focus-trap quirks on iOS.
 */
export function PhotoLightbox({
  photos,
  initialIndex,
  alt,
  open,
  onOpenChange,
}: PhotoLightboxProps) {
  const [index, setIndex] = React.useState(initialIndex);
  const touchStartX = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);
  const next = React.useCallback(
    () => setIndex((i) => (i + 1) % photos.length),
    [photos.length],
  );
  const prev = React.useCallback(
    () => setIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length],
  );

  // Keyboard navigation + body scroll lock.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, next, prev]);

  if (!open) return null;

  const current = photos[index];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={close}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        if (start == null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 60) {
          if (dx < 0) next();
          else prev();
        }
        touchStartX.current = null;
      }}
    >
      <button
        type="button"
        onClick={close}
        aria-label="Fermer"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
        style={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}
      >
        <X className="h-5 w-5" />
      </button>

      {photos.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Photo précédente"
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 place-items-center rounded-full bg-white/10 p-3 text-white backdrop-blur transition-colors hover:bg-white/20 sm:grid"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Photo suivante"
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 place-items-center rounded-full bg-white/10 p-3 text-white backdrop-blur transition-colors hover:bg-white/20 sm:grid"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}

      {current ? (
        <div
          className="relative h-full w-full max-h-[90vh] max-w-[95vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            key={current}
            src={current}
            alt={alt}
            fill
            sizes="100vw"
            className="object-contain animate-fade-in"
            unoptimized
            priority
          />
        </div>
      ) : null}

      {photos.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="flex gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                aria-label={`Photo ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
