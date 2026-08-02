"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function MediaLibrarySection({ value, onChange }: Props) {
  function update(i: number, patch: Record<string, any>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }
  function add() {
    onChange([...value, { id: undefined, name: "", url: "", path: "", type: "image", alt_text: "" }]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Media Library"
        description="Central media library for all site images and assets."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Item
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((item, i) => (
          <div key={item.id || i} className="ad-panel ad-panel-hover p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Item {i + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Name">
                <Input value={item.name} onChange={(e) => update(i, { name: e.target.value })} />
              </Field>
              <Field label="Type">
                <select
                  value={item.type}
                  onChange={(e) => update(i, { type: e.target.value })}
                  className="ad-field rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="banner">Banner</option>
                  <option value="asset">Asset</option>
                </select>
              </Field>
              <Field label="URL" className="md:col-span-2">
                <Input value={item.url} onChange={(e) => update(i, { url: e.target.value })} />
              </Field>
              <Field label="Path">
                <Input value={item.path} onChange={(e) => update(i, { path: e.target.value })} />
              </Field>
              <Field label="Alt Text">
                <Input value={item.alt_text} onChange={(e) => update(i, { alt_text: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}