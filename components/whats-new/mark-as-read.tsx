"use client";

import * as React from "react";
import { useWhatsNew } from "@/lib/hooks/use-whats-new";

/**
 * Side-effect-only component: when mounted (i.e. user opens /whats-new),
 * marks the latest changelog version as read.
 */
export function MarkAsRead() {
  const { markAsRead } = useWhatsNew();
  React.useEffect(() => {
    markAsRead();
  }, [markAsRead]);
  return null;
}
