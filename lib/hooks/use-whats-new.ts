"use client";

import * as React from "react";
import { LATEST_VERSION } from "@/data/changelog";

const STORAGE_KEY = "flipbiz:whats-new:last-seen";

/**
 * Tracks whether the user has seen the latest changelog entry.
 *
 * Returns:
 *  - hasUnread: true while the stored version is older than LATEST_VERSION
 *               (or no version stored yet, but we suppress for first-ever users
 *               to avoid the badge on signup — see logic below).
 *  - markAsRead: stores LATEST_VERSION in localStorage and clears the badge.
 *
 * SSR-safe: hasUnread is `false` until hydration finishes.
 */
export function useWhatsNew() {
  const [hasUnread, setHasUnread] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === null) {
        // First-ever visit: silently mark as read so we don't badge new users
        // who haven't actually missed anything.
        window.localStorage.setItem(STORAGE_KEY, LATEST_VERSION);
        setHasUnread(false);
        return;
      }
      setHasUnread(stored !== LATEST_VERSION);
    } catch {
      setHasUnread(false);
    }
  }, []);

  const markAsRead = React.useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, LATEST_VERSION);
    } catch {}
    setHasUnread(false);
  }, []);

  return { hasUnread, markAsRead };
}
