"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function FbxMashupsSection({ value, onChange }: Props) {
  function update(i: number, patch: Record<string, any>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }
  function add() {
    onChange([
      ...value,
      { id: undefined, title: "", base_avatar: "", parts_used: [], changes_made: [], software_used: [], thumbnail_url: "", before_image_url: "", after_image_url: "", description: "", status: "completed" },
    ]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="FBX Mashups"
        description="FBX mashup portfolio entries."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Project
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((item, i) => (
          <div key={item.id || i} className="ad-panel ad-panel-hover p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Project {i + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Title">
                  <Input value={item.title} onChange={(e) => update(i, { title: e.target.value })} />
                </Field>
                <Field label="Base Avatar">
                  <Input value={item.base_avatar} onChange={(e) => update(i, { base_avatar: e.target.value })} />
                </Field>
                <Field label="Status">
                  <Input value={item.status} onChange={(e) => update(i, { status: e.target.value })} />
                </Field>
                <Field label="Thumbnail URL">
                  <Input value={item.thumbnail_url} onChange={(e) => update(i, { thumbnail_url: e.target.value })} />
                </Field>
              </div>
              <Field label="Description">
                <Textarea rows={2} value={item.description} onChange={(e) => update(i, { description: e.target.value })} />
              </Field>
              <Field label="Parts Used (one per line)">
                <Textarea rows={3} value={(item.parts_used || []).join("\n")} onChange={(e) => update(i, { parts_used: e.target.value.split("\n").filter(Boolean) })} />
              </Field>
              <Field label="Changes Made (one per line)">
                <Textarea rows={3} value={(item.changes_made || []).join("\n")} onChange={(e) => update(i, { changes_made: e.target.value.split("\n").filter(Boolean) })} />
              </Field>
              <Field label="Software Used (one per line)">
                <Textarea rows={3} value={(item.software_used || []).join("\n")} onChange={(e) => update(i, { software_used: e.target.value.split("\n").filter(Boolean) })} />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Before Image URL">
                  <Input value={item.before_image_url} onChange={(e) => update(i, { before_image_url: e.target.value })} />
                </Field>
                <Field label="After Image URL">
                  <Input value={item.after_image_url} onChange={(e) => update(i, { after_image_url: e.target.value })} />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}