"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";

interface Props {
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export function SiteInfoSection({ value, onChange }: Props) {
  function update(key: string, v: any) {
    onChange({ ...value, [key]: v });
  }

  return (
    <Card className="p-8">
      <CardHeader title="Site Information" description="Branding and copy used across the public site." />
      <div className="mt-6 space-y-5">
        <Field label="Site Name">
          <Input value={value.name || ""} onChange={(e) => update("name", e.target.value)} />
        </Field>
        <Field label="Tagline">
          <Input value={value.tagline || ""} onChange={(e) => update("tagline", e.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea rows={3} value={value.description || ""} onChange={(e) => update("description", e.target.value)} />
        </Field>
        <Field label="Discord">
          <Input value={value.discord || ""} onChange={(e) => update("discord", e.target.value)} />
        </Field>
      </div>
    </Card>
  );
}
