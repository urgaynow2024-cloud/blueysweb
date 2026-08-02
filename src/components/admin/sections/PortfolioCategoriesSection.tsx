"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

export function PortfolioCategoriesSection({ value, onChange }: Props) {
  function update(i: number, patch: Record<string, any>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }
  function add() {
    onChange([...value, { id: undefined, name: "" }]);
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="Portfolio Categories"
        description="Categories used to filter portfolio items."
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Category
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((cat, i) => (
          <div key={cat.id || i} className="ad-panel ad-panel-hover p-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Category {i + 1}</h3>
            <Button size="sm" variant="ghost" onClick={() => remove(i)} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
              Remove
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}