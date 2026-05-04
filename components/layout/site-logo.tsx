import { cn } from "@/lib/utils";

export function SiteLogo({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm"
        aria-hidden
      >
        <span className="text-base font-bold">F</span>
      </div>
      {!iconOnly && (
        <span className="text-lg font-semibold tracking-tight">FlipBiz</span>
      )}
    </div>
  );
}
