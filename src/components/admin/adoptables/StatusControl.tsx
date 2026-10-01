"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import {
  ADOPTABLE_STATUSES,
  ADOPTABLE_STATUS_META,
  normalizeStatus,
  type AdoptableStatus,
} from "@/lib/adoptables/status";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/admin/Button";

interface StatusControlProps {
  value: unknown;
  onChange: (status: AdoptableStatus) => void | Promise<void>;
  /** Adoptable name, used in the SOLD confirmation copy. */
  name: string;
  busy?: boolean;
  disabled?: boolean;
  variant?: "button" | "select";
  align?: "left" | "right";
  className?: string;
}

/**
 * Quick lifecycle control.
 *
 * Choosing SOLD asks for confirmation first and explains exactly what happens:
 * the adoptable keeps all of its media, description, pricing and character
 * details, stays in the admin panel and the public portfolio, and only loses
 * its purchase button. Choosing any other status applies immediately.
 */
export function StatusControl({
  value,
  onChange,
  name,
  busy = false,
  disabled = false,
  variant = "button",
  align = "left",
  className = "",
}: StatusControlProps) {
  const current = normalizeStatus(value);
  const meta = ADOPTABLE_STATUS_META[current];
  const [open, setOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AdoptableStatus | null>(null);
  const [confirming, setConfirming] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const request = (status: AdoptableStatus) => {
    setOpen(false);
    if (status === current) return;
    if (status === "sold") {
      setPendingStatus(status);
      setConfirming(true);
      return;
    }
    void onChange(status);
  };

  const confirmSold = async () => {
    setConfirming(false);
    if (pendingStatus) await onChange(pendingStatus);
    setPendingStatus(null);
  };

  if (variant === "select") {
    return (
      <select
        className={`field appearance-none bg-[var(--bg-elevated)] ${className}`}
        value={current}
        disabled={disabled || busy}
        onChange={(event) => request(event.target.value as AdoptableStatus)}
        aria-label={`Status for ${name}`}
      >
        {ADOPTABLE_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ADOPTABLE_STATUS_META[status].title}
          </option>
        ))}
      </select>
    );
  }

  return (
    <>
      <div ref={rootRef} className={`relative ${className}`}>
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Status for ${name}: ${meta.title}. Change status`}
          className={`ad-status-trigger ${meta.text} ${meta.bg} ${meta.border} ${
            disabled || busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden />
          )}
          <span className="tracking-wider">{meta.label}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>

        {open && (
          <div
            role="listbox"
            aria-label="Choose a status"
            className={`ad-status-menu absolute z-40 mt-1.5 w-72 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/60 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {ADOPTABLE_STATUSES.map((status) => {
              const option = ADOPTABLE_STATUS_META[status];
              const isCurrent = status === current;
              return (
                <button
                  key={status}
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => request(status)}
                  className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${option.dot}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={`text-xs font-bold tracking-wider ${option.text}`}>
                        {option.label}
                      </span>
                      {isCurrent && <Check className="h-3 w-3 text-[var(--accent)]" aria-hidden />}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[var(--text-secondary)]">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={confirming}
        onClose={() => {
          setConfirming(false);
          setPendingStatus(null);
        }}
        title={`Mark "${name || "this adoptable"}" as sold?`}
        description="This changes the public listing only. Nothing is deleted."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirming(false);
                setPendingStatus(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmSold} leftIcon={<Check className="h-4 w-4" />}>
              Mark as Sold
            </Button>
          </>
        }
      >
        <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
          {[
            "Removes the purchase and claim buttons from the public site",
            "Shows a SOLD badge and a 'no longer available' notice publicly",
            "Keeps the adoptable in your portfolio and admin panel",
            "Preserves all images, description, pricing and character details",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-[var(--text-dim)]">
          Changing the status back to Available restores the adoptable automatically.
        </p>
      </Modal>
    </>
  );
}
