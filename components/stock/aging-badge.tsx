import { Badge } from "@/components/ui/badge";
import type { AgingTier } from "@/lib/queries/stock";

const LABEL: Record<AgingTier, string> = {
  fresh: "Récent",
  warming: "À surveiller",
  stale: "À écouler",
};

const VARIANT: Record<AgingTier, "success" | "warning" | "destructive"> = {
  fresh: "success",
  warming: "warning",
  stale: "destructive",
};

export function AgingBadge({
  tier,
  days,
}: {
  tier: AgingTier;
  days: number | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={VARIANT[tier]}>{LABEL[tier]}</Badge>
      {days != null ? (
        <span className="text-xs text-muted-foreground tabular-nums">
          {days}j
        </span>
      ) : null}
    </div>
  );
}
