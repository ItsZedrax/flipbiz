"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortField = "created_at" | "name" | "price" | "profit";

type Props = {
  field: SortField;
  label: string;
  align?: "left" | "right";
};

/**
 * Clickable table header that toggles between asc / desc / none for the given
 * field, by updating the `sort` query param on the current URL.
 */
export function SortableHeader({ field, label, align = "left" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentSort = params.get("sort") ?? "created_at:desc";

  const [activeField, dir] = currentSort.split(":") as [SortField, "asc" | "desc"];
  const isActive = activeField === field;

  const handleClick = () => {
    const next = isActive
      ? dir === "desc"
        ? "asc"
        : "desc"
      : field === "name"
        ? "asc"
        : "desc";
    const sp = new URLSearchParams(params.toString());
    sp.set("sort", `${field}:${next}`);
    sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`);
  };

  const Icon = isActive
    ? dir === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
        isActive ? "text-foreground" : "text-muted-foreground",
        align === "right" && "ml-auto",
      )}
    >
      <span>{label}</span>
      <Icon className="h-3 w-3" />
    </button>
  );
}
