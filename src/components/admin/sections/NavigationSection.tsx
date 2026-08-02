"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function NavigationSection({ value, onChange }: Props) {
  function update(i: number, patch: Record<string, any>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }
  function add() {
    onChange([...value, { id: undefined, label: "", href: "", icon: "", is_external: false, is_visible: true }]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Navigation Menu"
        description="Manage the site navigation menu items."
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
              <Field label="Label">
                <Input value={item.label} onChange={(e) => update(i, { label: e.target.value })} />
              </Field>
              <Field label="URL">
                <Input value={item.href} onChange={(e) => update(i, { href: e.target.value })} />
              </Field>
              <Field label="Icon">
                <Input value={item.icon} onChange={(e) => update(i, { icon: e.target.value })} />
              </Field>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={!!item.is_external}
                    onChange={(e) => update(i, { is_external: e.target.checked })}
                    className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  External link
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={!!item.is_visible}
                    onChange={(e) => update(i, { is_visible: e.target.checked })}
                    className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  Visible
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}