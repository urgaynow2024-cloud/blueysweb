"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, GripVertical, Eye, EyeOff, Star, Upload, X, ChevronUp, ChevronDown, ExternalLink, Users } from "lucide-react";
import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { uploadToSupabaseStorage, deleteFromSupabaseStorage } from "@/lib/supabase-storage";
import { isSupabaseConfigured } from "@/lib/supabase";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

const CATEGORIES = [
  { value: "supporters", label: "💜 Supporters" },
  { value: "artists", label: "🎨 Artists" },
  { value: "developers", label: "💻 Developers" },
  { value: "testers", label: "🧪 Testers" },
  { value: "helpers", label: "🛠️ Helpers" },
  { value: "special-thanks", label: "🌟 Special Thanks" },
  { value: "assets-resources", label: "📦 Assets / Resources" },
  { value: "collaborators", label: "🤝 Collaborators" },
];

export function CreditsSection({ value, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    categories: [] as string[],
    avatar_url: "",
    avatar_path: "",
    website_url: "",
    discord_url: "",
    note: "",
    featured: false,
    visible: true,
    sort_order: 0,
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function add() {
    const newCredit = {
      id: undefined,
      name: "",
      description: "",
      categories: [],
      avatar_url: "",
      avatar_path: "",
      website_url: "",
      discord_url: "",
      social_links: {},
      note: "",
      featured: false,
      visible: true,
      sort_order: value.length,
    };
    onChange([...value, newCredit]);
    setEditData(newCredit);
    setEditingId("new");
  }

  function startEdit(credit: any) {
    setEditData({
      name: credit.name || "",
      description: credit.description || "",
      categories: credit.categories || [],
      avatar_url: credit.avatar_url || "",
      avatar_path: credit.avatar_path || "",
      website_url: credit.website_url || "",
      discord_url: credit.discord_url || "",
      note: credit.note || "",
      featured: credit.featured || false,
      visible: credit.visible ?? true,
      sort_order: credit.sort_order || 0,
    });
    setSocialLinks(credit.social_links || {});
    setEditingId(credit.id || "new");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({
      name: "",
      description: "",
      categories: [],
      avatar_url: "",
      avatar_path: "",
      website_url: "",
      discord_url: "",
      note: "",
      featured: false,
      visible: true,
      sort_order: 0,
    });
    setSocialLinks({});
  }

  async function saveEdit() {
    if (!editData.name.trim()) return;

    const payload = { ...editData, social_links: socialLinks };

    if (editingId === "new") {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        onChange(value.map((c) => (c.id === "new" ? saved : c)));
        cancelEdit();
      }
    } else if (editingId) {
      const res = await fetch(`/api/credits/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        onChange(value.map((c) => (c.id === editingId ? saved : c)));
        cancelEdit();
      }
    }
  }

  async function handleDelete(credit: any) {
    if (!confirm(`Delete credit "${credit.name}"? This cannot be undone.`)) return;

    if (credit.avatar_path) {
      await deleteFromSupabaseStorage("portfolio-images", credit.avatar_path);
    }

    const res = await fetch(`/api/credits/${credit.id}`, { method: "DELETE" });
    if (res.ok) {
      onChange(value.filter((c) => c.id !== credit.id));
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;
    setUploading(true);
    try {
      const path = `credits/${editingId === "new" ? Date.now() : editingId}/avatar-${Date.now()}.${file.name.split(".").pop() || "bin"}`;
      const { url } = await uploadToSupabaseStorage("portfolio-images", path, file);
      if (editData.avatar_path) {
        await deleteFromSupabaseStorage("portfolio-images", editData.avatar_path);
      }
      setEditData((d) => ({ ...d, avatar_url: url, avatar_path: path }));
    } catch {
      // handled
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  function updateSocialLink(key: string, value: string) {
    setSocialLinks((prev) => {
      const next = { ...prev };
      if (value.trim()) next[key] = value.trim();
      else delete next[key];
      return next;
    });
  }

  function addSocialLink() {
    setSocialLinks((prev) => ({ ...prev, [""]: "" }));
  }

  function removeSocialLink(key: string) {
    setSocialLinks((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function toggleCategory(cat: string) {
    setEditData((d) => ({
      ...d,
      categories: d.categories.includes(cat) ? d.categories.filter((c) => c !== cat) : [...d.categories, cat],
    }));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = value.slice();
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    next.forEach((c, i) => (c.sort_order = i));
    onChange(next);
    fetch("/api/credits/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next.map((c) => ({ id: c.id, sort_order: c.sort_order }))),
    });
  }

  function moveDown(index: number) {
    if (index === value.length - 1) return;
    const next = value.slice();
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    next.forEach((c, i) => (c.sort_order = i));
    onChange(next);
    fetch("/api/credits/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next.map((c) => ({ id: c.id, sort_order: c.sort_order }))),
    });
  }

  return (
    <Card className="p-8 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-[var(--accent)]/5 blur-[120px] orb-slow" />
      <CardHeader
        title="Credits"
        description="Manage people who have helped, supported, or contributed to the project."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Credit
          </Button>
        }
      />

      {editingId && (
        <div className="ad-section-card ad-section-card-hover mt-6 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">{editingId === "new" ? "New Credit" : "Edit Credit"}</h3>
            <Button size="sm" variant="ghost" onClick={cancelEdit} leftIcon={<X className="h-4 w-4" />}>
              Cancel
            </Button>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} placeholder="Display name" />
            </Field>
            <Field label="Description">
              <Textarea rows={2} value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="What they helped with" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Categories">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleCategory(cat.value)}
                    className={`ad-badge cursor-pointer transition-colors ${editData.categories.includes(cat.value) ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : ""}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Website URL">
              <Input value={editData.website_url} onChange={(e) => setEditData({ ...editData, website_url: e.target.value })} placeholder="https://…" />
            </Field>
            <Field label="Discord URL">
              <Input value={editData.discord_url} onChange={(e) => setEditData({ ...editData, discord_url: e.target.value })} placeholder="https://discord.gg/…" />
            </Field>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Field label="Social Links">
                <span className="text-xs text-[var(--text-dim)]">Add any extra social/profile links (Twitter, YouTube, etc.)</span>
              </Field>
              <Button size="sm" variant="secondary" onClick={addSocialLink} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                Add Link
              </Button>
            </div>
            <div className="space-y-2">
              {Object.entries(socialLinks).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Input value={key} onChange={(e) => { updateSocialLink(key, e.target.value); }} placeholder="Platform (e.g. Twitter)" className="!w-32" />
                  <Input value={value} onChange={(e) => updateSocialLink(key, e.target.value)} placeholder="https://…" className="!flex-1" />
                  <Button size="sm" variant="ghost" onClick={() => removeSocialLink(key)} className="!text-[var(--danger)]">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {Object.keys(socialLinks).length === 0 && (
                <p className="text-xs text-[var(--text-dim)]">No social links added yet.</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Field label="Note (optional)">
              <Textarea rows={2} value={editData.note} onChange={(e) => setEditData({ ...editData, note: e.target.value })} placeholder="A personal thank-you note" />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input type="checkbox" checked={editData.visible} onChange={(e) => setEditData({ ...editData, visible: e.target.checked })} />
              Visible
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input type="checkbox" checked={editData.featured} onChange={(e) => setEditData({ ...editData, featured: e.target.checked })} />
              Featured
            </label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading || !isSupabaseConfigured} leftIcon={uploading ? undefined : <Upload className="h-4 w-4" />}>
              {uploading ? "Uploading…" : editData.avatar_url ? "Replace Avatar" : "Upload Avatar"}
            </Button>
            {editData.avatar_url && (
              <button type="button" onClick={() => setEditData((d) => ({ ...d, avatar_url: "", avatar_path: "" }))} className="text-xs text-[var(--danger)] hover:underline">
                Remove avatar
              </button>
            )}
          </div>
          {editData.avatar_url && (
            <div className="mt-4">
              <img src={editData.avatar_url} alt="Avatar preview" className="h-16 w-16 rounded-xl object-cover border border-[var(--border)]" />
            </div>
          )}
          <div className="mt-5 flex justify-end">
            <Button size="sm" variant="primary" onClick={saveEdit} leftIcon={<Star className="h-4 w-4" />}>
              Save Credit
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {value.length === 0 && !editingId && (
          <div className="ad-empty rounded-[var(--r-md)] border border-dashed border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]">No credits yet</p>
            <p className="text-xs text-[var(--text-dim)]">Add your first credit above.</p>
          </div>
        )}
        {value.map((credit, i) => (
          <div key={credit.id || i} className="ad-section-card ad-section-card-hover p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="text-[var(--text-dim)] hover:text-white disabled:opacity-30">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => moveDown(i)} disabled={i === value.length - 1} className="text-[var(--text-dim)] hover:text-white disabled:opacity-30">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                {credit.avatar_url ? (
                  <img src={credit.avatar_url} alt={credit.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-sm font-bold text-white">
                    {credit.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{credit.name || "Untitled"}</p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {(credit.categories || []).map((cat: string) => (
                      <span key={cat} className="ad-badge border-[var(--border-strong)] text-[var(--text-secondary)]">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(credit)} className="!text-[var(--accent)]">
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(credit)} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--text-dim)]">
              {credit.featured && <span className="ad-badge border-[var(--accent)] text-[var(--accent)]">Featured</span>}
              {credit.visible ? <span className="ad-badge border-emerald-500/20 bg-emerald-500/10 text-emerald-400">Visible</span> : <span className="ad-badge border-[var(--border)] text-[var(--text-dim)]">Hidden</span>}
              {credit.website_url && (
                <a href={credit.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--accent-muted)] hover:text-[var(--accent)]">
                  <ExternalLink className="h-3 w-3" /> Website
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
