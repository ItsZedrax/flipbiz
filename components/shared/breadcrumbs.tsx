import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn(
        "flex flex-wrap items-center gap-1 text-xs text-muted-foreground",
        className,
      )}
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
            {item.href && !last ? (
              <Link
                href={item.href}
                className="rounded transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate",
                  last && "max-w-[18ch] font-medium text-foreground sm:max-w-none",
                )}
                aria-current={last ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!last ? (
              <ChevronRight
                className="h-3 w-3 shrink-0 text-muted-foreground/60"
                aria-hidden
              />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
