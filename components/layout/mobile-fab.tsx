"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

type FabAction = { href: string; label: string };

const ROUTES: Record<string, FabAction> = {
  "/articles": { href: "/articles/new", label: "Article" },
  "/sales": { href: "/sales/new", label: "Vente" },
  "/purchases": { href: "/articles/new", label: "Achat" },
  "/expenses": { href: "/expenses/new", label: "Dépense" },
};

/**
 * Floating "+" button on mobile that adapts to the current section.
 * Shows only on the section index pages (e.g. `/articles`), not on detail
 * or "new" routes — that would be redundant.
 */
export function MobileFab() {
  const pathname = usePathname();
  const action = ROUTES[pathname];

  if (!action) return null;

  return (
    <Link
      href={action.href}
      aria-label={`Nouveau · ${action.label}`}
      className="bg-hero-gradient fixed bottom-20 right-4 z-30 flex h-14 items-center gap-2 rounded-full px-5 text-white shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-105 active:scale-95 lg:hidden"
      style={{
        bottom: "calc(env(safe-area-inset-bottom) + 4.5rem)",
      }}
    >
      <Plus className="h-5 w-5" strokeWidth={2.5} />
      <span className="text-sm font-semibold">{action.label}</span>
    </Link>
  );
}
