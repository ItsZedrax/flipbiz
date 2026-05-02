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
  /** Show in the mobile bottom nav (max 5). */
  mobile?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/",          label: "Tableau de bord", icon: LayoutDashboard, mobile: true },
  { href: "/articles",  label: "Articles",        icon: Package,         mobile: true },
  { href: "/stock",     label: "Stock",           icon: Boxes,           mobile: true },
  { href: "/purchases", label: "Achats",          icon: ShoppingCart },
  { href: "/sales",     label: "Ventes",          icon: TrendingUp },
  { href: "/analytics", label: "Analytics",       icon: BarChart3,       mobile: true },
  { href: "/expenses",  label: "Dépenses",        icon: Receipt },
  { href: "/export",    label: "Export",          icon: Download },
  { href: "/settings",  label: "Paramètres",      icon: Settings,        mobile: true },
];

export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((i) => i.mobile);

/** True if the current pathname should highlight the given nav item. */
export function isNavActive(currentPath: string, href: string): boolean {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(href + "/");
}
