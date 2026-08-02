"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function ServicesSection({ value, onChange }: Props) {
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
      { id: undefined, title: "", emoji: "", image_url: "", desc: "", features: [] },
    ]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Services"
        description="Service cards shown on the homepage and services page."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Service
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((svc, i) => (
          <div key={svc.id || i} className="ad-panel ad-panel-hover p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Service {i + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Title">
                  <Input value={svc.title} onChange={(e) => update(i, { title: e.target.value })} />
                </Field>
                <Field label="Emoji">
                  <Input value={svc.emoji} onChange={(e) => update(i, { emoji: e.target.value })} />
                </Field>
              </div>
              <Field label="Image URL">
                <Input value={svc.image_url} onChange={(e) => update(i, { image_url: e.target.value })} />
              </Field>
              <Field label="Description">
                <Textarea rows={3} value={svc.desc} onChange={(e) => update(i, { desc: e.target.value })} />
              </Field>
              <Field label="Features (one per line)">
                <Textarea rows={4} value={(svc.features || []).join("\n")} onChange={(e) => update(i, { features: e.target.value.split("\n").filter(Boolean) })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}