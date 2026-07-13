"use client";

import { useState, useEffect } from "react";
import { UserCog, Plus, Trash2, ShieldAlert, Loader2, Check, X } from "lucide-react";
import { Card, CardHeader } from "../Card";
import { Button } from "../Button";
import { Field, Input } from "../Field";
import { PERMISSION_LIST, emptyPermissions, type Permission } from "@/lib/permissions";

type Moderator = {
  id: string;
  username: string;
  display_name: string;
  role: string;
  permissions: Record<Permission, boolean>;
  created_at: string;
};

export function ModeratorsSection() {
  const [moderators, setModerators] = useState<Moderator[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [perms, setPerms] = useState<Record<Permission, boolean>>(emptyPermissions());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError("");
    const res = await fetch("/api/moderators");
    if (res.status === 401) {
      setError("Owner session not active. Save your work, then sign out and back in as owner to manage moderators.");
      setModerators(null);
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to load moderators");
      return;
    }
    setModerators(data.moderators || []);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice("");
    const res = await fetch("/api/moderators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, display_name: displayName, permissions: perms }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setNotice(data.error || "Could not create moderator");
      return;
    }
    setUsername("");
    setPassword("");
    setDisplayName("");
    setPerms(emptyPermissions());
    setNotice("Moderator created.");
    load();
  }

  async function togglePerm(id: string, key: Permission, value: boolean) {
    const current = moderators?.find((m) => m.id === id);
    if (!current) return;
    const next = { ...current.permissions, [key]: value };
    setModerators((prev) => (prev ? prev.map((m) => (m.id === id ? { ...m, permissions: next } : m)) : prev));
    const res = await fetch(`/api/moderators/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: next }),
    });
    if (!res.ok) {
      setNotice("Failed to update permission");
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this moderator? They will lose access immediately.")) return;
    const res = await fetch(`/api/moderators/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else setNotice("Failed to remove moderator");
  }

  return (
    <div className="space-y-6">
      <CardHeader
        title="Moderators"
        description="Create moderator accounts and choose exactly which actions each one can perform. Moderators can never change pricing, design, payments, or admin settings."
        actions={
          <Button size="sm" variant="secondary" onClick={load} leftIcon={<UserCog className="h-4 w-4" />}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}
      {notice && <p className="text-sm text-[var(--accent)]">{notice}</p>}

      {/* Create form */}
      <Card className="p-6">
        <p className="mb-4 text-sm font-semibold text-white">Add a moderator</p>
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Username">
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="moderator1" required minLength={3} />
            </Field>
            <Field label="Display name">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Alex" />
            </Field>
          </div>
          <Field label="Temporary password" hint="Share this with the moderator. They can't change it themselves.">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} />
          </Field>
          <div>
            <p className="ad-label">Permissions</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PERMISSION_LIST.map((p) => (
                <Toggle
                  key={p.key}
                  label={p.label}
                  desc={p.desc}
                  checked={perms[p.key]}
                  onChange={(v) => setPerms((prev) => ({ ...prev, [p.key]: v }))}
                />
              ))}
            </div>
          </div>
          <Button type="submit" loading={saving} leftIcon={!saving && <Plus className="h-4 w-4" />}>
            Create moderator
          </Button>
        </form>
      </Card>

      {/* List */}
      {moderators && moderators.length > 0 && (
        <div className="space-y-4">
          {moderators.map((m) => (
            <Card key={m.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{m.display_name}</p>
                  <p className="text-xs text-[var(--text-dim)]">@{m.username}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove(m.id)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                  Remove
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PERMISSION_LIST.map((p) => (
                  <Toggle
                    key={p.key}
                    label={p.label}
                    desc={p.desc}
                    checked={m.permissions[p.key]}
                    onChange={(v) => togglePerm(m.id, p.key, v)}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white/[0.02] p-4 text-sm text-[var(--text-dim)]">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
        Moderators sign in at <span className="px-1 font-mono text-[var(--text-secondary)]">/moderator</span>. They can approve or reject content based on these toggles, but cannot edit pricing, design, payments, or owner settings, and cannot permanently delete records.
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
        checked ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]" : "border-[var(--border)] bg-white/[0.02] hover:border-[var(--border-hover)]"
      }`}
    >
      <span
        className={`mt-0.5 grid h-5 w-9 shrink-0 place-items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-[var(--accent)]" : "bg-white/10"
        }`}
      >
        <span className={`grid h-4 w-4 place-items-center rounded-full bg-white transition-transform ${checked ? "translate-x-2" : "-translate-x-2"}`}>
          {checked ? <Check className="h-3 w-3 text-[var(--accent)]" /> : <X className="h-3 w-3 text-[var(--text-dim)]" />}
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="block text-xs text-[var(--text-dim)]">{desc}</span>
      </span>
    </button>
  );
}
