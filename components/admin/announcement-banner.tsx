import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  message: string;
  type: "info" | "warning" | "danger";
};

const STYLES = {
  info: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
} as const;

const ICONS = {
  info: Info,
  warning: AlertTriangle,
  danger: OctagonAlert,
} as const;

export function AnnouncementBanner({ message, type }: Props) {
  const Icon = ICONS[type];
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 border-b px-4 py-2 text-xs font-medium sm:px-6",
        STYLES[type],
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}
