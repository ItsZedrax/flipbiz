import { cn } from "@/lib/utils";

export function SiteLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm"
        aria-hidden
      >
        <span className="text-base font-bold">F</span>
      </div>
      <span className="text-lg font-semibold tracking-tight">FlipBiz</span>
    </div>
  );
}
