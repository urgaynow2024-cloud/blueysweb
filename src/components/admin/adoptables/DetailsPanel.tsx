"use client";

import type { Adoptable } from "@/types/database";
import { Field, Input, Textarea } from "@/components/admin/Field";

export interface DetailsPanelProps {
  value: Adoptable;
  onChange: (patch: Partial<Adoptable>) => void;
}

/**
 * Character and licensing details. These are free-text on the public page, so
 * every field here is a plain textarea rather than a structured editor.
 */
export function DetailsPanel({ value, onChange }: DetailsPanelProps) {
  return (
    <div className="space-y-5">
      <Field
        label="Species"
        htmlFor="adoptable-species"
        hint="Shown next to the name, e.g. “Fennec hybrid”."
      >
        <Input
          id="adoptable-species"
          value={value.species ?? ""}
          onChange={(event) => onChange({ species: event.target.value })}
          placeholder="e.g. Anthro fox"
          maxLength={120}
        />
      </Field>

      <Field
        label="Included items"
        htmlFor="adoptable-included"
        hint="One feature per line. Bullets and numbering are cleaned up automatically."
      >
        <Textarea
          id="adoptable-included"
          rows={7}
          value={value.included_items ?? ""}
          onChange={(event) => onChange({ included_items: event.target.value })}
          placeholder={
            "- Unity / VRChat avatar\n- 3 clothing toggles\n- Blender file\n- 2 base textures"
          }
        />
      </Field>

      <Field
        label="VRChat info"
        htmlFor="adoptable-vrchat"
        hint="Platform details such as performance rank, quest compatibility or build instructions."
      >
        <Textarea
          id="adoptable-vrchat"
          rows={6}
          value={value.vrchat_info ?? ""}
          onChange={(event) => onChange({ vrchat_info: event.target.value })}
          placeholder="Quest-compatible. Two shader options included."
        />
      </Field>

      <Field
        label="Rules &amp; licence"
        htmlFor="adoptable-licence"
        hint="Usage terms the buyer agrees to. Keep this explicit — it is the record of what was licensed."
      >
        <Textarea
          id="adoptable-licence"
          rows={7}
          value={value.rules_license ?? ""}
          onChange={(event) => onChange({ rules_license: event.target.value })}
          placeholder={
            "Personal use only. Redistribution or resale of the files is not permitted. Commissions derived from the base files must credit the original creator."
          }
        />
      </Field>
    </div>
  );
}