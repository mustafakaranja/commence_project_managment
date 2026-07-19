"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, UserCheck } from "lucide-react";

interface Member {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

const emptyForm = { name: "", email: "", role: "" };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    fetch("/api/members")
      .then((r) => r.json())
      .then((d) => { if (!ignore) { setMembers(d); setLoading(false); } });
    return () => { ignore = true; };
  }, []);

  const refresh = async () => {
    const d = await fetch("/api/members").then((r) => r.json());
    setMembers(d);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  };

  const openEdit = (m: Member) => {
    setEditTarget(m);
    setForm({ name: m.name, email: m.email ?? "", role: m.role ?? "" });
    setError("");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    const url = editTarget ? `/api/members/${editTarget._id}` : "/api/members";
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
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    setDeleteId(null);
    refresh();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add team members here — they&apos;ll appear as selectable options in projects.
          </p>
        </div>
        <Button onClick={openAdd} className="bg-[#0F6E56] hover:bg-[#0d5e49]">
          <Plus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : members.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-gray-400">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No members yet. Add your first team member.
                  </TableCell>
                </TableRow>
              )
              : members.map((m) => (
                <TableRow key={m._id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-gray-500">{m.email || "—"}</TableCell>
                  <TableCell>
                    {m.role
                      ? <Badge variant="outline" className="text-[#0F6E56] border-[#0F6E56]">{m.role}</Badge>
                      : <span className="text-gray-400 text-sm">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(m._id)}
                        disabled={deleteId === m._id}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-gray-400 text-xs">optional</span></Label>
              <Input
                type="email"
                placeholder="e.g. john@commence.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role <span className="text-gray-400 text-xs">optional</span></Label>
              <Input
                placeholder="e.g. Developer, Designer"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#0F6E56] hover:bg-[#0d5e49]" disabled={saving}>
                {saving ? "Saving..." : editTarget ? "Save Changes" : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
