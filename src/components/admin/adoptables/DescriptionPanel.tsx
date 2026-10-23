"use client";

import { useState } from "react";
import { AlignLeft, Eye, PencilLine } from "lucide-react";
import { Textarea } from "@/components/admin/Field";

export interface DescriptionPanelProps {
  value: string;
  onChange: (next: string) => void;
}

const WRITE_HINT =
  "Plain text only. Line breaks are preserved exactly as typed on the public page.";

/**
 * Long-form description editor with a plain-text preview.
 *
 * The preview deliberately renders the raw string with `whitespace-pre-wrap`
 * instead of interpreting markdown or HTML: the public page shows the same
 * plain text, so the preview has to be the same plain text or the admin is
 * editing against a lie.
 */
export function DescriptionPanel({ value, onChange }: DescriptionPanelProps) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const characters = value.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Description view" className="inline-flex rounded-lg border border-[var(--border)] p-0.5">
          {(["write", "preview"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === option
                  ? "bg-[var(--accent)] text-[#0b1020]"
                  : "text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {option === "write" ? (
                <PencilLine className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Eye className="h-3.5 w-3.5" aria-hidden />
              )}
              {option === "write" ? "Write" : "Preview"}
            </button>
          ))}
        </div>

        <p className="text-xs text-[var(--text-dim)]" aria-live="polite">
          {characters.toLocaleString()} character{characters === 1 ? "" : "s"}
        </p>
      </div>

      {mode === "write" ? (
        <>
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={16}
            aria-label="Description"
            placeholder={
              "Tell visitors what they are adopting.\n\nWhat is included, what the files are, and anything they should know before claiming."
            }
            className="min-h-[22rem] leading-relaxed"
          />
          <p className="flex items-start gap-2 text-xs text-[var(--text-dim)]">
            <AlignLeft className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {WRITE_HINT}
          </p>
        </>
      ) : (
        <div className="min-h-[22rem] whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm leading-relaxed text-[var(--text)]">
          {value.trim().length === 0 ? (
            <p className="text-[var(--text-dim)]">Nothing to preview yet.</p>
          ) : (
            value
          )}
        </div>
      )}
    </div>
  );
}