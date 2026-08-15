"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import FeatureMultiSelect from "@/components/FeatureMultiSelect";
import QuotationPreview, { type QuotationPreviewData } from "@/components/QuotationPreview";
import {
  QUOTE_TYPES, TECH_OPTIONS, TIMELINE_UNITS, featuresForType,
} from "@/lib/quotation-catalog";
import { quotationTotals } from "@/lib/quotation-payload";
import { ArrowLeft, Download, Plus, Save, Trash2 } from "lucide-react";

type ServiceRow = { title: string; description: string; amount: string };

type FormState = {
  name: string;
  type: string;
  customType: string;
  clientName: string;
  clientAttention: string;
  clientAddress: string;
  overview: string;
  techStack: string[];
  timelineValue: string;
  timelineUnit: string;
  estimateLabel: string;
  services: ServiceRow[];
  features: string[];
  gstPercent: string;
  quoteDate: string;
  validUntil: string;
  notes: string;
  commitment: string;
};

const today = () => new Date().toISOString().split("T")[0];
const plus30 = () => addDays(new Date(), 30).toISOString().split("T")[0];

const emptyService = (): ServiceRow => ({ title: "", description: "", amount: "" });

export function emptyQuotationForm(): FormState {
  return {
    name: "",
    type: "Web Development",
    customType: "",
    clientName: "",
    clientAttention: "",
    clientAddress: "",
    overview: "",
    techStack: [],
    timelineValue: "10",
    timelineUnit: "Days",
    estimateLabel: "One-time cost estimation",
    services: [emptyService()],
    features: [],
    gstPercent: "18",
    quoteDate: today(),
    validUntil: plus30(),
    notes: "",
    commitment:
      "We are committed to a clean rollout: agreed scope, timely delivery, and support through go-live.",
  };
}

export function quotationToForm(quote: {
  name?: string;
  type?: string;
  clientName?: string;
  clientAttention?: string;
  clientAddress?: string;
  overview?: string;
  techStack?: string[];
  timelineValue?: number;
  timelineUnit?: string;
  estimateLabel?: string;
  services?: { title?: string; description?: string; amount?: number }[];
  features?: string[];
  gstPercent?: number;
  quoteDate?: string;
  validUntil?: string;
  notes?: string;
  commitment?: string;
}): FormState {
  const known = (QUOTE_TYPES as readonly string[]).includes(quote.type ?? "");
  return {
    name: quote.name ?? "",
    type: known ? String(quote.type) : "Custom",
    customType: known ? "" : (quote.type ?? ""),
    clientName: quote.clientName ?? "",
    clientAttention: quote.clientAttention ?? "",
    clientAddress: quote.clientAddress ?? "",
    overview: quote.overview ?? "",
    techStack: quote.techStack ?? [],
    timelineValue: String(quote.timelineValue ?? 10),
    timelineUnit: quote.timelineUnit ?? "Days",
    estimateLabel: quote.estimateLabel ?? "One-time cost estimation",
    services: (quote.services?.length ? quote.services : [emptyService()]).map((row) => ({
      title: row.title ?? "",
      description: row.description ?? "",
      amount: row.amount != null ? String(row.amount) : "",
    })),
    features: quote.features ?? [],
    gstPercent: String(quote.gstPercent ?? 18),
    quoteDate: quote.quoteDate ? String(quote.quoteDate).split("T")[0] : today(),
    validUntil: quote.validUntil ? String(quote.validUntil).split("T")[0] : plus30(),
    notes: quote.notes ?? "",
    commitment: quote.commitment ?? "",
  };
}

function resolvedType(form: FormState) {
  return form.type === "Custom" ? form.customType.trim() : form.type;
}

function toPreview(form: FormState, quoteNumber: string): QuotationPreviewData {
  return {
    quoteNumber,
    name: form.name,
    type: resolvedType(form),
    clientName: form.clientName,
    clientAttention: form.clientAttention,
    clientAddress: form.clientAddress,
    overview: form.overview,
    techStack: form.techStack,
    timelineValue: Number(form.timelineValue) || 0,
    timelineUnit: form.timelineUnit,
    estimateLabel: form.estimateLabel,
    services: form.services.map((row) => ({
      title: row.title,
      description: row.description,
      amount: Number(row.amount) || 0,
    })),
    features: form.features,
    gstPercent: Number(form.gstPercent) || 0,
    quoteDate: form.quoteDate,
    validUntil: form.validUntil,
    notes: form.notes,
    commitment: form.commitment,
  };
}

