"use client";

import { usePathname } from "next/navigation";

/**
 * Re-mounts children with a fade+slide animation each time the path changes.
 * Server components remain server-rendered; this is a pure CSS animation
 * driven by a `key` change, no JS animation lib required.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
