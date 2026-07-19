"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import InvoicePreview from "@/components/InvoicePreview";
import { ArrowLeft, Save, Download, CheckCircle2, ListPlus } from "lucide-react";
import Link from "next/link";

interface Client { _id: string; name: string; }
interface SavedInvoice {
  invoiceNumber: string;
  clientName?: string;
  invoiceDate: string;
  address: string;
  amount: number;
  taxAmount: number;
  invoiceFor: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedInvoice, setSavedInvoice] = useState<SavedInvoice | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    clientId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    address: "",
    amount: "",
    taxAmount: "",
    invoiceFor: "",
  });

  useEffect(() => {
    let ignore = false;
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => { if (!ignore) setClients(d); });
    return () => { ignore = true; };
  }, []);

  const selectedClient = clients.find((c) => c._id === form.clientId);

  const previewData = {
    invoiceNumber: savedInvoice?.invoiceNumber ?? "INV-DRAFT",
    clientName: savedInvoice?.clientName ?? selectedClient?.name,
    invoiceDate: form.invoiceDate,
    address: form.address,
    amount: parseFloat(form.amount) || 0,
    taxAmount: parseFloat(form.taxAmount) || 0,
    invoiceFor: form.invoiceFor,
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${savedInvoice?.invoiceNumber ?? "draft"}`,
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
    if (!form.clientId || !form.invoiceDate || !form.address || !form.amount || !form.invoiceFor) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const inv = await res.json();
      setSavedInvoice({
        invoiceNumber: inv.invoiceNumber,
        clientName: selectedClient?.name,
        invoiceDate: form.invoiceDate,
        address: form.address,
        amount: parseFloat(form.amount) || 0,
        taxAmount: parseFloat(form.taxAmount) || 0,
        invoiceFor: form.invoiceFor,
      });
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save invoice.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Form Panel */}
      <div className="w-[420px] shrink-0 border-r bg-white overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b">
          <Link href="/invoices">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">New Invoice</h1>
            <p className="text-xs text-gray-400">Preview updates live on the right</p>
          </div>
        </div>

        {/* Success state */}
        {savedInvoice ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#0F6E56]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Invoice Saved!</h2>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-mono font-semibold text-[#0F6E56]">{savedInvoice.invoiceNumber}</span> has been created successfully.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={() => handlePrint()}
                className="w-full bg-[#0F6E56] hover:bg-[#0d5e49]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as PDF
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/invoices/new")}
              >
                <ListPlus className="w-4 h-4 mr-2" />
                Create Another
              </Button>
              <Button variant="ghost" className="w-full text-gray-500" onClick={() => router.push("/invoices")}>
                Back to Invoices
              </Button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-5">
            <div className="space-y-1.5">
              <Label>Client *</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Invoice Date *</Label>
              <Input
                type="date"
                value={form.invoiceDate}
                onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Address *</Label>
              <Input
                placeholder="Client address or location"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Invoice For *</Label>
              <Input
                placeholder="e.g. Website Hosting Renewal"
                value={form.invoiceFor}
                onChange={(e) => setForm({ ...form, invoiceFor: e.target.value })}
              />
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label>Base Amount (₹) *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tax Amount (₹) <span className="text-gray-400 text-xs">optional</span></Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.taxAmount}
                onChange={(e) => setForm({ ...form, taxAmount: e.target.value })}
              />
            </div>

            <div className="bg-[#E1F5EE] rounded-lg px-4 py-3">
              <p className="text-xs text-[#0F6E56] font-medium">Net Total</p>
              <p className="text-2xl font-bold text-[#0F6E56]">
                ₹{((parseFloat(form.amount) || 0) + (parseFloat(form.taxAmount) || 0)).toLocaleString("en-IN")}
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full bg-[#0F6E56] hover:bg-[#0d5e49]" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Invoice"}
            </Button>
          </form>
        )}
      </div>

      {/* Right: Live Preview (also used for print) */}
      <div className="flex-1 bg-gray-100 overflow-y-auto p-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">Live Preview</p>
          <div className="flex items-center gap-2">
            {savedInvoice && (
              <Button
                size="sm"
                onClick={() => handlePrint()}
                className="bg-[#0F6E56] hover:bg-[#0d5e49] h-7 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Download PDF
              </Button>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              savedInvoice
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {savedInvoice ? "Saved" : "Draft"}
            </span>
          </div>
        </div>
        <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div ref={printRef}>
            <InvoicePreview data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
