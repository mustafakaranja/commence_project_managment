"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, FolderKanban, X } from "lucide-react";
import { format } from "date-fns";

interface Task { title: string; description: string; status: "Todo" | "In Progress" | "Done"; assignedTo: string; }
interface IClient { _id: string; name: string; }
interface IMember { _id: string; name: string; role?: string; }
interface Project {
  _id: string;
  title: string;
  type: string;
  clientId: { _id: string; name: string };
  members: string[];
  estimationDeadline: string;
  tasks: Task[];
}

const emptyForm = {
  title: "",
  type: "Fixed",
  clientId: "",
  members: [] as string[],
  estimationDeadline: "",
  tasks: [] as Task[],
};

function completionPct(tasks: Task[]) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((t) => t.status === "Done").length / tasks.length) * 100);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [members, setMembers] = useState<IMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
    ]).then(([p, c, m]) => {
      if (!ignore) { setProjects(p); setClients(c); setMembers(m); setLoading(false); }
    });
    return () => { ignore = true; };
  }, []);

  const refresh = async () => {
    const p = await fetch("/api/projects").then((r) => r.json());
    setProjects(p);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditTarget(p);
    setForm({
      title: p.title,
      type: p.type,
      clientId: p.clientId?._id ?? "",
      members: p.members,
      estimationDeadline: p.estimationDeadline.split("T")[0],
      tasks: p.tasks.map((t) => ({ ...t, description: (t as Task).description ?? "" })),
    });
    setError("");
    setOpen(true);
  };

  const toggleMember = (name: string) => {
    setForm((f) =>
      f.members.includes(name)
        ? { ...f, members: f.members.filter((m) => m !== name) }
        : { ...f, members: [...f.members, name] }
    );
  };

  const addTask = () =>
    setForm((f) => ({
      ...f,
      tasks: [...f.tasks, { title: "", description: "", status: "Todo", assignedTo: "" }],
    }));

  const removeTask = (i: number) =>
    setForm((f) => ({ ...f, tasks: f.tasks.filter((_, idx) => idx !== i) }));

  const updateTask = (i: number, field: keyof Task, value: string) =>
    setForm((f) => {
      const tasks = [...f.tasks];
      tasks[i] = { ...tasks[i], [field]: value };
      return { ...f, tasks };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.clientId || !form.estimationDeadline) {
      setError("Title, client, and deadline are required.");
      return;
    }
    setSaving(true);
    const url = editTarget ? `/api/projects/${editTarget._id}` : "/api/projects";
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
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setDeleteId(null);
    refresh();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Track all active projects</p>
        </div>
        <Button onClick={openAdd} className="bg-[#0F6E56] hover:bg-[#0d5e49]">
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : projects.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-gray-400">
                    <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No projects yet</p>
                    <p className="text-sm mt-1">Click &quot;Add Project&quot; to get started.</p>
                  </TableCell>
                </TableRow>
              )
              : projects.map((p) => {
                  const pct = completionPct(p.tasks);
                  return (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.clientId?.name ?? "—"}</TableCell>
                      <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                      <TableCell>{format(new Date(p.estimationDeadline), "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.members.slice(0, 3).map((m) => (
                            <span key={m} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{m}</span>
                          ))}
                          {p.members.length > 3 && (
                            <span className="text-xs text-gray-400">+{p.members.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-16">
                            <div className="bg-[#0F6E56] h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => handleDelete(p._id)}
                            disabled={deleteId === p._id}
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

      {/* Right-side Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[520px] sm:w-[580px] overflow-y-auto p-0">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-6 py-5 border-b bg-white sticky top-0 z-10">
              <SheetTitle className="text-lg">
                {editTarget ? `Edit: ${editTarget.title}` : "Add New Project"}
              </SheetTitle>
              <p className="text-sm text-gray-400">
                {editTarget ? "Update project details below." : "Fill in the details to create a new project."}
              </p>
            </SheetHeader>

            {/* Scrollable body */}
            <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">

              {/* Basic Info */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Basic Info</p>
                <div className="space-y-1.5">
                  <Label>Project Title *</Label>
                  <Input
                    placeholder="e.g. Website Redesign"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Project Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? "Fixed" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Hourly">Hourly</SelectItem>
                        <SelectItem value="Retainer">Retainer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estimation Deadline *</Label>
                    <Input
                      type="date"
                      value={form.estimationDeadline}
                      onChange={(e) => setForm({ ...form, estimationDeadline: e.target.value })}
                    />
                  </div>
                </div>
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
              </div>

              <Separator />

              {/* Team Members */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Team Members</p>
                {members.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-gray-50 rounded px-3 py-2 border">
                    No members found. Add members from the Members page first.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => {
                      const selected = form.members.includes(m.name);
                      return (
                        <button
                          key={m._id}
                          type="button"
                          onClick={() => toggleMember(m.name)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                            selected
                              ? "bg-[#0F6E56] text-white border-[#0F6E56] shadow-sm"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#0F6E56] hover:text-[#0F6E56]"
                          }`}
                        >
                          {selected && <X className="w-3 h-3" />}
                          {m.name}
                          {m.role && <span className="opacity-60"> · {m.role}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
                {form.members.length > 0 && (
                  <p className="text-xs text-[#0F6E56] font-medium">
                    {form.members.length} member{form.members.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              <Separator />

              {/* Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tasks</p>
                  <Button type="button" variant="outline" size="sm" onClick={addTask} className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add Task
                  </Button>
                </div>

                {form.tasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-lg">
                    No tasks yet — click &quot;Add Task&quot; to create one.
                  </p>
                )}

                {form.tasks.map((task, i) => (
                  <div key={i} className="border rounded-xl p-4 space-y-3 bg-gray-50 relative">
                    {/* Remove task */}
                    <button
                      type="button"
                      onClick={() => removeTask(i)}
                      className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="space-y-1.5 pr-6">
                      <Label className="text-xs">Task Title</Label>
                      <Input
                        placeholder="e.g. Design homepage wireframe"
                        value={task.title}
                        onChange={(e) => updateTask(i, "title", e.target.value)}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        placeholder="Add details, notes or acceptance criteria for this task…"
                        value={task.description}
                        onChange={(e) => updateTask(i, "description", e.target.value)}
                        className="bg-white resize-none min-h-20"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Status</Label>
                        <Select value={task.status} onValueChange={(v) => updateTask(i, "status", v ?? "Todo")}>
                          <SelectTrigger className="bg-white h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Todo">📋 Todo</SelectItem>
                            <SelectItem value="In Progress">⚡ In Progress</SelectItem>
                            <SelectItem value="Done">✅ Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Assigned To</Label>
                        <Input
                          placeholder="Name"
                          value={task.assignedTo}
                          onChange={(e) => updateTask(i, "assignedTo", e.target.value)}
                          className="bg-white h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky footer */}
            <SheetFooter className="px-6 py-4 border-t bg-white sticky bottom-0 z-10">
              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2 w-full mb-2">
                  {error}
                </p>
              )}
              <div className="flex gap-2 w-full">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#0F6E56] hover:bg-[#0d5e49]" disabled={saving}>
                  {saving ? "Saving..." : editTarget ? "Save Changes" : "Create Project"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
