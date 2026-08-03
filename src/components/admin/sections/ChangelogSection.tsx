"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2, Save, Newspaper, Eye, EyeOff, Calendar } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

interface ChangelogEntry {
  id?: string;
  version: string;
  title: string;
  content: string;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export function ChangelogSection() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  const emptyEntry: ChangelogEntry = { version: "", title: "", content: "", published: false };

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/changelog");
      if (res.ok) {
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to load changelog:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEntry && !isCreating) return;
    setSaving(true);
    try {
      const method = editingEntry?.id ? "PUT" : "POST";
      const url = editingEntry?.id ? `/api/admin/changelog/${editingEntry.id}` : "/api/admin/changelog";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "blueyadmin",
        },
        body: JSON.stringify(editingEntry || emptyEntry),
      });
      if (res.ok) {
        toast.success(editingEntry?.id ? "Entry updated" : "Entry created");
        setEditingEntry(null);
        setIsCreating(false);
        loadEntries();
      } else {
        toast.error("Failed to save entry");
      }
    } catch {
      toast.error("Failed to save entry");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this changelog entry?")) return;
    try {
      const res = await fetch(`/api/admin/changelog/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": "blueyadmin" },
      });
      if (res.ok) {
        toast.success("Entry deleted");
        loadEntries();
      } else {
        toast.error("Failed to delete entry");
      }
    } catch {
      toast.error("Failed to delete entry");
    }
  }

  function startEdit(entry: ChangelogEntry) {
    setEditingEntry({ ...entry });
    setIsCreating(false);
  }

  function startCreate() {
    setEditingEntry(null);
    setIsCreating(true);
  }

  const formData = editingEntry || (isCreating ? emptyEntry : null);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="ad-skeleton h-8 w-48 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ad-skeleton h-24 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <CardHeader title="Changelog Entries" description="Manage your changelog" />
            <Button size="sm" variant="primary" onClick={startCreate} leftIcon={<Plus className="h-4 w-4" />}>
              Add Entry
            </Button>
          </div>

          {entries.length === 0 ? (
            <div className="ad-empty">
              <Newspaper className="h-12 w-12 text-[var(--text-dim)]" />
              <p>No changelog entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="ad-panel ad-panel-hover rounded-xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-bold text-[var(--accent)]">
                          v{entry.version}
                        </span>
                        <h3 className="font-semibold text-white">{entry.title}</h3>
                        {entry.published ? (
                          <Eye className="h-4 w-4 text-green-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-[var(--text-dim)]" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">{entry.content}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-[var(--text-dim)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(entry)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id!)} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <Card className="p-6">
          <CardHeader
            title={formData?.id ? "Edit Entry" : isCreating ? "New Entry" : ""}
            description={formData?.id ? "Update changelog entry" : "Create a new changelog entry"}
          />
          {formData && (
            <form onSubmit={handleSave} className="mt-6 space-y-5">
              <Field label="Version">
                <Input
                  value={formData.version}
                  onChange={(e) => setEditingEntry ? setEditingEntry({ ...formData, version: e.target.value }) : setIsCreating(true)}
                  placeholder="1.0.0"
                  required
                />
              </Field>
              <Field label="Title">
                <Input
                  value={formData.title}
                  onChange={(e) => setEditingEntry ? setEditingEntry({ ...formData, title: e.target.value }) : setIsCreating(true)}
                  placeholder="Initial Release"
                  required
                />
              </Field>
              <Field label="Content">
                <Textarea
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setEditingEntry ? setEditingEntry({ ...formData, content: e.target.value }) : setIsCreating(true)}
                  placeholder="Describe what's new in this version..."
                  required
                />
              </Field>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setEditingEntry ? setEditingEntry({ ...formData, published: e.target.checked }) : setIsCreating(true)}
                  className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <label htmlFor="published" className="text-sm text-[var(--text-secondary)]">
                  Published (visible to public)
                </label>
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={saving} leftIcon={<Save className="h-4 w-4" />}>
                  {saving ? "Saving..." : "Save Entry"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setEditingEntry(null); setIsCreating(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
