"use client";

import { Star } from "lucide-react";
import type { Adoptable, AdoptableStatus } from "@/types/database";
import { ADOPTABLE_CATEGORIES, normalizeCategory } from "@/lib/adoptables/catalog";
import { Field, Input, Select } from "@/components/admin/Field";
import { StatusControl } from "./StatusControl";

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}

/** ON/OFF switch shared by the Overview and Publishing tabs. */
export function ToggleSwitch({ checked, onChange, label, hint, disabled }: ToggleSwitchProps) {
  const hintId = hint ? `${label.replace(/\s+/g, "-").toLowerCase()}-hint` : undefined;

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {hint && (
          <p id={hintId} className="mt-0.5 text-xs leading-snug text-[var(--text-dim)]">
            {hint}
          </p>
        )}
      </div>
      <label className="relative shrink-0 cursor-pointer">
        <input
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          aria-checked={checked}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span
          aria-hidden
          className="block h-6 w-11 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] transition-colors peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-disabled:opacity-50"
        >
          <span className="block h-4 w-4 translate-y-[3px] rounded-full bg-white/70 transition-transform peer-checked:translate-x-[22px]" />
        </span>
        <span className="sr-only">{checked ? "On" : "Off"}</span>
      </label>
    </div>
  );
}

export interface OverviewPanelProps {
  value: Adoptable;
  onChange: (patch: Partial<Adoptable>) => void;
  /** Status is persisted immediately by the controller, not by the draft save. */
  onStatusChange: (status: AdoptableStatus) => void;
  status: AdoptableStatus;
  statusBusy: boolean;
  /** Jumps to the tab that owns the description field. */
  onEditDescription: () => void;
}

export function OverviewPanel({
  value,
  onChange,
  onStatusChange,
  status,
  statusBusy,
  onEditDescription,
}: OverviewPanelProps) {
  const name = value.title?.trim() || "Untitled adoptable";

  return (
    <div className="space-y-5">
      <Field
        label="Name"
        htmlFor="adoptable-title"
        hint="Shown as the heading on the public page and in the admin card."
      >
        <Input
          id="adoptable-title"
          value={value.title ?? ""}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="e.g. Lyra — Starbound Companion"
          maxLength={120}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" htmlFor="adoptable-category" hint="Groups the adoptable on the public page.">
          <Select
            id="adoptable-category"
            value={normalizeCategory(value.category)}
            onChange={(event) => onChange({ category: event.target.value })}
          >
            {ADOPTABLE_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Status"
          hint="Applies immediately and is confirmed separately when set to Sold."
          className="min-w-0"
        >
          <StatusControl
            value={status}
            onChange={onStatusChange}
            name={name}
            busy={statusBusy}
            className="max-w-full"
          />
        </Field>
      </div>

      <ToggleSwitch
        checked={Boolean(value.featured)}
        onChange={(next) => onChange({ featured: next })}
        label="Featured"
        hint="Featured adoptables are surfaced at the top of the public site. Saved with the rest of this tab."
      />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3.5">
        <p className="text-sm font-medium text-white">Short description</p>
        {value.description ? (
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            {value.description}
          </p>
        ) : (
          <p className="mt-1.5 text-sm italic text-[var(--text-dim)]">
            No description yet — visitors see this on the card and at the top of the detail page.
          </p>
        )}
        <p className="mt-2 text-xs leading-snug text-[var(--text-dim)]">
          The full copy is edited in the{" "}
          <button
            type="button"
            onClick={onEditDescription}
            className="font-semibold text-[var(--accent)] underline underline-offset-2"
          >
            Description tab
          </button>
          . It is previewed here rather than duplicated, so the two can never disagree.
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-[var(--text-dim)]">
        <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-star)]" aria-hidden />
        <span>
          Name, category and featured are part of this draft. Status is a lifecycle flag and is
          saved on its own so it can never be lost with an unrelated edit.
        </span>
      </p>
    </div>
  );
}