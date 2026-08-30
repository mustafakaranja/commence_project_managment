"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { format, differenceInMonths } from "date-fns";
import { isClientActive } from "@/lib/client-status";

interface Client {
  _id: string;
  name: string;
  onboardDate: string;
  endDate?: string;
}

const emptyForm = { name: "", onboardDate: "", endDate: "" };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => {
        if (!ignore) { setClients(d); setLoading(false); }
      });
    return () => { ignore = true; };
  }, []);

  const refresh = async () => {
    const d = await fetch("/api/clients").then((r) => r.json());
    setClients(d);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditTarget(c);
    setForm({
      name: c.name,
      onboardDate: c.onboardDate.split("T")[0],
      endDate: c.endDate ? c.endDate.split("T")[0] : "",
    });
    setError("");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.onboardDate) {
      setError("Name and onboard date are required.");
      return;
    }
    setSaving(true);
    const url = editTarget ? `/api/clients/${editTarget._id}` : "/api/clients";
    const method = editTarget ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setDeleteId(null);
    refresh();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your client relationships</p>
        </div>
        <Button onClick={openAdd} className="bg-[#0F6E56] hover:bg-[#0d5e49]">
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Onboard Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Tenure</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : clients.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No clients yet. Add your first client.
                  </TableCell>
                </TableRow>
              )
              : clients.map((c) => {
                  const start = new Date(c.onboardDate);
                  const end = c.endDate ? new Date(c.endDate) : new Date();
                  const months = differenceInMonths(end, start);
                  const isActive = isClientActive(c.endDate);
                  return (
                    <TableRow key={c._id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{format(start, "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        {c.endDate ? format(new Date(c.endDate), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell>{months} month{months !== 1 ? "s" : ""}</TableCell>
                      <TableCell>
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className={isActive ? "bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#E1F5EE]" : ""}
                        >
                          {isActive ? "Active" : "Ended"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(c._id)}
                            disabled={deleteId === c._id}
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

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Client" : "Add New Client"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Client Name *</Label>
              <Input
                placeholder="e.g. Avicos Plastic UAE"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Onboard Date *</Label>
              <Input
                type="date"
                value={form.onboardDate}
                onChange={(e) => setForm({ ...form, onboardDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>End of Tenure <span className="text-gray-400 text-xs">optional</span></Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#0F6E56] hover:bg-[#0d5e49]" disabled={saving}>
                {saving ? "Saving..." : editTarget ? "Save Changes" : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
