"use client";

import { Card, CardHeader } from "../Card";
import { Field, Input } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

export function WebsiteSettingsSection({ value, onChange }: Props) {
  function update(key: string, v: string) {
    onChange({ ...value, [key]: v });
  }

  const fields = [
    { key: "name", label: "Website Name" },
    { key: "tagline", label: "Tagline" },
    { key: "description", label: "Description" },
    { key: "discord", label: "Discord Username" },
    { key: "discord_url", label: "Discord URL" },
    { key: "contact_email", label: "Contact Email" },
    { key: "contact_phone", label: "Contact Phone" },
    { key: "commission_status", label: "Commission Status" },
    { key: "queue_status", label: "Queue Status" },
    { key: "announcement", label: "Announcement Banner" },
    { key: "logo_url", label: "Logo URL" },
    { key: "favicon_url", label: "Favicon URL" },
    { key: "theme_primary", label: "Theme Primary Colour" },
    { key: "theme_accent", label: "Theme Accent Colour" },
  ];

  return (
    <Card className="p-8">
      <CardHeader title="Website Settings" description="Global site settings managed from the admin panel." />
      <div className="mt-6 space-y-5">
        {fields.map((f) => (
          <Field key={f.key} label={f.label}>
            <Input value={value[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} />
          </Field>
        ))}
      </div>
    </Card>
  );
}