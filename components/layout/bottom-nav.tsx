"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { MOBILE_NAV_ITEMS, isNavActive } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  // Drop "Paramètres" to keep 5 slots when admin is active.
  const items = isAdmin
    ? [
        ...MOBILE_NAV_ITEMS.filter((i) => i.href !== "/settings"),
        { href: "/admin", label: "Admin", icon: ShieldCheck, mobile: true },
      ]
    : MOBILE_NAV_ITEMS;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation principale"
    >
      <ul className="grid grid-cols-5">
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
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
