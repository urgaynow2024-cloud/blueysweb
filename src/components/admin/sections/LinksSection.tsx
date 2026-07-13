"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2, ExternalLink } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function LinksSection({ value, onChange }: Props) {
  function update(i: number, patch: Record<string, any>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }
  function add() {
    onChange([...value, { id: undefined, name: "", url: "", description: "" }]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Social & Platform Links"
        description="Links shown on the /links hub and footer."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Link
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.length === 0 && (
          <div className="ad-empty rounded-[var(--r-md)] border border-dashed border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]">No links yet</p>
            <p className="text-xs text-[var(--text-dim)]">Add your first link above.</p>
          </div>
        )}
        {value.map((link, i) => (
          <div key={link.id || i} className="ad-panel ad-panel-hover p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Link {i + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Name">
                <Input value={link.name || ""} onChange={(e) => update(i, { name: e.target.value })} placeholder="Discord" />
              </Field>
              <Field label="URL">
                <Input value={link.url || ""} onChange={(e) => update(i, { url: e.target.value })} placeholder="https://…" />
              </Field>
              <Field label="Description">
                <Input value={link.description || ""} onChange={(e) => update(i, { description: e.target.value })} placeholder="Optional" />
              </Field>
            </div>
            {link.url && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--accent-muted)] hover:text-[var(--accent)]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Preview
              </a>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
