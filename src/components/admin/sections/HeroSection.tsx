"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function HeroSection({ value, onChange }: Props) {
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
      { id: undefined, title: "", subtitle: "", description: "", primary_button_text: "", primary_button_url: "", secondary_button_text: "", secondary_button_url: "", image_url: "", image_alt: "" },
    ]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Hero Content"
        description="Manage the hero section on the homepage."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Hero
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((hero, i) => (
          <div key={hero.id || i} className="ad-panel ad-panel-hover p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Hero {i + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>
            <div className="mt-5 space-y-4">
              <Field label="Title">
                <Input value={hero.title} onChange={(e) => update(i, { title: e.target.value })} />
              </Field>
              <Field label="Subtitle">
                <Input value={hero.subtitle} onChange={(e) => update(i, { subtitle: e.target.value })} />
              </Field>
              <Field label="Description">
                <Textarea rows={3} value={hero.description} onChange={(e) => update(i, { description: e.target.value })} />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Primary Button Text">
                  <Input value={hero.primary_button_text} onChange={(e) => update(i, { primary_button_text: e.target.value })} />
                </Field>
                <Field label="Primary Button URL">
                  <Input value={hero.primary_button_url} onChange={(e) => update(i, { primary_button_url: e.target.value })} />
                </Field>
                <Field label="Secondary Button Text">
                  <Input value={hero.secondary_button_text} onChange={(e) => update(i, { secondary_button_text: e.target.value })} />
                </Field>
                <Field label="Secondary Button URL">
                  <Input value={hero.secondary_button_url} onChange={(e) => update(i, { secondary_button_url: e.target.value })} />
                </Field>
              </div>
              <Field label="Image URL">
                <Input value={hero.image_url} onChange={(e) => update(i, { image_url: e.target.value })} />
              </Field>
              <Field label="Image Alt Text">
                <Input value={hero.image_alt} onChange={(e) => update(i, { image_alt: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}