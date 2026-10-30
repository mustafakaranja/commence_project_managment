"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import InvoiceLineItems, { type InvoiceItemRow } from "@/components/InvoiceLineItems";
import InvoicePaymentToggles from "@/components/InvoicePaymentToggles";
import { Plus, FileText, Pencil, Trash2, Eye, Link2 } from "lucide-react";
import { format } from "date-fns";
import InvoicePrintSheet from "@/components/InvoicePrintSheet";
import { Badge } from "@/components/ui/badge";
import { INVOICE_STATUSES, normalizeInvoiceStatus } from "@/lib/invoice-payload";
import { statusBadgeClass } from "@/lib/status-style";

interface IClient { _id: string; name: string; }
interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: { _id: string; name: string };
  invoiceDate: string;
  amount: number;
  taxAmount: number;
  invoiceFor: string;
  address: string;
  items?: { description: string; amount: number }[];
  quoteId?: string | null;
  quoteNumber?: string;
  status?: string;
  razorpayShortUrl?: string;
  razorpayPaymentStatus?: string;
  showBankDetails?: boolean;
  includeRazorpayLink?: boolean;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [previewTarget, setPreviewTarget] = useState<Invoice | null>(null);
  const [payBusyId, setPayBusyId] = useState<string | null>(null);

  const [form, setForm] = useState({
    clientId: "", invoiceDate: "", address: "", taxAmount: "", invoiceFor: "",
    items: [{ description: "", amount: "" }] as InvoiceItemRow[],
    quoteId: "",
    quoteNumber: "",
    status: "Draft",
    showBankDetails: true,
    includeRazorpayLink: false,
  });

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ]).then(([inv, cl]) => {
      if (!ignore) { setInvoices(inv); setClients(cl); setLoading(false); }
    });
    return () => { ignore = true; };
  }, []);

  const refresh = async () => {
    const d = await fetch("/api/invoices").then((r) => r.json());
    setInvoices(d);
  };

  const openEdit = (inv: Invoice) => {
    setEditTarget(inv);
    const items = inv.items?.length
      ? inv.items.map((row) => ({ description: row.description, amount: String(row.amount ?? "") }))
      : [{ description: inv.invoiceFor, amount: String(inv.amount ?? "") }];
    setForm({
      clientId: inv.clientId?._id ?? "",
      invoiceDate: inv.invoiceDate.split("T")[0],
      address: inv.address,
      taxAmount: String(inv.taxAmount ?? ""),
      invoiceFor: inv.invoiceFor,
      items,
      quoteId: inv.quoteId ?? "",
      quoteNumber: inv.quoteNumber ?? "",
      status: normalizeInvoiceStatus(inv.status),
      showBankDetails: inv.showBankDetails !== false,
      includeRazorpayLink: Boolean(inv.includeRazorpayLink),
    });
    setError("");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!editTarget) return;
    setSaving(true);
    const items = form.items
      .filter((row) => row.description.trim())
      .map((row) => ({ description: row.description.trim(), amount: Number(row.amount) || 0 }));
    const res = await fetch(`/api/invoices/${editTarget._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: form.clientId,
        invoiceDate: form.invoiceDate,
        address: form.address,
        invoiceFor: form.invoiceFor,
        taxAmount: form.taxAmount,
        items,
        quoteId: form.quoteId || null,
        quoteNumber: form.quoteNumber || "",
        status: form.status,
        showBankDetails: form.showBankDetails,
        includeRazorpayLink: form.includeRazorpayLink,
      }),
    });
    setSaving(false);
    if (res.ok) { setOpen(false); refresh(); }
    else { const d = await res.json(); setError(d.error ?? "Failed to save."); }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    setDeleteId(null);
    refresh();
  };

  const createPayLink = async (inv: Invoice) => {
    if (inv.razorpayShortUrl) {
      window.open(inv.razorpayShortUrl, "_blank");
      return;
    }
    setPayBusyId(inv._id);
    setError("");
    const res = await fetch(`/api/invoices/${inv._id}/pay-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = await res.json().catch(() => ({}));
    setPayBusyId(null);
    if (!res.ok) {
      setError(payload.error ?? "Failed to create Razorpay pay link.");
      return;
    }
    const payUrl = payload.payUrl as string | undefined;
    if (payUrl) {
      setInvoices((prev) =>
        prev.map((row) => row._id === inv._id ? { ...row, razorpayShortUrl: payUrl, status: row.status === "Draft" ? "Unpaid" : row.status } : row)
      );
      setPreviewTarget((prev) => prev && prev._id === inv._id ? { ...prev, razorpayShortUrl: payUrl } : prev);
      window.open(payUrl, "_blank");
    }
    refresh();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing and invoice history</p>
        </div>
        <Link href="/invoices/new">
          <Button className="bg-[#0F6E56] hover:bg-[#0d5e49]">
            <Plus className="w-4 h-4 mr-2" /> New Invoice
          </Button>
        </Link>
      </div>

      {error && !open && (
        <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}

      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Invoice For</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : invoices.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No invoices yet.{" "}
                    <Link href="/invoices/new" className="text-[#0F6E56] underline">Create your first invoice</Link>
                  </TableCell>
                </TableRow>
              )
              : invoices.map((inv) => {
                  const total = inv.amount + (inv.taxAmount ?? 0);
                  return (
                    <TableRow key={inv._id}>
                      <TableCell className="font-mono text-sm font-medium text-[#0F6E56]">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.clientId?.name ?? "—"}</TableCell>
                      <TableCell className="max-w-40 truncate">{inv.invoiceFor}</TableCell>
                      <TableCell>{format(new Date(inv.invoiceDate), "dd MMM yyyy")}</TableCell>
                      <TableCell>₹{inv.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell>₹{(inv.taxAmount ?? 0).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="font-semibold">₹{total.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClass(normalizeInvoiceStatus(inv.status))}>
                          {normalizeInvoiceStatus(inv.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => createPayLink(inv)}
                            disabled={payBusyId === inv._id}
                            title={inv.razorpayShortUrl ? "Open Razorpay pay link" : "Generate Razorpay pay link"}
                            className="text-[#0F6E56] hover:text-[#0d5e49] hover:bg-[#E1F5EE]"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => setPreviewTarget(inv)}
                            className="text-[#0F6E56] hover:text-[#0d5e49] hover:bg-[#E1F5EE]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(inv)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => handleDelete(inv._id)}
                            disabled={deleteId === inv._id}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      {/* Invoice Preview + PDF Sheet */}
      {previewTarget && (
        <InvoicePrintSheet
          open={!!previewTarget}
          onClose={() => setPreviewTarget(null)}
          invoiceId={previewTarget._id}
          data={{
            invoiceNumber: previewTarget.invoiceNumber,
            clientName: previewTarget.clientId?.name,
            invoiceDate: previewTarget.invoiceDate,
            address: previewTarget.address,
            amount: previewTarget.amount,
            taxAmount: previewTarget.taxAmount,
            invoiceFor: previewTarget.invoiceFor,
            items: previewTarget.items,
            quoteNumber: previewTarget.quoteNumber,
            showBankDetails: previewTarget.showBankDetails,
            includeRazorpayLink: previewTarget.includeRazorpayLink,
            razorpayShortUrl: previewTarget.razorpayShortUrl,
          }}
          onPayLinkCreated={(payUrl) => {
            setPreviewTarget((prev) => prev ? { ...prev, razorpayShortUrl: payUrl } : prev);
            setInvoices((prev) =>
              prev.map((row) => row._id === previewTarget._id ? { ...row, razorpayShortUrl: payUrl } : row)
            );
          }}
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice {editTarget?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Client *</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Invoice Date *</Label>
              <Input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Address *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Invoice For *</Label>
              <Input value={form.invoiceFor} onChange={(e) => setForm({ ...form, invoiceFor: e.target.value })} />
            </div>
            <Separator />
            <InvoiceLineItems
              items={form.items}
              onChange={(items) => setForm({ ...form, items })}
            />
            <div className="space-y-1.5">
              <Label>Tax Amount (₹)</Label>
              <Input type="number" value={form.taxAmount} onChange={(e) => setForm({ ...form, taxAmount: e.target.value })} />
            </div>
            <div className="bg-[#E1F5EE] rounded-lg px-4 py-3">
              <p className="text-xs text-[#0F6E56] font-medium">Net Total</p>
              <p className="text-xl font-bold text-[#0F6E56]">
                ₹{(
                  form.items.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
                  + (parseFloat(form.taxAmount) || 0)
                ).toLocaleString("en-IN")}
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
            <InvoicePaymentToggles
              showBankDetails={form.showBankDetails}
              includeRazorpayLink={form.includeRazorpayLink}
              onChange={(next) => setForm({ ...form, ...next })}
            />
            {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#0F6E56] hover:bg-[#0d5e49]" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
