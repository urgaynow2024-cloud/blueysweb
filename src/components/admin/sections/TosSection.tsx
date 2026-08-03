"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/admin/Toast";
import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea, Select } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2, GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, History, RotateCcw, Loader2 } from "lucide-react";
import { getTosVersions, restoreTosVersion } from "@/lib/db";

interface SectionItem {
  id?: string;
  title: string;
  icon: string;
  description: string;
  items: string[];
  type: string;
  is_visible: boolean;
  colour: string;
  card_style: string;
  sort_order: number;
}

interface Props {
  value: SectionItem[];
  onChange: (next: SectionItem[]) => void;
  siteValue?: Record<string, string | string[]>;
  onSiteChange?: (next: Record<string, string | string[]>) => void;
}

const COLOURS = [
  { value: "accent", label: "Cyan (Default)", preview: "#5ab0f0" },
  { value: "accent-2", label: "Violet", preview: "#a78bfa" },
  { value: "accent-3", label: "Teal", preview: "#4fd1c5" },
  { value: "warning", label: "Amber", preview: "#fbbf24" },
  { value: "danger", label: "Red", preview: "#fb7185" },
  { value: "success", label: "Green", preview: "#34d399" },
];

const TYPES = [
  { value: "section", label: "Standard Section" },
  { value: "warning", label: "Warning / Important" },
  { value: "important", label: "Critical Notice" },
  { value: "info", label: "Information" },
  { value: "note", label: "Good to Know" },
];

const CARD_STYLES = [
  { value: "default", label: "Default" },
  { value: "glass", label: "Glassmorphism" },
  { value: "highlight", label: "Highlighted (Coloured Left Border)" },
];

interface TosVersion {
  id: string;
  version_number: number;
  snapshot: SectionItem[];
  changed_by: string;
  change_summary: string;
  created_at: string;
}

