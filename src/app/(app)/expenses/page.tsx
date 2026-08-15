"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";

interface Client {
  _id: string;
  name: string;
}

interface Expense {
  _id: string;
  name: string;
  description?: string;
  amount: number;
  taxAmount: number;
  type: "Recurring" | "Fixed";
  expenseFor: "Organization" | "Client";
  clientId?: { _id: string; name: string } | null;
  reimbursed: boolean;
  expenseDate: string;
}

const emptyForm = {
  name: "",
  description: "",
  amount: "",
  taxAmount: "",
  type: "Fixed",
  expenseFor: "Organization",
  clientId: "",
  reimbursed: false,
  expenseDate: new Date().toISOString().split("T")[0],
};

function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function ExpensesPage() {
  const router = useRouter();
  const { can, loading: authLoading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !can("view_expenses")) {
      router.replace("/projects");
    }
  }, [authLoading, can, router]);

  useEffect(() => {
    if (authLoading || !can("view_expenses")) return;
    let ignore = false;
    Promise.all([
      fetch("/api/expenses").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ]).then(([e, c]) => {
      if (!ignore) {
        setExpenses(Array.isArray(e) ? e : []);
        setClients(Array.isArray(c) ? c : []);
        setLoading(false);
      }
    });
    return () => { ignore = true; };
  }, [authLoading, can]);

  const refresh = async () => {
    const e = await fetch("/api/expenses").then((r) => r.json());
    setExpenses(Array.isArray(e) ? e : []);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, expenseDate: new Date().toISOString().split("T")[0] });
    setError("");
    setOpen(true);
  };

  const openEdit = (ex: Expense) => {
    setEditTarget(ex);
    setForm({
      name: ex.name,
      description: ex.description ?? "",
      amount: String(ex.amount),
      taxAmount: ex.taxAmount ? String(ex.taxAmount) : "",
      type: ex.type,
      expenseFor: ex.expenseFor,
      clientId: ex.clientId?._id ?? "",
      reimbursed: ex.reimbursed,
      expenseDate: ex.expenseDate.split("T")[0],
    });
    setError("");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.amount || !form.expenseDate) {
      setError("Name, amount, and date are required.");
      return;
    }
    if (form.expenseFor === "Client" && !form.clientId) {
      setError("Select a client for this expense.");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      amount: Number(form.amount),
      taxAmount: form.taxAmount ? Number(form.taxAmount) : 0,
    };
    const url = editTarget ? `/api/expenses/${editTarget._id}` : "/api/expenses";
    const method = editTarget ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setDeleteId(null);
    refresh();
  };

  if (authLoading || !can("view_expenses")) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track organisation and client expenses</p>
        </div>
        {can("add_expense") && (
          <Button onClick={openAdd} className="bg-[#0F6E56] hover:bg-[#0d5e49]">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>For</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reimbursed</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
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
              : expenses.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    <Wallet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No expenses yet. Add your first expense.
                  </TableCell>
                </TableRow>
              )
              : expenses.map((ex) => (
                  <TableRow key={ex._id}>
                    <TableCell>
                      <p className="font-medium">{ex.name}</p>
                      {ex.description && (
                        <p className="text-xs text-gray-400 truncate max-w-56">{ex.description}</p>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(ex.expenseDate), "dd MMM yyyy")}</TableCell>
                    <TableCell><Badge variant="outline">{ex.type}</Badge></TableCell>
                    <TableCell>
                      {ex.expenseFor === "Client"
                        ? ex.clientId?.name ?? "Client"
                        : "Organization"}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{rupees(ex.amount)}</span>
                      {ex.taxAmount > 0 && (
                        <span className="text-xs text-gray-400 block">+ tax {rupees(ex.taxAmount)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={ex.reimbursed ? "default" : "secondary"}
                        className={ex.reimbursed ? "bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#E1F5EE]" : ""}
                      >
                        {ex.reimbursed ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {can("edit_expense") && (
                          <Button variant="ghost" size="sm" onClick={() => openEdit(ex)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {can("delete_expense") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ex._id)}
                            disabled={deleteId === ex._id}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. AWS hosting"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional details"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="resize-none min-h-20"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tax amount (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.taxAmount}
                  onChange={(e) => setForm({ ...form, taxAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? "Fixed" })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="Recurring">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Expense date *</Label>
                <Input
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Expenses for *</Label>
              <Select
                value={form.expenseFor}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    expenseFor: v ?? "Organization",
                    clientId: v === "Client" ? form.clientId : "",
                  })
                }
              >
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Organization">Organization</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.expenseFor === "Client" && (
              <div className="space-y-1.5">
                <Label>Client *</Label>
                <Select
                  value={form.clientId}
                  onValueChange={(v) => setForm({ ...form, clientId: v ?? "" })}
                >
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.reimbursed}
                onChange={(e) => setForm({ ...form, reimbursed: e.target.checked })}
                className="size-4 rounded border-gray-300 accent-[#0F6E56]"
              />
              This expense is reimbursed
            </label>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#0F6E56] hover:bg-[#0d5e49]" disabled={saving}>
                {saving ? "Saving..." : editTarget ? "Save Changes" : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
