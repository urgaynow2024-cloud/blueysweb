"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2, Star } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function PricingSection({ value, onChange }: Props) {
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
      { id: undefined, name: "New Tier", emoji: "✨", price: "£XX - £XX", badge: null, popular: false, features: [] },
    ]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Pricing Tiers"
        description="Edit your commission pricing. NSFW tiers are shown only on the age-gated page."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Tier
          </Button>
        }
      />

      <div className="mt-6 space-y-4">
        {value.map((tier, i) => (
          <div key={tier.id || i} className="ad-panel ad-panel-hover p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Tier {i + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Name">
                <Input value={tier.name} onChange={(e) => update(i, { name: e.target.value })} />
              </Field>
              <Field label="Price">
                <Input value={tier.price} onChange={(e) => update(i, { price: e.target.value })} />
              </Field>
              <Field label="Emoji">
                <Input value={tier.emoji} onChange={(e) => update(i, { emoji: e.target.value })} />
              </Field>
            </div>

            <Field label="Features (one per line)" className="mt-4">
              <Textarea
                rows={4}
                value={(tier.features || []).join("\n")}
                onChange={(e) => update(i, { features: e.target.value.split("\n").filter(Boolean) })}
              />
            </Field>

            <div className="mt-4 flex flex-wrap items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={!!tier.popular}
                  onChange={(e) => update(i, { popular: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                Mark as popular
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={!!tier.is_nsfw}
                  onChange={(e) => update(i, { is_nsfw: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-[var(--danger)]" />
                  NSFW tier (18+ only)
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
