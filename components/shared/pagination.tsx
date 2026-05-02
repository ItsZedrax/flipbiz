"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
};

export function Pagination({ page, totalPages, basePath }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  function go(p: number) {
    const next = new URLSearchParams(params.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    const qs = next.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft />
        Précédent
      </Button>
      <span className="text-sm tabular-nums text-muted-foreground">
        Page {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
      >
        Suivant
        <ChevronRight />
      </Button>
    </div>
  );
}
