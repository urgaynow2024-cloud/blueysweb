"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function CommissionFormSection({ value, onChange }: Props) {
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
      { id: undefined, name: "", label: "", placeholder: "", type: "text", required: false, options: [], max_size_mb: 10 },
    ]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Commission Form Fields"
        description="Configure the commission request form fields."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Field
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((field, i) => (
          <div key={field.id || i} className="ad-panel ad-panel-hover p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Field {i + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                Remove
              </Button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Name">
                <Input value={field.name} onChange={(e) => update(i, { name: e.target.value })} />
              </Field>
              <Field label="Label">
                <Input value={field.label} onChange={(e) => update(i, { label: e.target.value })} />
              </Field>
              <Field label="Placeholder">
                <Input value={field.placeholder} onChange={(e) => update(i, { placeholder: e.target.value })} />
              </Field>
              <Field label="Type">
                <select
                  value={field.type}
                  onChange={(e) => update(i, { type: e.target.value })}
                  className="ad-field rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                  <option value="number">Number</option>
                  <option value="select">Select</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="file">File Upload</option>
                </select>
              </Field>
              <Field label="Max Size (MB)">
                <Input type="number" value={field.max_size_mb} onChange={(e) => update(i, { max_size_mb: Number(e.target.value) })} />
              </Field>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={!!field.required}
                    onChange={(e) => update(i, { required: e.target.checked })}
                    className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  Required
                </label>
              </div>
              <Field label="Options (one per line, for select/checkbox)">
                <Textarea rows={3} value={(field.options || []).join("\n")} onChange={(e) => update(i, { options: e.target.value.split("\n").filter(Boolean) })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}