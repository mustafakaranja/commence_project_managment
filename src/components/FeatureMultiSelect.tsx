"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export default function FeatureMultiSelect({
  label,
  hint,
  options,
  selected,
  onChange,
}: {
  label: string;
  hint?: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const extras = selected.filter((s) => !options.includes(s));
  const chips = [...options, ...extras];

  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item]);
  };

  const addCustom = () => {
    const value = custom.trim();
    if (!value) return;
    if (!selected.includes(value)) onChange([...selected, value]);
    setCustom("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-xs text-gray-400">{selected.length} selected</span>
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto rounded-lg border bg-white p-2">
        {chips.map((item) => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={`text-left text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                active
                  ? "bg-[#0F6E56] text-white border-[#0F6E56]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#0F6E56] hover:text-[#0F6E56]"
              }`}
            >
              {active && <X className="w-3 h-3 inline mr-1 -mt-0.5" />}
              {item}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add a custom feature"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addCustom}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
