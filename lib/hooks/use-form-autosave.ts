"use client";

import * as React from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";

const PREFIX = "flipbiz:draft:";
const DEBOUNCE_MS = 400;

/**
 * Persists a react-hook-form draft to localStorage on change, restores it on
 * mount, and exposes a `clear()` to wipe it (call after a successful submit).
 *
 * Pass `enabled = false` to disable on edit forms (we only want autosave for
 * "new ___" forms — restoring an old draft over an existing record is bad).
 */
export function useFormAutosave<T extends FieldValues>(
  key: string,
  form: UseFormReturn<T>,
  enabled = true,
) {
  const storageKey = `${PREFIX}${key}`;
  const restoredRef = React.useRef(false);
  const [hasDraft, setHasDraft] = React.useState(false);

  // Restore once on mount.
  React.useEffect(() => {
    if (!enabled || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { values: T; savedAt: number };
      if (!parsed?.values) return;
      // Don't restore drafts older than 7 days — likely stale.
      if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) {
        window.localStorage.removeItem(storageKey);
        return;
      }
      // Merge with existing defaults so any missing fields stay default.
      form.reset({ ...form.getValues(), ...parsed.values });
      setHasDraft(true);
    } catch {
      /* ignore corrupted draft */
    }
  }, [enabled, storageKey, form]);

  // Save on change with debounce.
  React.useEffect(() => {
    if (!enabled) return;
    let t: ReturnType<typeof setTimeout> | null = null;

    const sub = form.watch((values) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        try {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify({ values, savedAt: Date.now() }),
          );
        } catch {}
      }, DEBOUNCE_MS);
    });

    return () => {
      if (t) clearTimeout(t);
      sub.unsubscribe();
    };
  }, [enabled, storageKey, form]);

  const clear = React.useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {}
    setHasDraft(false);
  }, [storageKey]);

  return { hasDraft, clear };
}
