"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import InvoicePreview from "@/components/InvoicePreview";
import InvoiceLineItems, { emptyInvoiceItem, type InvoiceItemRow } from "@/components/InvoiceLineItems";
import { quotationTotals } from "@/lib/quotation-payload";
import { invoiceSubtotal, INVOICE_STATUSES } from "@/lib/invoice-payload";
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
  items: { description: string; amount: number }[];
  quoteNumber?: string;
}

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteIdParam = searchParams.get("quoteId");
  const [clients, setClients] = useState<Client[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedInvoice, setSavedInvoice] = useState<SavedInvoice | null>(null);
  const [quoteHint, setQuoteHint] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const invoiceForParam = searchParams.get("invoiceFor") ?? "";
  const [form, setForm] = useState({
    clientId: searchParams.get("clientId") ?? "",
    invoiceDate: new Date().toISOString().split("T")[0],
    address: "",
    taxAmount: "",
    invoiceFor: invoiceForParam,
    items: [
      { description: invoiceForParam, amount: "" },
    ] as InvoiceItemRow[],
    quoteId: quoteIdParam ?? "",
    quoteNumber: "",
    status: "Draft",
  });

  useEffect(() => {
    let ignore = false;
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => { if (!ignore) setClients(Array.isArray(d) ? d : []); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!quoteIdParam) return;
    let ignore = false;
    Promise.all([
      fetch(`/api/quotations/${quoteIdParam}`).then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ]).then(([quote, cl]) => {
      if (ignore || quote?.error) return;
      const list: Client[] = Array.isArray(cl) ? cl : [];
      setClients(list);
      const match = list.find(
        (c) => c.name.trim().toLowerCase() === String(quote.clientName ?? "").trim().toLowerCase()
      );
      const services = Array.isArray(quote.services) ? quote.services : [];
      const items: InvoiceItemRow[] = services
        .filter((s: { title?: string }) => String(s.title ?? "").trim())
        .map((s: { title?: string; description?: string; amount?: number }) => ({
          description: [s.title, s.description].filter(Boolean).join("\n"),
          amount: String(s.amount ?? 0),
        }));
      const money = quotationTotals(
        services.map((s: { amount?: number }) => ({ amount: Number(s.amount) || 0 })),
        Number(quote.gstPercent) || 0
      );
      setQuoteHint(quote.clientName ? `Quotation client: ${quote.clientName}` : "");
      setForm((prev) => ({
        ...prev,
        clientId: match?._id ?? prev.clientId,
        address: quote.clientAddress || prev.address,
        invoiceFor: quote.name || quote.type || prev.invoiceFor,
        items: items.length ? items : [emptyInvoiceItem()],
        taxAmount: money.gst ? String(money.gst) : "",
        quoteId: quote._id,
        quoteNumber: quote.quoteNumber ?? "",
      }));
    });
    return () => { ignore = true; };
  }, [quoteIdParam]);

  const selectedClient = clients.find((c) => c._id === form.clientId);
  const parsedItems = form.items
    .filter((row) => row.description.trim())
    .map((row) => ({ description: row.description.trim(), amount: Number(row.amount) || 0 }));
  const subtotal = invoiceSubtotal(parsedItems);
  const tax = parseFloat(form.taxAmount) || 0;

  const previewData = useMemo(() => ({
    invoiceNumber: savedInvoice?.invoiceNumber ?? "INV-DRAFT",
    clientName: savedInvoice?.clientName ?? selectedClient?.name,
    invoiceDate: form.invoiceDate,
    address: form.address,
    amount: subtotal,
    taxAmount: tax,
    invoiceFor: form.invoiceFor,
    items: parsedItems,
    quoteNumber: form.quoteNumber || undefined,
  }), [savedInvoice, selectedClient, form, subtotal, tax, parsedItems]);

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
    if (!form.clientId || !form.invoiceDate || !form.address || !form.invoiceFor) {
      setError("Please fill in client, date, address, and invoice for.");
      return;
    }
    if (parsedItems.length === 0) {
      setError("Add at least one invoice detail line.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: form.clientId,
        invoiceDate: form.invoiceDate,
        address: form.address,
        invoiceFor: form.invoiceFor,
        taxAmount: tax,
        items: parsedItems,
        quoteId: form.quoteId || null,
        quoteNumber: form.quoteNumber || "",
        status: form.status,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const inv = await res.json();
      setSavedInvoice({
        invoiceNumber: inv.invoiceNumber,
        clientName: selectedClient?.name,
        invoiceDate: form.invoiceDate,
        address: form.address,
        amount: subtotal,
        taxAmount: tax,
        invoiceFor: form.invoiceFor,
        items: parsedItems,
        quoteNumber: form.quoteNumber,
      });
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save invoice.");
    }
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <div className="w-[420px] shrink-0 border-r bg-white overflow-y-auto flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b sticky top-0 bg-white z-10">
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
              <Button onClick={() => handlePrint()} className="w-full bg-[#0F6E56] hover:bg-[#0d5e49]">
                <Download className="w-4 h-4 mr-2" />
                Download as PDF
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/invoices/new")}>
                <ListPlus className="w-4 h-4 mr-2" />
                Create Another
              </Button>
              <Button variant="ghost" className="w-full text-gray-500" onClick={() => router.push("/invoices")}>
                Back to Invoices
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-5">
            {form.quoteNumber && (
              <div className="rounded-lg bg-[#E1F5EE] px-3 py-2 text-xs text-[#085041]">
                Filled from quotation <strong>{form.quoteNumber}</strong>. You can edit lines before saving.
              </div>
            )}

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
              {quoteHint && !form.clientId && (
                <p className="text-xs text-amber-700">{quoteHint}. Select a matching client, or add them under Clients first.</p>
              )}
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
                placeholder="e.g. Website development"
                value={form.invoiceFor}
                onChange={(e) => setForm({ ...form, invoiceFor: e.target.value })}
              />
            </div>

            <Separator />

            <InvoiceLineItems
              items={form.items}
              onChange={(items) => setForm({ ...form, items })}
            />

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
                ₹{(subtotal + tax).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-[#085041] mt-1">
                Subtotal ₹{subtotal.toLocaleString("en-IN")}
                {tax > 0 ? ` + tax ₹${tax.toLocaleString("en-IN")}` : ""}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v ?? "Draft" })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              savedInvoice ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
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

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading invoice form…</div>}>
      <NewInvoiceForm />
    </Suspense>
  );
}
