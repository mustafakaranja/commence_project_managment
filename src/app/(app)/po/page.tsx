"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, FileCheck, Pencil, Trash2, Download } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { poFinancials } from "@/lib/po-payload";
import POPrintSheet from "@/components/POPrintSheet";
import type { POPreviewData } from "@/components/POPreview";

interface PurchaseOrder {
  _id: string;
  poNumber: string;
  name: string;
  type: string;
  clientName: string;
  clientAttention?: string;
  clientAddress?: string;
  packageName: string;
  tagline?: string;
  serviceType: string;
  listPrice: number;
  salePrice: number;
  durationMonths: number;
  renewalPrice: number;
  gstPercent: number;
  poDate: string;
  validUntil: string;
  topFeatures: string[];
  managedFeatures: string[];
  notes?: string;
}

function toPreview(po: PurchaseOrder): POPreviewData {
  return {
    poNumber: po.poNumber,
    name: po.name,
    type: po.type,
    clientName: po.clientName,
    clientAttention: po.clientAttention,
    clientAddress: po.clientAddress,
    packageName: po.packageName,
    tagline: po.tagline,
    serviceType: po.serviceType,
    listPrice: po.listPrice,
    salePrice: po.salePrice,
    durationMonths: po.durationMonths,
    renewalPrice: po.renewalPrice,
    gstPercent: po.gstPercent,
    poDate: po.poDate,
    validUntil: po.validUntil,
    topFeatures: po.topFeatures,
    managedFeatures: po.managedFeatures,
    notes: po.notes,
  };
}

export default function POPage() {
  const { can } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/po")
      .then((r) => r.json())
      .then((d) => {
        if (!ignore) {
          setOrders(Array.isArray(d) ? d : []);
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, []);

  const refresh = async () => {
    const d = await fetch("/api/po").then((r) => r.json());
    setOrders(Array.isArray(d) ? d : []);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await fetch(`/api/po/${id}`, { method: "DELETE" });
    setDeleteId(null);
    refresh();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Create client POs for hosting and subscription packages</p>
        </div>
        {can("add_po") && (
          <Link href="/po/new">
            <Button className="bg-[#0F6E56] hover:bg-[#0d5e49]">
              <Plus className="w-4 h-4 mr-2" /> Add PO
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : orders.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-gray-400">
                    <FileCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No purchase orders yet</p>
                    <p className="text-sm mt-1">Click &quot;Add PO&quot; to create one for a client.</p>
                  </TableCell>
                </TableRow>
              )
              : orders.map((po) => {
                  const money = poFinancials(po);
                  return (
                    <TableRow key={po._id}>
                      <TableCell className="font-mono text-sm">{po.poNumber}</TableCell>
                      <TableCell>
                        <p className="font-medium">{po.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-48">{po.packageName}</p>
                      </TableCell>
                      <TableCell>{po.clientName || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{po.type}</Badge></TableCell>
                      <TableCell>{format(new Date(po.poDate), "dd MMM yyyy")}</TableCell>
                      <TableCell className="font-medium">
                        ₹{money.total.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setPreview(po)}>
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          {can("edit_po") && (
                            <Link href={`/po/${po._id}`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}
                          {can("delete_po") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(po._id)}
                              disabled={deleteId === po._id}
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
        <POPrintSheet
          open={!!preview}
          onClose={() => setPreview(null)}
          data={toPreview(preview)}
        />
      )}
    </div>
  );
}