function payloadFromForm(form: FormState) {
  return {
    name: form.name,
    type: resolvedType(form),
    clientName: form.clientName,
    clientAttention: form.clientAttention,
    clientAddress: form.clientAddress,
    overview: form.overview,
    techStack: form.techStack,
    timelineValue: Number(form.timelineValue),
    timelineUnit: form.timelineUnit,
    estimateLabel: form.estimateLabel,
    services: form.services.map((row) => ({
      title: row.title,
      description: row.description,
      amount: Number(row.amount) || 0,
    })),
    features: form.features,
    gstPercent: Number(form.gstPercent),
    quoteDate: form.quoteDate,
    validUntil: form.validUntil,
    notes: form.notes,
    commitment: form.commitment,
  };
}

export default function QuotationEditor({
  mode,
  quoteId,
  initialNumber,
  initial,
}: {
  mode: "create" | "edit";
  quoteId?: string;
  initialNumber?: string;
  initial?: FormState;
}) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedNumber, setSavedNumber] = useState<string | null>(initialNumber ?? null);
  const [form, setForm] = useState<FormState>(initial ?? emptyQuotationForm());

  const quoteNumber = savedNumber ?? "QT-DRAFT";
  const typeLabel = resolvedType(form);
  const money = quotationTotals(
    form.services.map((row) => ({ amount: Number(row.amount) || 0 })),
    Number(form.gstPercent) || 0
  );
  const previewData = useMemo(() => toPreview(form, quoteNumber), [form, quoteNumber]);
  const featureOptions = featuresForType(typeLabel || form.type);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: quoteNumber,
    pageStyle: `
      @page { size: A4; margin: 12mm 14mm; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `,
  });

  const updateService = (index: number, patch: Partial<ServiceRow>) => {
    setForm({
      ...form,
      services: form.services.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.clientName.trim()) {
      setError("Quotation name and client name are required.");
      return;
    }
    if (!resolvedType(form)) {
      setError("Select a type or enter a custom type.");
      return;
    }
    if (!form.services.some((row) => row.title.trim())) {
      setError("Add at least one service with a title.");
      return;
    }
    setSaving(true);
    const url = mode === "edit" && quoteId ? `/api/quotations/${quoteId}` : "/api/quotations";
    const res = await fetch(url, {
      method: mode === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadFromForm(form)),
    });
    setSaving(false);
    if (res.ok) {
      const saved = await res.json();
      setSavedNumber(saved.quoteNumber);
      if (mode === "edit") router.push("/quotations");
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save quotation.");
    }
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <div className="w-[460px] shrink-0 border-r bg-white overflow-y-auto flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b sticky top-0 bg-white z-10">
          <Link href="/quotations">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {mode === "edit" ? `Edit ${quoteNumber}` : "Add quotation"}
            </h1>
            <p className="text-xs text-gray-400">Live client template on the right</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label>Quotation name *</Label>
            <Input
              placeholder="e.g. Jewellery shop website"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? "Web Development" })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUOTE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.type === "Custom" && (
            <div className="space-y-1.5">
              <Label>Custom type *</Label>
              <Input
                placeholder="e.g. Branding + website"
                value={form.customType}
                onChange={(e) => setForm({ ...form, customType: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Client name *</Label>
            <Input
              placeholder="e.g. Avicos Plastic UAE"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Attention / contact</Label>
            <Input
              placeholder="e.g. Fatema Roshan (Owner)"
              value={form.clientAttention}
              onChange={(e) => setForm({ ...form, clientAttention: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Client address</Label>
            <Input
              placeholder="City or full address"
              value={form.clientAddress}
              onChange={(e) => setForm({ ...form, clientAddress: e.target.value })}
            />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>Project overview</Label>
            <Textarea
              rows={4}
              className="resize-none"
              placeholder="What we will build, for whom, and the outcome."
              value={form.overview}
              onChange={(e) => setForm({ ...form, overview: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Timeline *</Label>
              <Input
                type="number"
                min={1}
                value={form.timelineValue}
                onChange={(e) => setForm({ ...form, timelineValue: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select value={form.timelineUnit} onValueChange={(v) => setForm({ ...form, timelineUnit: v ?? "Days" })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMELINE_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Estimate line</Label>
            <Input
              placeholder="One-time cost estimation"
              value={form.estimateLabel}
              onChange={(e) => setForm({ ...form, estimateLabel: e.target.value })}
            />
          </div>

          <FeatureMultiSelect
            label="Project tech"
            hint="Stack used for this rollout. Add a custom item if needed."
            options={TECH_OPTIONS}
            selected={form.techStack}
            onChange={(techStack) => setForm({ ...form, techStack })}
          />

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Services & price *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setForm({ ...form, services: [...form.services, emptyService()] })}
            >
              <Plus className="w-3 h-3 mr-1" /> Add service
            </Button>
          </div>
          <p className="text-xs text-gray-400 -mt-2">One line per feature in the description. Amount 0 shows as Included.</p>
          {form.services.map((row, index) => (
            <div key={index} className="rounded-lg border p-3 space-y-2 bg-gray-50">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-gray-500">Service {index + 1}</p>
                {form.services.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                    onClick={() => setForm({ ...form, services: form.services.filter((_, i) => i !== index) })}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="e.g. Website frontend & design"
                value={row.title}
                onChange={(e) => updateService(index, { title: e.target.value })}
              />
              <Textarea
                rows={3}
                className="resize-none"
                placeholder={"Theme purchase\nUp to 30 pages\nSEO + SSL"}
                value={row.description}
                onChange={(e) => updateService(index, { description: e.target.value })}
              />
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Amount (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={row.amount}
                  onChange={(e) => updateService(index, { amount: e.target.value })}
                />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>GST %</Label>
              <Input
                type="number"
                min={0}
                value={form.gstPercent}
                onChange={(e) => setForm({ ...form, gstPercent: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Quote date</Label>
              <Input
                type="date"
                value={form.quoteDate}
                onChange={(e) => setForm({ ...form, quoteDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Valid until</Label>
            <Input
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
            />
          </div>

          <div className="rounded-lg bg-[#E1F5EE] px-4 py-3 text-sm text-[#085041]">
            <p>Subtotal <strong>₹{money.subtotal.toLocaleString("en-IN")}</strong></p>
            <p className="mt-1">Payable incl. GST: <strong>₹{money.total.toLocaleString("en-IN")}</strong></p>
          </div>

          <FeatureMultiSelect
            label="Features we will deliver"
            hint="Tick what is in scope, or add a custom line."
            options={featureOptions}
            selected={form.features}
            onChange={(features) => setForm({ ...form, features })}
          />

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              className="resize-none"
              placeholder="Optional notes for this client"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Commitment</Label>
            <Textarea
              rows={3}
              className="resize-none"
              value={form.commitment}
              onChange={(e) => setForm({ ...form, commitment: e.target.value })}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}
          {mode === "create" && savedNumber && (
            <p className="text-sm text-[#0F6E56] bg-[#E1F5EE] rounded px-3 py-2">
              Saved as {savedNumber}. You can download the PDF now.
            </p>
          )}

          <div className="flex gap-2 pb-6">
            <Button type="submit" className="flex-1 bg-[#0F6E56] hover:bg-[#0d5e49]" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : mode === "edit" ? "Save changes" : savedNumber ? "Saved" : "Save quotation"}
            </Button>
            <Button type="button" variant="outline" onClick={() => handlePrint()}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </form>
      </div>

      <div className="flex-1 bg-gray-100 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 font-medium">Client template preview</p>
          <Button size="sm" className="bg-[#0F6E56] hover:bg-[#0d5e49] h-7 text-xs" onClick={() => handlePrint()}>
            <Download className="w-3 h-3 mr-1" /> Download PDF
          </Button>
        </div>
        <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 max-w-[820px]">
          <div ref={printRef}>
            <QuotationPreview data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
