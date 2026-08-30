"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export type InvoiceItemRow = { description: string; amount: string };

export function emptyInvoiceItem(): InvoiceItemRow {
  return { description: "", amount: "" };
}

export default function InvoiceLineItems({
  items,
  onChange,
}: {
  items: InvoiceItemRow[];
  onChange: (items: InvoiceItemRow[]) => void;
}) {
  const update = (index: number, patch: Partial<InvoiceItemRow>) => {
    onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Invoice details *</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onChange([...items, emptyInvoiceItem()])}
        >
          <Plus className="w-3 h-3 mr-1" /> Add line
        </Button>
      </div>
      <p className="text-xs text-gray-400 -mt-1">Each service is a separate line. Amount 0 shows as Included.</p>
      {items.map((row, index) => (
        <div key={index} className="rounded-lg border bg-gray-50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">Line {index + 1}</p>
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <Textarea
            rows={2}
            className="resize-none"
            placeholder="e.g. Website frontend & design"
            value={row.description}
            onChange={(e) => update(index, { description: e.target.value })}
          />
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Amount (₹)</Label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={row.amount}
              onChange={(e) => update(index, { amount: e.target.value })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
