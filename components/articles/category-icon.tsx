import { Footprints, Layers, Watch, Package, type LucideIcon } from "lucide-react";
import type { Enums } from "@/types/database";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<Enums<"article_category">, LucideIcon> = {
  sneakers: Footprints,
  cards: Layers,
  watches: Watch,
  other: Package,
};

/** Inline icon (no background). */
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

/** Pill badge with category color. */
export function CategoryBadge({
  category,
  className,
}: {
  category: Enums<"article_category">;
  className?: string;
}) {
  const Icon = ICONS[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        CATEGORY_COLORS[category],
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {CATEGORY_LABELS[category]}
    </span>
  );
}

/** Square icon tile with category color background, sized via className (h-X w-X). */
export function CategoryIconTile({
  category,
  className,
}: {
  category: Enums<"article_category">;
  className?: string;
}) {
  const Icon = ICONS[category];
  return (
    <span
      className={cn(
        "grid place-items-center rounded-md border",
        CATEGORY_COLORS[category],
        className,
      )}
      aria-label={CATEGORY_LABELS[category]}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}
