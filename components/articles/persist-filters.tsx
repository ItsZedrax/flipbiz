"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "flipbiz:articles-filters";
/** Params we want to remember across sessions (not pagination, not search). */
const PERSIST_KEYS = [
  "view",
  "sort",
  "category",
  "status",
  "condition",
  "buyer",
  "priceMin",
  "priceMax",
];

/**
 * Mounted on the Articles page. On first visit with no relevant query params,
 * restores the user's last filter snapshot from localStorage. Otherwise, saves
 * the current snapshot whenever the URL changes.
 */
export function PersistArticlesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const restoredRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) Restore once on first visit if no relevant params are present.
    if (!restoredRef.current) {
      restoredRef.current = true;
      const hasAny = PERSIST_KEYS.some((k) => params.has(k));
      if (!hasAny) {
        try {
          const saved = window.localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const sp = new URLSearchParams(saved);
            // Preserve any current params (e.g. `q` search) and overlay saved.
            const merged = new URLSearchParams(params.toString());
            sp.forEach((v, k) => merged.set(k, v));
            router.replace(`${pathname}?${merged.toString()}`);
            return;
          }
        } catch {}
      }
    }

    // 2) Save the relevant subset of the current URL params.
    try {
      const snapshot = new URLSearchParams();
      PERSIST_KEYS.forEach((k) => {
        const v = params.get(k);
        if (v) snapshot.set(k, v);
      });
      window.localStorage.setItem(STORAGE_KEY, snapshot.toString());
    } catch {}
  }, [params, pathname, router]);

  return null;
}
