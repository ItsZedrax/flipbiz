"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { MOBILE_NAV_ITEMS, isNavActive } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  // Admins replace Paramètres with the Admin shortcut to keep 5 slots.
  const items = isAdmin
    ? [
        ...MOBILE_NAV_ITEMS.filter((i) => i.href !== "/settings"),
        { href: "/admin", label: "Admin", icon: ShieldCheck },
      ]
    : MOBILE_NAV_ITEMS;

  const activeIndex = items.findIndex((i) => isNavActive(pathname, i.href));
  const itemWidthPct = 100 / items.length;

  return (
    <nav
      className="glass-strong fixed inset-x-0 bottom-0 z-30 border-t lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation principale"
    >
      <div className="relative">
        {/* Sliding gradient indicator */}
        {activeIndex >= 0 ? (
          <span
            aria-hidden
            className="bg-hero-gradient pointer-events-none absolute top-0 h-[2px] rounded-full transition-all duration-300 ease-out"
            style={{
              width: `calc(${itemWidthPct}% - 2rem)`,
              left: `calc(${activeIndex * itemWidthPct}% + 1rem)`,
            }}
          />
        ) : null}
        <ul
          className="grid"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      active && "-translate-y-0.5 scale-110",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
