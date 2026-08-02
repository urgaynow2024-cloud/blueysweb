"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function StatsSection({ value, onChange }: Props) {
  function update(i: number, patch: Record<string, any>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }
  function add() {
    onChange([...value, { id: undefined, label: "", value: "", suffix: "", sublabel: "" }]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Homepage Statistics"
        description="Dynamic statistics shown on the homepage. Leave empty to hide."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Stat
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((stat, i) => (
          <div key={stat.id || i} className="ad-panel ad-panel-hover p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Stat {i + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Label">
                <Input value={stat.label} onChange={(e) => update(i, { label: e.target.value })} />
              </Field>
              <Field label="Value">
                <Input value={stat.value} onChange={(e) => update(i, { value: e.target.value })} />
              </Field>
              <Field label="Suffix">
                <Input value={stat.suffix} onChange={(e) => update(i, { suffix: e.target.value })} />
              </Field>
              <Field label="Sublabel">
                <Input value={stat.sublabel} onChange={(e) => update(i, { sublabel: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}