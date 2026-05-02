"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
};

export function ChipListEditor({
  value,
  onChange,
  placeholder = "Ajouter…",
  emptyMessage = "Liste vide.",
  disabled = false,
}: Props) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...value, v]);
    setDraft("");
  }

  function remove(item: string) {
    onChange(value.filter((v) => v !== item));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
        <Button type="button" onClick={add} disabled={disabled || !draft.trim()}>
          <Plus />
          Ajouter
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="gap-1.5 pr-1 text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                disabled={disabled}
                className="grid h-4 w-4 place-items-center rounded-sm opacity-60 transition-opacity hover:bg-foreground/10 hover:opacity-100"
                aria-label={`Retirer ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
