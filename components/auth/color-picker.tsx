"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { AVATAR_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Couleur d'avatar"
      className="flex flex-wrap gap-2"
    >
      {AVATAR_COLORS.map((color) => {
        const selected = value === color;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Couleur ${color}`}
            className={cn(
              "relative grid h-9 w-9 place-items-center rounded-full ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected ? "scale-110 ring-2 ring-ring" : "hover:scale-105",
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          >
            {selected ? (
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
