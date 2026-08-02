"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function HomepageSectionsSection({ value, onChange }: Props) {
  function update(i: number, patch: Record<string, any>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }
  function add() {
    onChange([...value, { id: undefined, section_key: "", label: "", visible: true, sort_order: 0 }]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Homepage Sections"
        description="Control which sections appear on the homepage and their order."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Section
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((section, i) => (
          <div key={section.id || i} className="ad-panel ad-panel-hover p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-semibold text-white">{section.label || `Section ${i + 1}`}</h3>
              <span className="text-xs text-[var(--text-dim)]">{section.section_key}</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={!!section.visible}
                  onChange={(e) => update(i, { visible: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                Visible
              </label>
              <Field label="Sort Order" className="w-24">
                <Input type="number" value={section.sort_order} onChange={(e) => update(i, { sort_order: Number(e.target.value) })} />
              </Field>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}