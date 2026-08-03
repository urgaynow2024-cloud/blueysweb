"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useSave } from "../SaveProvider";
import { useToast } from "../Toast";
import { Card, CardHeader } from "../Card";
import { Button } from "../Button";
import { Field, Input, Textarea } from "../Field";
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";

interface TosSection {
  id?: string;
  title: string;
  icon: string;
  items: string[];
  highlight_box: string;
  sort_order: number;
  visible: boolean;
}

interface Props {
  value: TosSection[];
  onChange: (next: TosSection[]) => void;
}

export function TosSection({ value, onChange }: Props) {
  const sb = supabase!;
  const [sections, setSections] = useState<TosSection[]>(value);
  const [loading, setLoading] = useState(false);
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
    if (!isSupabaseConfigured) return;
    const items = sectionsRef.current
      .filter((s) => s.id)
      .map((s) => ({ id: s.id!, sort_order: s.sort_order }));
    if (items.length === 0) return;
    for (const item of items) {
      await sb.from("tos_sections").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    return register("tos", saveOrder);
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
    const next = [...sections, { title: "", icon: "📄", items: [], highlight_box: "", sort_order: sections.length, visible: true }];
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
    updateSection(i, { items: [...next[i].items, ""] });
  }

  function removeItem(i: number, itemIndex: number) {
    const next = sections.slice();
    updateSection(i, { items: next[i].items.filter((_, j) => j !== itemIndex) });
  }

  if (!isSupabaseConfigured) {
    return (
      <Card className="p-8">
        <CardHeader title="Terms of Service" description="Manage TOS sections." />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">Supabase is not configured. Add your credentials to enable TOS management.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <CardHeader
          title="Terms of Service Sections"
          description="Manage the sections shown on the Terms of Service page. Drag to reorder — your arrangement is saved with the global Save button."
          actions={
            <Button size="sm" variant="primary" onClick={addSection} leftIcon={<Plus className="h-4 w-4" />}>
              Add Section
            </Button>
          }
        />

        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-[var(--bg)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {sections.map((section, i) => (
              <div key={section.id || i} className="ad-panel ad-panel-hover p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-dim)] hover:text-white disabled:opacity-30" aria-label="Move up">
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1} className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-dim)] hover:text-white disabled:opacity-30" aria-label="Move down">
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

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Title">
                    <Input value={section.title} onChange={(e) => updateSection(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Icon (emoji)">
                    <Input value={section.icon} onChange={(e) => updateSection(i, { icon: e.target.value })} />
                  </Field>
                </div>

                {section.highlight_box && (
                  <div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4">
                    <p className="text-sm text-[var(--accent)] font-semibold mb-1">Highlight Box</p>
                    <Textarea rows={2} value={section.highlight_box} onChange={(e) => updateSection(i, { highlight_box: e.target.value })} />
                  </div>
                )}

                <Field label="Items (one per line)" className="mt-4">
                  <div className="space-y-2">
                    {section.items.map((item: string, j: number) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs shrink-0">{j + 1}</span>
                        <Input value={item} onChange={(e) => updateItem(i, j, e.target.value)} />
                        <button type="button" onClick={() => removeItem(i, j)} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] shrink-0" aria-label="Remove item">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => addItem(i)} className="mt-2">Add Item</Button>
                </Field>
              </div>
            ))}
            {sections.length === 0 && (
              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
                <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">No TOS sections yet. Add your first section to get started.</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}