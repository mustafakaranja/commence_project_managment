"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, ScrollText, Pencil, Trash2, Download, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";
import { quotationTotals } from "@/lib/quotation-payload";
import { normalizeQuoteStatus } from "@/lib/quotation-catalog";
import { statusBadgeClass } from "@/lib/status-style";
import QuotationPrintSheet from "@/components/QuotationPrintSheet";
import type { QuotationPreviewData } from "@/components/QuotationPreview";

interface Quotation {
  _id: string;
  quoteNumber: string;
  name: string;
  type: string;
  clientName: string;
  clientAttention?: string;
  clientAddress?: string;
  overview?: string;
  techStack: string[];
  timelineValue: number;
  timelineUnit: string;
  estimateLabel: string;
  services: { title: string; description?: string; amount: number }[];
  features: string[];
  gstPercent: number;
  quoteDate: string;
  validUntil: string;
  notes?: string;
  commitment?: string;
  status?: string;
}

function toPreview(quote: Quotation): QuotationPreviewData {
  return {
    quoteNumber: quote.quoteNumber,
    name: quote.name,
    type: quote.type,
    clientName: quote.clientName,
    clientAttention: quote.clientAttention,
    clientAddress: quote.clientAddress,
    overview: quote.overview,
    techStack: quote.techStack,
    timelineValue: quote.timelineValue,
    timelineUnit: quote.timelineUnit,
    estimateLabel: quote.estimateLabel,
    services: quote.services,
    features: quote.features,
    gstPercent: quote.gstPercent,
    quoteDate: quote.quoteDate,
    validUntil: quote.validUntil,
    notes: quote.notes,
    commitment: quote.commitment,
  };
}

export default function QuotationsPage() {
  const { can, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Quotation | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const allowed = !!user && hasPermission(user.role, "view_quotations", user.designation);
    if (!allowed) {
      router.replace("/dashboard");
      return;
    }
    let ignore = false;
    fetch("/api/quotations")
      .then((r) => r.json())
      .then((d) => {
        if (!ignore) {
          setQuotes(Array.isArray(d) ? d : []);
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, [authLoading, user, router]);

  const refresh = async () => {
    const d = await fetch("/api/quotations").then((r) => r.json());
    setQuotes(Array.isArray(d) ? d : []);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await fetch(`/api/quotations/${id}`, { method: "DELETE" });
    setDeleteId(null);
    refresh();
  };

  if (authLoading || !can("view_quotations")) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-56 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">Director-only proposals for new client rollouts</p>
        </div>
        {can("add_quotation") && (
          <Link href="/quotations/new">
            <Button className="bg-[#0F6E56] hover:bg-[#0d5e49]">
              <Plus className="w-4 h-4 mr-2" /> Add quotation
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : quotes.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-gray-400">
                    <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No quotations yet</p>
                    <p className="text-sm mt-1">Click &quot;Add quotation&quot; to create a client proposal.</p>
                  </TableCell>
                </TableRow>
              )
              : quotes.map((quote) => {
                  const money = quotationTotals(quote.services ?? [], quote.gstPercent ?? 0);
                  return (
                    <TableRow key={quote._id}>
                      <TableCell className="font-mono text-sm">{quote.quoteNumber}</TableCell>
                      <TableCell>
                        <p className="font-medium">{quote.name}</p>
                        <p className="text-xs text-gray-400">
                          {quote.estimateLabel || "One-time"}
                        </p>
                      </TableCell>
                      <TableCell>{quote.clientName || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{quote.type}</Badge></TableCell>
                      <TableCell>
                        {quote.timelineValue} {quote.timelineUnit}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{money.total.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClass(normalizeQuoteStatus(quote.status))}>
                          {normalizeQuoteStatus(quote.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {can("add_invoice") && (
                            <Link href={`/invoices/new?quoteId=${quote._id}`}>
                              <Button variant="ghost" size="sm" title="Create invoice">
                                <FileText className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setPreview(quote)}>
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          {can("edit_quotation") && (
                            <Link href={`/quotations/${quote._id}`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}
                          {can("delete_quotation") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(quote._id)}
                              disabled={deleteId === quote._id}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      {preview && (
        <QuotationPrintSheet
          open={!!preview}
          onClose={() => setPreview(null)}
          data={toPreview(preview)}
        />
      )}
    </div>
  );
}
