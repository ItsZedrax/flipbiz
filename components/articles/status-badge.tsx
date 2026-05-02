import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

const STATUS_VARIANT: Record<
  Enums<"article_status">,
  "success" | "warning" | "secondary" | "destructive"
> = {
  in_stock: "success",
  reserved: "warning",
  sold: "secondary",
  returned: "destructive",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Enums<"article_status">;
  className?: string;
}) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={cn(className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
