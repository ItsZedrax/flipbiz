import { Footprints, Layers, Watch, Package, type LucideIcon } from "lucide-react";
import type { Enums } from "@/types/database";

const ICONS: Record<Enums<"article_category">, LucideIcon> = {
  sneakers: Footprints,
  cards: Layers,
  watches: Watch,
  other: Package,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: Enums<"article_category">;
  className?: string;
}) {
  const Icon = ICONS[category];
  return <Icon className={className} />;
}
