"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { addMonths } from "date-fns";
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
import POPreview from "@/components/POPreview";
import { MANAGED_FEATURES, PO_TYPES, TOP_FEATURES } from "@/lib/po-catalog";
import { poFinancials } from "@/lib/po-payload";
import { ArrowLeft, Download, Save } from "lucide-react";

const today = () => new Date().toISOString().split("T")[0];
const plusYear = () => addMonths(new Date(), 12).toISOString().split("T")[0];

export default function NewPOPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedNumber, setSavedNumber] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "Subscription",
    clientName: "",
    clientAttention: "",
    clientAddress: "",
    packageName: "Commence Web Exclusive Cloud Web Development Package",
    tagline: "Enjoy optimised performance & guaranteed resources",
    serviceType: "Annual Subscription",
    listPrice: "999",
    salePrice: "599",
    durationMonths: "12",
    renewalPrice: "999",
    gstPercent: "18",
    poDate: today(),
    validUntil: plusYear(),
    topFeatures: [] as string[],
    managedFeatures: [] as string[],
    notes: "",
  });

  const money = poFinancials({
    salePrice: Number(form.salePrice) || 0,
    listPrice: Number(form.listPrice) || 0,
    durationMonths: Number(form.durationMonths) || 1,
    gstPercent: Number(form.gstPercent) || 0,
  });

  const previewData = useMemo(() => ({
    poNumber: savedNumber ?? "PO-DRAFT",
    name: form.name,
    type: form.type,
    clientName: form.clientName,
    clientAttention: form.clientAttention,
    clientAddress: form.clientAddress,
    packageName: form.packageName,
    tagline: form.tagline,
    serviceType: form.serviceType,
    listPrice: Number(form.listPrice) || 0,
    salePrice: Number(form.salePrice) || 0,
    durationMonths: Number(form.durationMonths) || 12,
    renewalPrice: Number(form.renewalPrice) || 0,
    gstPercent: Number(form.gstPercent) || 0,
    poDate: form.poDate,
    validUntil: form.validUntil,
    topFeatures: form.topFeatures,
    managedFeatures: form.managedFeatures,
    notes: form.notes,
  }), [form, savedNumber]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: savedNumber ?? "Purchase-Order-Draft",
    pageStyle: `
      @page { size: A4; margin: 12mm 14mm; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.clientName.trim() || !form.packageName) {
      setError("PO name, client name, and package name are required.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/po", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        listPrice: Number(form.listPrice),
        salePrice: Number(form.salePrice),
        durationMonths: Number(form.durationMonths),
        renewalPrice: Number(form.renewalPrice),
        gstPercent: Number(form.gstPercent),
      }),
    });
    setSaving(false);
    if (res.ok) {
      const saved = await res.json();
      setSavedNumber(saved.poNumber);
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save purchase order.");
    }
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <div className="w-[440px] shrink-0 border-r bg-white overflow-y-auto flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b sticky top-0 bg-white z-10">
          <Link href="/po">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Add Purchase Order</h1>
            <p className="text-xs text-gray-400">Live template updates on the right</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label>Purchase order name *</Label>
            <Input
              placeholder="e.g. Avicos hosting 2026"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? "Subscription" })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PO_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label>Package name *</Label>
            <Input
              value={form.packageName}
              onChange={(e) => setForm({ ...form, packageName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Service type</Label>
            <Input
              placeholder="Annual Subscription"
              value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>List amount / mo (₹)</Label>
              <Input type="number" min={0} value={form.listPrice} onChange={(e) => setForm({ ...form, listPrice: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Sale amount / mo (₹) *</Label>
              <Input type="number" min={0} value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (months)</Label>
              <Input type="number" min={1} value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Renewal / mo (₹)</Label>
              <Input type="number" min={0} value={form.renewalPrice} onChange={(e) => setForm({ ...form, renewalPrice: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>GST %</Label>
              <Input type="number" min={0} value={form.gstPercent} onChange={(e) => setForm({ ...form, gstPercent: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>PO date</Label>
              <Input type="date" value={form.poDate} onChange={(e) => setForm({ ...form, poDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Valid until</Label>
            <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
          </div>

          <div className="rounded-lg bg-[#E1F5EE] px-4 py-3 text-sm text-[#085041]">
            <p>{form.durationMonths} months × ₹{Number(form.salePrice || 0).toLocaleString("en-IN")} = <strong>₹{money.subtotal.toLocaleString("en-IN")}</strong></p>
            {money.savings > 0 && <p className="text-xs mt-1">Saving ₹{money.savings.toLocaleString("en-IN")} vs list price</p>}
            <p className="mt-1">Payable incl. GST: <strong>₹{money.total.toLocaleString("en-IN")}</strong></p>
          </div>

          <Separator />

          <FeatureMultiSelect
            label="Top features"
            hint="Select hosting and performance items to include, or add your own."
            options={TOP_FEATURES}
            selected={form.topFeatures}
            onChange={(topFeatures) => setForm({ ...form, topFeatures })}
          />
          <FeatureMultiSelect
            label="Managed WordPress"
            hint="Select managed services for this client, or add a custom line."
            options={MANAGED_FEATURES}
            selected={form.managedFeatures}
            onChange={(managedFeatures) => setForm({ ...form, managedFeatures })}
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

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}
          {savedNumber && (
            <p className="text-sm text-[#0F6E56] bg-[#E1F5EE] rounded px-3 py-2">
              Saved as {savedNumber}. You can download the PDF now.
            </p>
          )}

          <div className="flex gap-2 pb-6">
            <Button type="submit" className="flex-1 bg-[#0F6E56] hover:bg-[#0d5e49]" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : savedNumber ? "Saved" : "Save PO"}
            </Button>
            <Button type="button" variant="outline" onClick={() => handlePrint()} disabled={!savedNumber && !form.name}>
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
            <POPreview data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
