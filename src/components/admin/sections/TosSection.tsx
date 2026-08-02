"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function TosSection({ value, onChange }: Props) {
  function update(i: number, patch: Record<string, any>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }
  function add() {
    onChange([...value, { id: undefined, title: "", icon: "", items: [] }]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Terms of Service Sections"
        description="Editable TOS sections shown on the Terms of Service page."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Section
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((section, i) => (
          <div key={section.id || i} className="ad-panel ad-panel-hover p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Section {i + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Title">
                  <Input value={section.title} onChange={(e) => update(i, { title: e.target.value })} />
                </Field>
                <Field label="Icon">
                  <Input value={section.icon} onChange={(e) => update(i, { icon: e.target.value })} />
                </Field>
              </div>
              <Field label="Items (one per line)">
                <Textarea rows={4} value={(section.items || []).join("\n")} onChange={(e) => update(i, { items: e.target.value.split("\n").filter(Boolean) })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}