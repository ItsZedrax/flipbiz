"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { SiteLogo } from "@/components/layout/site-logo";
import { NAV_ITEMS, isNavActive } from "@/components/layout/nav-items";
import { LATEST_VERSION } from "@/data/changelog";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "flipbiz:sidebar-collapsed";

function useCollapsed() {
  const [collapsed, setCollapsed] = React.useState(false);

  // Hydrate from localStorage and apply the html class.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) === "1";
    setCollapsed(saved);
    document.documentElement.classList.toggle("sidebar-collapsed", saved);
  }, []);

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      document.documentElement.classList.toggle("sidebar-collapsed", next);
      return next;
    });
  }, []);

  return { collapsed, toggle };
}

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useCollapsed();

  return (
    <aside
      className="glass hidden h-screen shrink-0 flex-col border-r transition-[width] duration-200 lg:fixed lg:inset-y-0 lg:left-0 lg:flex"
      style={{ width: "var(--sidebar-w)" }}
    >
      <div
        className={cn(
          "relative flex h-14 items-center border-b",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <Link href="/" aria-label="Tableau de bord">
          <SiteLogo iconOnly={collapsed} />
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Ouvrir la sidebar" : "Réduire la sidebar"}
          title={collapsed ? "Ouvrir" : "Réduire"}
          className={cn(
            "absolute -right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <nav
        className={cn(
          "flex-1 space-y-1 overflow-y-auto py-4",
          collapsed ? "px-2" : "px-3",
        )}
      >
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors",
                collapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
        {isAdmin ? (
          <>
            <div className="my-2 border-t" />
            <Link
              href="/admin"
              title={collapsed ? "Admin" : undefined}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors",
                collapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                isNavActive(pathname, "/admin")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Admin</span>}
            </Link>
          </>
        ) : null}
      </nav>
      <Link
        href="/whats-new"
        title={collapsed ? `v${LATEST_VERSION}` : undefined}
        className={cn(
          "border-t text-xs text-muted-foreground transition-colors hover:text-foreground",
          collapsed ? "py-3 text-center" : "px-4 py-3",
        )}
      >
        {collapsed ? `v${LATEST_VERSION}` : `FlipBiz · v${LATEST_VERSION}`}
      </Link>
    </aside>
  );
}
