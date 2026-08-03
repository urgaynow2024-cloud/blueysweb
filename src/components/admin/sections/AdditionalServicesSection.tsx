"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function AdditionalServicesSection({ value, onChange }: Props) {
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
      {
        id: undefined,
        emoji: "✨",
        title: "New Service",
        description: "Description of this additional service.",
        examples: "",
        note: "Pricing note to display.",
      },
    ]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Additional Services"
        description="Services priced on request, shown below the main pricing tiers on the pricing page."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Service
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((item, i) => (
          <div key={item.id || i} className="ad-panel ad-panel-hover p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Service {i + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Emoji">
                <Input value={item.emoji || ""} onChange={(e) => update(i, { emoji: e.target.value })} />
              </Field>
              <Field label="Title">
                <Input value={item.title || ""} onChange={(e) => update(i, { title: e.target.value })} />
              </Field>
              <Field label="Note (pricing text)">
                <Input value={item.note || ""} onChange={(e) => update(i, { note: e.target.value })} />
              </Field>
            </div>

            <Field label="Description" className="mt-4">
              <Textarea
                rows={3}
                value={item.description || ""}
                onChange={(e) => update(i, { description: e.target.value })}
              />
            </Field>

            <Field label="Examples (one per line)" className="mt-4">
              <Textarea
                rows={4}
                value={Array.isArray(item.examples) ? item.examples.join("\n") : (item.examples || "").toString()}
                onChange={(e) => update(i, { examples: e.target.value.split("\n").filter(Boolean) })}
              />
            </Field>
          </div>
        ))}
      </div>
    </Card>
  );
}
