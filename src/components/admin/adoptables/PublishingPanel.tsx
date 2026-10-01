"use client";

import { useRef } from "react";
import { Eye, EyeOff, Info } from "lucide-react";
import type { Adoptable, AdoptableStatus } from "@/types/database";
import { ADOPTABLE_STATUS_META, normalizeStatus } from "@/lib/adoptables/status";
import { Field, Select } from "@/components/admin/Field";
import { StatusControl } from "./StatusControl";
import { ToggleSwitch } from "./OverviewPanel";

export interface PublishingPanelProps {
  value: Adoptable;
  onChange: (patch: Partial<Adoptable>) => void;
  status: AdoptableStatus;
  onStatusChange: (status: AdoptableStatus) => void;
  statusBusy: boolean;
}

/**
 * Publishing controls.
 *
 * `visible` is a server-side mirror of the status, so it is never written
 * directly: publishing and visibility are two views of one value. The last
 * non-hidden status is remembered while the drawer is open so returning a
 * hidden adoptable to the public site restores "Sold" rather than silently
 * promoting it back to "Available". A drawer opened straight onto a hidden
 * adoptable has no memory of the previous stage, so it falls back to
 * "Available".
 */
export function PublishingPanel({
  value,
  onChange,
  status,
  onStatusChange,
  statusBusy,
}: PublishingPanelProps) {
  const current = normalizeStatus(status);
  const isPublic = current !== "hidden";
  const remembered = useRef<AdoptableStatus>(isPublic ? current : "available");

  if (isPublic) remembered.current = current;

  const changeStatus = (next: AdoptableStatus) => {
    if (next !== "hidden") remembered.current = next;
    onStatusChange(next);
  };

  const setPublished = (next: boolean) => {
    changeStatus(next ? remembered.current : "hidden");
  };

  return (
    <div className="space-y-5">
      <ToggleSwitch
        checked={isPublic}
        onChange={setPublished}
        disabled={statusBusy}
        label="Published"
        hint="On shows this adoptable on the public site. Off keeps every file and detail but removes the listing entirely."
      />

      <ToggleSwitch
        checked={Boolean(value.featured)}
        onChange={(next) => onChange({ featured: next })}
        label="Featured"
        hint="Featured adoptables are promoted in the public listing. Saved with the rest of this tab."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Visibility"
          htmlFor="adoptable-visibility"
          hint="Derived from the status so the two can never disagree."
        >
          <Select
            id="adoptable-visibility"
            value={isPublic ? "public" : "hidden"}
            disabled={statusBusy}
            onChange={(event) => setPublished(event.target.value === "public")}
          >
            <option value="public">Public</option>
            <option value="hidden">Hidden</option>
          </Select>
        </Field>

        <Field label="Status" hint="Changing status applies immediately." className="min-w-0">
          <StatusControl
            value={current}
            onChange={changeStatus}
            name={value.title?.trim() || "Untitled adoptable"}
            busy={statusBusy}
            className="max-w-full"
          />
        </Field>
      </div>

      <div
        className={`rounded-xl border p-4 text-sm ${
          isPublic
            ? "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-100"
            : "border-slate-500/30 bg-slate-500/[0.08] text-slate-200"
        }`}
      >
        <p className="flex items-center gap-2 font-semibold">
          {isPublic ? (
            <Eye className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {isPublic ? "Visible on the public site" : "Hidden from the public site"}
        </p>
        <p className="mt-1.5 leading-snug text-[var(--text-secondary)]">
          {isPublic
            ? `This adoptable is listed publicly and currently shows as ${ADOPTABLE_STATUS_META[current].title.toLowerCase()}.`
            : "The record stays in the admin panel with its images, description, pricing and gallery intact. It is removed from the public site and can be brought back at any time."}
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-xs leading-snug text-[var(--text-dim)]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
        <span>
          Status and visibility are saved immediately rather than with the rest of this tab, so a
          half-finished edit can never leave a listing in the wrong state. Featured is part of the
          draft and is written by Save changes.
        </span>
      </p>
    </div>
  );
}