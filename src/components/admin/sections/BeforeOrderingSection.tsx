"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function BeforeOrderingSection({ value, onChange }: Props) {
  function update(i: number, patch: Record<string, any>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }
  function add() {
    onChange([...value, { id: undefined, emoji: "", title: "", desc: "" }]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Before Ordering Checklist"
        description="Checklist items shown on the Before Ordering page."
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
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Emoji">
                <Input value={item.emoji} onChange={(e) => update(i, { emoji: e.target.value })} />
              </Field>
              <Field label="Title">
                <Input value={item.title} onChange={(e) => update(i, { title: e.target.value })} />
              </Field>
              <Field label="Description" className="md:col-span-3">
                <Textarea rows={2} value={item.desc} onChange={(e) => update(i, { desc: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}