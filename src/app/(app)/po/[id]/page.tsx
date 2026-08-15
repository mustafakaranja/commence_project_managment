"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import FeatureMultiSelect from "@/components/FeatureMultiSelect";
import POPreview from "@/components/POPreview";
import { MANAGED_FEATURES, PO_TYPES, TOP_FEATURES } from "@/lib/po-catalog";
import { poFinancials } from "@/lib/po-payload";
import { ArrowLeft, Download, Save } from "lucide-react";

export default function EditPOPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [poNumber, setPoNumber] = useState("PO-DRAFT");

  const [form, setForm] = useState({
    name: "",
    type: "Subscription",
    clientName: "",
    clientAttention: "",
    clientAddress: "",
    packageName: "",
    tagline: "",
    serviceType: "Annual Subscription",
    listPrice: "",
    salePrice: "",
    durationMonths: "12",
    renewalPrice: "",
    gstPercent: "18",
    poDate: "",
    validUntil: "",
    topFeatures: [] as string[],
    managedFeatures: [] as string[],
    notes: "",
  });

  useEffect(() => {
    let ignore = false;
    fetch(`/api/po/${id}`)
      .then((r) => r.json())
      .then((po) => {
      if (ignore) return;
      if (po?.error) {
        setError(po.error);
        setLoading(false);
        return;
      }
      setPoNumber(po.poNumber);
      setForm({
        name: po.name ?? "",
        type: po.type ?? "Subscription",
        clientName: po.clientName ?? "",
        clientAttention: po.clientAttention ?? "",
        clientAddress: po.clientAddress ?? "",
        packageName: po.packageName ?? "",
        tagline: po.tagline ?? "",
        serviceType: po.serviceType ?? "Annual Subscription",
        listPrice: String(po.listPrice ?? ""),
        salePrice: String(po.salePrice ?? ""),
        durationMonths: String(po.durationMonths ?? 12),
        renewalPrice: String(po.renewalPrice ?? ""),
        gstPercent: String(po.gstPercent ?? 18),
        poDate: po.poDate ? String(po.poDate).split("T")[0] : "",
        validUntil: po.validUntil ? String(po.validUntil).split("T")[0] : "",
        topFeatures: po.topFeatures ?? [],
        managedFeatures: po.managedFeatures ?? [],
        notes: po.notes ?? "",
      });
      setLoading(false);
    });
    return () => { ignore = true; };
  }, [id]);

  const money = poFinancials({
    salePrice: Number(form.salePrice) || 0,
    listPrice: Number(form.listPrice) || 0,
    durationMonths: Number(form.durationMonths) || 1,
    gstPercent: Number(form.gstPercent) || 0,
  });

  const previewData = useMemo(() => ({
    poNumber,
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
  }), [form, poNumber]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: poNumber,
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
    const res = await fetch(`/api/po/${id}`, {
      method: "PUT",
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
    if (res.ok) router.push("/po");
    else {
      const d = await res.json();
      setError(d.error ?? "Failed to update.");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

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
            <h1 className="text-lg font-bold text-gray-900">Edit {poNumber}</h1>
            <p className="text-xs text-gray-400">Update package, features, and pricing</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label>Purchase order name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? "Subscription" })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PO_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
            <Input value={form.clientAttention} onChange={(e) => setForm({ ...form, clientAttention: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Client address</Label>
            <Input value={form.clientAddress} onChange={(e) => setForm({ ...form, clientAddress: e.target.value })} />
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label>Package name *</Label>
            <Input value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>List / mo (₹)</Label>
              <Input type="number" value={form.listPrice} onChange={(e) => setForm({ ...form, listPrice: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Sale / mo (₹)</Label>
              <Input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Months</Label>
              <Input type="number" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Renewal / mo (₹)</Label>
              <Input type="number" value={form.renewalPrice} onChange={(e) => setForm({ ...form, renewalPrice: e.target.value })} />
            </div>
          </div>
          <div className="rounded-lg bg-[#E1F5EE] px-4 py-3 text-sm text-[#085041]">
            Payable incl. GST: <strong>₹{money.total.toLocaleString("en-IN")}</strong>
          </div>
          <FeatureMultiSelect
            label="Top features"
            options={TOP_FEATURES}
            selected={form.topFeatures}
            onChange={(topFeatures) => setForm({ ...form, topFeatures })}
          />
          <FeatureMultiSelect
            label="Managed WordPress"
            options={MANAGED_FEATURES}
            selected={form.managedFeatures}
            onChange={(managedFeatures) => setForm({ ...form, managedFeatures })}
          />
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} className="resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
          <div className="flex gap-2 pb-6">
            <Button type="submit" className="flex-1 bg-[#0F6E56] hover:bg-[#0d5e49]" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => handlePrint()}>
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </form>
      </div>
      <div className="flex-1 bg-gray-100 overflow-y-auto p-6">
        <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 max-w-[820px]">
          <div ref={printRef}>
            <POPreview data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
