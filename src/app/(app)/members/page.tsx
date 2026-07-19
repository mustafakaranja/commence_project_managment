"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, UserCheck, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ALL_ROLES, ROLE_LABELS, type Role } from "@/lib/permissions";

interface Member {
  _id: string;
  fullName: string;
  designation?: string;
  username: string;
  email: string;
  role: Role;
  portalAccess: boolean;
}

const emptyForm = {
  fullName: "",
  designation: "",
  username: "",
  email: "",
  password: "",
  role: "user" as Role,
  portalAccess: true,
};

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-purple-100 text-purple-700",
  account_manager: "bg-blue-100 text-blue-700",
  manager: "bg-indigo-100 text-indigo-700",
  developer: "bg-cyan-100 text-cyan-700",
  HR: "bg-pink-100 text-pink-700",
  LT: "bg-amber-100 text-amber-700",
  user: "bg-gray-100 text-gray-600",
};

export default function MembersPage() {
  const { can } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    setForm({ ...emptyForm, password: generatePassword() });
    setError("");
    setOpen(true);
  };

  const openEdit = (m: Member) => {
    setEditTarget(m);
    setForm({
      fullName: m.fullName,
      designation: m.designation ?? "",
      username: m.username,
      email: m.email,
      password: "",
      role: m.role,
      portalAccess: m.portalAccess,
    });
    setError("");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.username || !form.email) {
      setError("Full name, username and email are required.");
      return;
    }
    if (!editTarget && !form.password) {
      setError("Password is required for new members.");
      return;
    }
    setSaving(true);
    const url = editTarget ? `/api/members/${editTarget._id}` : "/api/members";
    const method = editTarget ? "PUT" : "POST";
    const body = { ...form };
    if (editTarget && !body.password) delete (body as Partial<typeof body>).password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    if (!can("delete_member")) return;
    setDeleteId(id);
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    setDeleteId(null);
    refresh();
  };

  const canAdd = can("add_member");
  const canEdit = can("edit_member");
  const canDelete = can("delete_member");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            Portal users and team members. Members appear as options in projects.
          </p>
        </div>
        {canAdd && (
          <Button onClick={openAdd} className="bg-[#0F6E56] hover:bg-[#0d5e49]">
            <Plus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Portal Access</TableHead>
              {(canEdit || canDelete) && <TableHead className="w-24 text-right">Actions</TableHead>}
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
              : members.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No members yet.
                  </TableCell>
                </TableRow>
              )
              : members.map((m) => (
                <TableRow key={m._id}>
                  <TableCell className="font-medium">{m.fullName}</TableCell>
                  <TableCell className="text-gray-500 font-mono text-sm">@{m.username}</TableCell>
                  <TableCell className="text-gray-500">{m.email}</TableCell>
                  <TableCell className="text-gray-500">{m.designation || "—"}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[m.role]}`}>
                      {ROLE_LABELS[m.role]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={m.portalAccess ? "border-green-300 text-green-600" : "border-gray-300 text-gray-400"}
                    >
                      {m.portalAccess ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => handleDelete(m._id)}
                            disabled={deleteId === m._id}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[460px] p-0 flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <SheetHeader className="px-6 py-5 border-b sticky top-0 bg-white z-10">
              <SheetTitle>{editTarget ? `Edit: ${editTarget.fullName}` : "Add New Member"}</SheetTitle>
              <p className="text-sm text-gray-400">
                {editTarget ? "Update member details." : "Create a portal account for a new team member."}
              </p>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Personal Info */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal Info</p>
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Designation</Label>
                  <Input
                    placeholder="e.g. Senior Developer"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              {/* Account Info */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Portal Account</p>
                <div className="space-y-1.5">
                  <Label>Username *</Label>
                  <Input
                    placeholder="e.g. johndoe"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="e.g. john@commence.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Password {editTarget && <span className="text-gray-400 text-xs">(leave blank to keep current)</span>}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={editTarget ? "Enter new password" : "Auto-generated"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setForm({ ...form, password: generatePassword() }); setShowPassword(true); }}
                      title="Generate password"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Role & Access */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role & Access</p>
                <div className="space-y-1.5">
                  <Label>Role *</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: (v ?? "user") as Role })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALL_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Portal Access</p>
                    <p className="text-xs text-gray-400">Allow this member to log in to the portal</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, portalAccess: !form.portalAccess })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${form.portalAccess ? "bg-[#0F6E56]" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.portalAccess ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Role permissions preview */}
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Permissions for {ROLE_LABELS[form.role]}</p>
                  <div className="flex flex-wrap gap-1">
                    {(ROLE_PERMISSIONS_MAP[form.role] ?? []).map((p) => (
                      <span key={p} className="text-[10px] bg-white border rounded px-1.5 py-0.5 text-gray-600">{p.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="px-6 py-4 border-t bg-white sticky bottom-0">
              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2 w-full mb-2">{error}</p>
              )}
              <div className="flex gap-2 w-full">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#0F6E56] hover:bg-[#0d5e49]" disabled={saving}>
                  {saving ? "Saving..." : editTarget ? "Save Changes" : "Create Member"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Import for role permissions preview inside component
import { ROLE_PERMISSIONS } from "@/lib/permissions";
const ROLE_PERMISSIONS_MAP = ROLE_PERMISSIONS;
