"use client";

import { formatCurrency } from "@/lib/utils";

type Payload = {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

type Props = {
  active?: boolean;
  payload?: Payload[];
  label?: string | number;
  formatter?: (value: number) => string;
  labelFormatter?: (label: string | number) => string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  formatter = (v) => formatCurrency(v),
  labelFormatter,
}: Props) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover/95 px-3 py-2 text-xs shadow-md backdrop-blur">
      {label !== undefined ? (
        <div className="mb-1 font-medium text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      ) : null}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">
              {typeof p.value === "number" ? formatter(p.value) : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
