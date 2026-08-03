"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSave } from "../SaveProvider";
import { useToast } from "../Toast";
import { Card, CardHeader } from "../Card";
import { Button } from "../Button";
import { Field, Input, Textarea, Select } from "../Field";
import { Plus, Trash2, GripVertical, Eye, EyeOff, FileText, AlertCircle, AlertTriangle, Info } from "lucide-react";

interface TosSection {
  id?: string;
  title: string;
  icon: string;
  section_type: "bullets" | "paragraphs";
  content: string;
  items: string[];
  highlight_box: string;
  box_type: "info" | "warning" | "error";
  box_title: string;
  sort_order: number;
  visible: boolean;
}

interface Props {
  value: TosSection[];
  onChange: (next: TosSection[]) => void;
}

export function TosSection({ value, onChange }: Props) {
  const [sections, setSections] = useState<TosSection[]>([]);
  const sectionsRef = useRef<TosSection[]>([]);
  const { markDirty, register } = useSave();
  const toast = useToast();

  useEffect(() => {
    setSections(value);
  }, [value]);

  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  const saveOrder = useCallback(async () => {
    const current = sectionsRef.current;
    for (const item of current) {
      if (!item.id) continue;
      try {
        const res = await fetch(`/api/tos-sections/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: item.sort_order }),
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          console.warn("Sort order save failed:", r.error || res.status);
        }
      } catch (e) {
        console.warn("Sort order save error:", e);
      }
    }
  }, []);

  useEffect(() => {
    return register("tos-order", saveOrder);
  }, [register, saveOrder]);

  function updateSection(i: number, patch: Partial<TosSection>) {
    const next = sections.slice();
    next[i] = { ...next[i], ...patch };
    setSections(next);
    onChange(next);
    markDirty();
  }

  function removeSection(i: number) {
    const next = sections.filter((_, j) => j !== i);
    setSections(next);
    onChange(next);
    markDirty();
  }

  function addSection() {
    const next = [...sections, {
      title: "",
      icon: "📄",
      section_type: "paragraphs" as const,
      content: "",
      items: [],
      highlight_box: "",
      box_type: "info" as const,
      box_title: "",
      sort_order: sections.length,
      visible: true,
    }];
    setSections(next);
    onChange(next);
    markDirty();
  }

  function toggleVisibility(i: number) {
    updateSection(i, { visible: !sections[i].visible });
  }

  function moveSection(i: number, dir: number) {
    const next = sections.slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    next.forEach((s, idx) => (s.sort_order = idx));
    setSections(next);
    onChange(next);
    markDirty();
  }

  function updateItem(i: number, itemIndex: number, val: string) {
    const next = sections.slice();
    const items = next[i].items.slice();
    items[itemIndex] = val;
    updateSection(i, { items });
  }

  function addItem(i: number) {
    const next = sections.slice();
    const items = [...(next[i].items || []), ""];
    updateSection(i, { items });
  }

  function removeItem(i: number, itemIndex: number) {
    const next = sections.slice();
    const items = next[i].items.filter((_, j) => j !== itemIndex);
    updateSection(i, { items });
  }

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <CardHeader
          title="Terms of Service Sections"
          description="Manage the sections shown on the Terms of Service page. Use the global Save to persist changes. Sections with 'paragraphs' type allow rich text content; 'bullets' type uses item lists."
          actions={
            <Button size="sm" variant="primary" onClick={addSection} leftIcon={<Plus className="h-4 w-4" />}>
              Add Section
            </Button>
          }
        />

        <div className="mt-6 space-y-4">
          {sections.map((section, i) => (
            <div key={section.id || i} className="ad-panel ad-panel-hover p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-dim)] hover:text-white disabled:opacity-30" aria-label="Move up">
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <h3 className="text-sm font-semibold text-white">{section.title || `Section ${i + 1}`}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => toggleVisibility(i)} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${section.visible ? "text-[var(--accent)] bg-[var(--accent-soft)]" : "text-[var(--text-dim)] hover:bg-white/5"}`} aria-label={section.visible ? "Hide section" : "Show section"}>
                    {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => removeSection(i)} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]" aria-label="Delete section">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Title">
                  <Input value={section.title} onChange={(e) => updateSection(i, { title: e.target.value })} />
                </Field>
                <Field label="Icon (emoji)">
                  <Input value={section.icon} onChange={(e) => updateSection(i, { icon: e.target.value })} />
                </Field>
                <Field label="Section Type">
                  <Select value={section.section_type} onChange={(e) => updateSection(i, { section_type: e.target.value as "bullets" | "paragraphs" })}>
                    <option value="paragraphs">Paragraphs (rich text)</option>
                    <option value="bullets">Bullet Points</option>
                  </Select>
                </Field>
              </div>

              {section.section_type === "paragraphs" && (
                <Field label="Content (supports markdown)" className="mt-4">
                  <Textarea
                    rows={10}
                    value={section.content || ""}
                    onChange={(e) => updateSection(i, { content: e.target.value })}
                    placeholder="Write your section content here. Supports markdown formatting. Use **bold**, *italic*, ### Headings, etc."
                  />
                </Field>
              )}

              {section.section_type === "bullets" && (
                <Field label="Items (one per line)" className="mt-4">
                  <div className="space-y-2">
                    {(section.items || []).map((item: string, j: number) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs">{j + 1}</span>
                        <Input value={item} onChange={(e) => updateItem(i, j, e.target.value)} />
                        <button type="button" onClick={() => removeItem(i, j)} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] shrink-0" aria-label="Remove item">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => addItem(i)} className="mt-2">Add Item</Button>
                </Field>
              )}

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Box Type">
                  <Select value={section.box_type} onChange={(e) => updateSection(i, { box_type: e.target.value as "info" | "warning" | "error" })}>
                    <option value="info">Info (blue)</option>
                    <option value="warning">Warning (amber)</option>
                    <option value="error">Error (red)</option>
                  </Select>
                </Field>
                <Field label="Box Title">
                  <Input value={section.box_title || ""} onChange={(e) => updateSection(i, { box_title: e.target.value })} placeholder="e.g. Important, Warning" />
                </Field>
                <Field label="Box Content">
                  <Input value={section.highlight_box || ""} onChange={(e) => updateSection(i, { highlight_box: e.target.value })} placeholder="Optional highlighted message" />
                </Field>
              </div>
            </div>
          ))}

          {sections.length === 0 && (
            <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <FileText className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                No TOS sections yet. Add your first section to get started.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
