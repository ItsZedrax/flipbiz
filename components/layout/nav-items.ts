import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Boxes,
  BarChart3,
  Receipt,
  Download,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/",          label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/articles",  label: "Articles",        icon: Package },
  { href: "/stock",     label: "Stock",           icon: Boxes },
  { href: "/sales",     label: "Ventes",          icon: TrendingUp },
  { href: "/purchases", label: "Achats",          icon: ShoppingCart },
  { href: "/analytics", label: "Analytics",       icon: BarChart3 },
  { href: "/expenses",  label: "Dépenses",        icon: Receipt },
  { href: "/export",    label: "Export",          icon: Download },
  { href: "/settings",  label: "Paramètres",      icon: Settings },
];

/**
 * Curated mobile bottom-nav: most-used screens for daily resell ops.
 * Settings, Stock, Dépenses, Export → accessible via sidebar (desktop) or
 * the user menu / command palette / page filters (mobile).
 */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  NAV_ITEMS.find((i) => i.href === "/")!,
  NAV_ITEMS.find((i) => i.href === "/articles")!,
  NAV_ITEMS.find((i) => i.href === "/sales")!,
  NAV_ITEMS.find((i) => i.href === "/purchases")!,
  NAV_ITEMS.find((i) => i.href === "/analytics")!,
];

/** True if the current pathname should highlight the given nav item. */
export function isNavActive(currentPath: string, href: string): boolean {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(href + "/");
}
