"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "../Card";
import { Field, Input } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2, Save, Users, Shield, UserCog } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

interface Role {
  id?: string;
  name: string;
  permissions: Record<string, boolean>;
  created_at?: string;
}

interface Moderator {
  id?: string;
  username: string;
  display_name: string;
  role: string;
  permissions: Record<string, boolean>;
  created_by?: string;
  created_at?: string;
}

const DEFAULT_ROLES: Role[] = [
  { id: "owner", name: "owner", permissions: { all: true } },
  { id: "admin", name: "admin", permissions: { all: true } },
  { id: "moderator", name: "moderator", permissions: { reviews: true, submissions: true, hide_content: true } },
  { id: "content_editor", name: "content_editor", permissions: { content: true } },
];

const PERMISSION_OPTIONS = [
  { key: "reviews", label: "Manage Reviews" },
  { key: "submissions", label: "Manage Submissions" },
  { key: "hide_content", label: "Hide Content" },
  { key: "content", label: "Edit Content" },
  { key: "all", label: "Full Access" },
];

export function RolesSection() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingModerator, setEditingModerator] = useState<Moderator | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isCreatingModerator, setIsCreatingModerator] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [rolesRes, modsRes] = await Promise.all([
        fetch("/api/admin/roles").catch(() => ({ ok: false, json: () => Promise.resolve([]) })),
        fetch("/api/moderators").catch(() => ({ ok: false, json: () => Promise.resolve([]) })),
      ]);
      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(Array.isArray(data) ? data : DEFAULT_ROLES);
      } else {
        setRoles(DEFAULT_ROLES);
      }
      if (modsRes.ok) {
        const data = await modsRes.json();
        setModerators(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to load roles:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveRole(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRole && !isCreatingRole) return;
    setSaving(true);
    try {
      const method = editingRole?.id ? "PUT" : "POST";
      const url = editingRole?.id ? `/api/admin/roles/${editingRole.id}` : "/api/admin/roles";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "blueyadmin",
        },
        body: JSON.stringify(editingRole || { name: "", permissions: {} }),
      });
      if (res.ok) {
        toast.success(editingRole?.id ? "Role updated" : "Role created");
        setEditingRole(null);
        setIsCreatingRole(false);
        loadData();
      } else {
        toast.error("Failed to save role");
      }
    } catch {
      toast.error("Failed to save role");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveModerator(e: React.FormEvent) {
    e.preventDefault();
    if (!editingModerator && !isCreatingModerator) return;
    setSaving(true);
    try {
      const method = editingModerator?.id ? "PUT" : "POST";
      const url = editingModerator?.id ? `/api/moderators/${editingModerator.id}` : "/api/moderators";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "blueyadmin",
        },
        body: JSON.stringify(editingModerator || { username: "", display_name: "", role: "moderator", permissions: {} }),
      });
      if (res.ok) {
        toast.success(editingModerator?.id ? "Moderator updated" : "Moderator created");
        setEditingModerator(null);
        setIsCreatingModerator(false);
        loadData();
      } else {
        toast.error("Failed to save moderator");
      }
    } catch {
      toast.error("Failed to save moderator");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRole(id: string) {
    if (!confirm("Delete this role?")) return;
    try {
      const res = await fetch(`/api/admin/roles/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": "blueyadmin" },
      });
      if (res.ok) {
        toast.success("Role deleted");
        loadData();
      } else {
        toast.error("Failed to delete role");
      }
    } catch {
      toast.error("Failed to delete role");
    }
  }

  async function handleDeleteModerator(id: string) {
    if (!confirm("Delete this moderator?")) return;
    try {
      const res = await fetch(`/api/moderators/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": "blueyadmin" },
      });
      if (res.ok) {
        toast.success("Moderator deleted");
        loadData();
      } else {
        toast.error("Failed to delete moderator");
      }
    } catch {
      toast.error("Failed to delete moderator");
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-8">
          <div className="ad-skeleton h-8 w-48 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ad-skeleton h-20 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const roleForm = editingRole || (isCreatingRole ? { name: "", permissions: {} } : null);
  const modForm = editingModerator || (isCreatingModerator ? { username: "", display_name: "", role: "moderator", permissions: {} } : null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Roles */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <CardHeader title="Roles" description="Manage access roles" />
          <Button size="sm" variant="primary" onClick={() => { setIsCreatingRole(true); setEditingRole(null); }} leftIcon={<Plus className="h-4 w-4" />}>
            Add Role
          </Button>
        </div>

        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.id || role.name} className="ad-panel ad-panel-hover rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-[var(--accent)]" />
                  <div>
                    <h3 className="font-semibold text-white capitalize">{role.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(role.permissions).filter(([, v]) => v).map(([key]) => (
                        <span key={key} className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs text-[var(--accent)]">
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingRole(role); setIsCreatingRole(false); }}>
                    Edit
                  </Button>
                  {!["owner", "admin"].includes(role.name) && (
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteRole(role.id!)} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Moderators */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <CardHeader title="Moderators" description="Manage team members" />
          <Button size="sm" variant="primary" onClick={() => { setIsCreatingModerator(true); setEditingModerator(null); }} leftIcon={<Plus className="h-4 w-4" />}>
            Add Moderator
          </Button>
        </div>

        <div className="space-y-3">
          {moderators.map((mod) => (
            <div key={mod.id} className="ad-panel ad-panel-hover rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCog className="h-4 w-4 text-[var(--accent-2)]" />
                  <div>
                    <h3 className="font-semibold text-white">{mod.display_name}</h3>
                    <p className="text-xs text-[var(--text-dim)]">@{mod.username} · {mod.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingModerator(mod); setIsCreatingModerator(false); }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteModerator(mod.id!)} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {moderators.length === 0 && (
            <div className="ad-empty">
              <Users className="h-12 w-12 text-[var(--text-dim)]" />
              <p>No moderators yet</p>
            </div>
          )}
        </div>
      </Card>

      {/* Role Edit Form */}
      {roleForm && (
        <Card className="p-6">
          <CardHeader title={editingRole?.id ? "Edit Role" : "New Role"} />
          <form onSubmit={handleSaveRole} className="mt-6 space-y-5">
            <Field label="Role Name">
              <Input value={roleForm.name} onChange={(e) => setEditingRole ? setEditingRole({ ...roleForm, name: e.target.value }) : setIsCreatingRole(true)} required />
            </Field>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[var(--text-secondary)]">Permissions</label>
              {PERMISSION_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={!!roleForm.permissions[opt.key]}
                    onChange={(e) => setEditingRole ? setEditingRole({ ...roleForm, permissions: { ...roleForm.permissions, [opt.key]: e.target.checked } }) : setIsCreatingRole(true)}
                    className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={saving} leftIcon={<Save className="h-4 w-4" />}>
                {saving ? "Saving..." : "Save Role"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => { setEditingRole(null); setIsCreatingRole(false); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Moderator Edit Form */}
      {modForm && (
        <Card className="p-6">
          <CardHeader title={editingModerator?.id ? "Edit Moderator" : "New Moderator"} />
          <form onSubmit={handleSaveModerator} className="mt-6 space-y-5">
            <Field label="Username">
              <Input value={modForm.username} onChange={(e) => setEditingModerator ? setEditingModerator({ ...modForm, username: e.target.value }) : setIsCreatingModerator(true)} required />
            </Field>
            <Field label="Display Name">
              <Input value={modForm.display_name} onChange={(e) => setEditingModerator ? setEditingModerator({ ...modForm, display_name: e.target.value }) : setIsCreatingModerator(true)} required />
            </Field>
            <Field label="Role">
              <select
                value={modForm.role}
                onChange={(e) => setEditingModerator ? setEditingModerator({ ...modForm, role: e.target.value }) : setIsCreatingModerator(true)}
                className="field appearance-none"
              >
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={saving} leftIcon={<Save className="h-4 w-4" />}>
                {saving ? "Saving..." : "Save Moderator"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => { setEditingModerator(null); setIsCreatingModerator(false); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