export function TosSection({ value, onChange, siteValue, onSiteChange }: Props) {
  const [versions, setVersions] = useState<TosVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (showVersions) loadVersions();
  }, [showVersions]);

  async function loadVersions() {
    setLoadingVersions(true);
    try {
      const data = await getTosVersions();
      setVersions(data);
    } catch (e: unknown) {
      console.error("Failed to load versions:", e);
    } finally {
      setLoadingVersions(false);
    }
  }

  function update(i: number, patch: Partial<SectionItem>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }

  function add() {
    const maxSort = value.length > 0 ? Math.max(...value.map((v) => v.sort_order || 0)) : -1;
    onChange([...value, { id: undefined, title: "", icon: "📄", description: "", items: [""], type: "section", is_visible: true, colour: "accent", card_style: "default", sort_order: maxSort + 1 }]);
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const next = value.slice();
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    next[i - 1].sort_order = i - 1;
    next[i].sort_order = i;
    onChange(next);
  }

  function moveDown(i: number) {
    if (i === value.length - 1) return;
    const next = value.slice();
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    next[i].sort_order = i;
    next[i + 1].sort_order = i + 1;
    onChange(next);
  }

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const next = value.slice();
    const draggedItem = next[dragItem.current];
    next.splice(dragItem.current, 1);
    next.splice(dragOverItem.current, 0, draggedItem);
    next.forEach((item, idx) => { item.sort_order = idx; });
    onChange(next);
    dragItem.current = null;
    dragOverItem.current = null;
  }

  async function handleRestore(versionId: string) {
    setRestoring(versionId);
    try {
      await restoreTosVersion(versionId);
      await loadVersions();
      toast.success("Version restored successfully");
      window.location.reload();
    } catch (e: unknown) {
      console.error("Restore failed:", e);
      toast.error("Failed to restore version");
    } finally {
      setRestoring(null);
    }
  }

  function handleSiteUpdate(key: string, val: string | string[]) {
    if (onSiteChange && siteValue) {
      onSiteChange({ ...siteValue, [key]: val });
    }
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Terms of Service"
        description="Manage your Terms of Service content. Changes are versioned automatically."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Section
          </Button>
        }
      />

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5">
        <h3 className="text-sm font-semibold text-white">Page Settings</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Last Updated Date">
            <Input
              value={siteValue?.tos_last_updated || ""}
              onChange={(e) => handleSiteUpdate("tos_last_updated", e.target.value)}
              placeholder="e.g. January 2026"
            />
          </Field>
          <Field label="Intro Text (one paragraph per line)">
              <Textarea
                rows={3}
                value={Array.isArray(siteValue?.tos_intro) ? (siteValue.tos_intro as string[]).join("\n") : (siteValue?.tos_intro || "")}
                onChange={(e) => handleSiteUpdate("tos_intro", e.target.value.split("\n").filter(Boolean))}
                placeholder="Enter introductory text for the TOS page..."
              />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Sections ({value.length})</h3>
        <Button size="sm" variant="secondary" onClick={() => setShowVersions(!showVersions)} leftIcon={<History className="h-4 w-4" />}>
          {showVersions ? "Hide" : "Version History"}
        </Button>
      </div>

      {showVersions && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5">
          <h4 className="text-sm font-semibold text-white">Version History</h4>
          {loadingVersions ? (
            <p className="mt-3 text-sm text-[var(--text-dim)]">Loading...</p>
          ) : versions.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--text-dim)]">No versions saved yet. Save changes to create a version.</p>
          ) : (
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">Version {v.version_number}</p>
                    <p className="text-xs text-[var(--text-dim)]">
                      {new Date(v.created_at).toLocaleString()} {v.changed_by ? `by ${v.changed_by}` : ""}
                    </p>
                    {v.change_summary && <p className="mt-1 text-xs text-[var(--text-secondary)]">{v.change_summary}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRestore(v.id)}
                    disabled={restoring === v.id}
                    leftIcon={restoring === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {value.map((section, i) => {
          const isVisible = section.is_visible !== false;
          const typeConf = {
            section: { color: "text-[var(--accent)]", bg: "bg-[var(--accent-soft)]" },
            warning: { color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
            important: { color: "text-[var(--danger)]", bg: "bg-[var(--danger)]/10" },
            info: { color: "text-[var(--accent-3)]", bg: "bg-[var(--accent-3)]/10" },
            note: { color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
          }[section.type] || { color: "text-[var(--accent)]", bg: "bg-[var(--accent-soft)]" };

          return (
            <div
              key={section.id || i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`ad-panel ad-panel-hover p-5 ${!isVisible ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button type="button" className="cursor-grab text-[var(--text-dim)] hover:text-white" aria-label="Drag to reorder">
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <h3 className="text-sm font-semibold text-white">Section {i + 1}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeConf.bg} ${typeConf.color}`}>
                    {section.type || "section"}
                  </span>
                  {!isVisible && (
                    <span className="inline-flex items-center rounded-full bg-[var(--text-dim)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => moveUp(i)} disabled={i === 0} aria-label="Move up">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => moveDown(i)} disabled={i === value.length - 1} aria-label="Move down">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => update(i, { is_visible: !isVisible })} aria-label={isVisible ? "Hide section" : "Show section"}>
                    {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                    Remove
                  </Button>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Title">
                    <Input value={section.title} onChange={(e) => update(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Icon (emoji)">
                    <Input value={section.icon} onChange={(e) => update(i, { icon: e.target.value })} placeholder="🔒" />
                  </Field>
                </div>
                <Field label="Short Description">
                  <Input value={section.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="Brief summary shown on the card..." />
                </Field>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Section Type">
                    <Select value={section.type} onChange={(e) => update(i, { type: e.target.value })}>
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Accent Colour">
                    <Select value={section.colour} onChange={(e) => update(i, { colour: e.target.value })}>
                      {COLOURS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Card Style">
                    <Select value={section.card_style} onChange={(e) => update(i, { card_style: e.target.value })}>
                      {CARD_STYLES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field label="Items (one per line)">
                  <Textarea
                    rows={5}
                    value={(section.items || []).join("\n")}
                    onChange={(e) => update(i, { items: e.target.value.split("\n").filter(Boolean) })}
                  />
                </Field>
              </div>
            </div>
          );
        })}
      </div>

      {value.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg)] py-12 text-center">
          <p className="text-sm text-[var(--text-dim)]">No TOS sections yet. Click &quot;Add Section&quot; to get started.</p>
        </div>
      )}
    </Card>
  );
}
