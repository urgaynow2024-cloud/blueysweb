"use client";

import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Field";

export interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  title: ReactNode;
  description?: ReactNode;
  /** Extra explanation rendered above the footer. */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  /**
   * When set, the user must type this exact text (case-insensitive, trimmed)
   * before the confirm button becomes enabled. Use for permanent deletion.
   */
  requireTypedText?: string;
  /** Optional async work; shows a loading state and must not double-fire. */
  busy?: boolean;
}

/**
 * Confirmation dialog with an optional typed gate.
 *
 * `window.confirm` cannot explain the consequence of an action, which is
 * exactly what an admin needs to read before a permanent delete, so this renders
 * real markup: the danger is spelled out, irreversible actions additionally
 * require typing a specific phrase, and the default is the danger styling
 * because that is what this dialog is overwhelmingly used for.
 */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  requireTypedText,
  busy = false,
}: ConfirmDialogProps): ReactElement | null {
  const [typed, setTyped] = useState("");
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const inputRef = useRef<HTMLInputElement>(null);
  // Guards against a second click landing between the click and the parent
  // setting `busy`, which would start the destructive work twice.
  const inFlight = useRef(false);

  const required = (requireTypedText ?? "").trim();
  const needsTyping = required.length > 0;
  const typedOk = !needsTyping || typed.trim().toLowerCase() === required.toLowerCase();

  useEffect(() => {
    if (!open) {
      setTyped("");
      inFlight.current = false;
      return;
    }
    inFlight.current = false;
    if (!needsTyping) return;
    const raf = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(raf);
  }, [open, needsTyping, requireTypedText]);

  if (!open) return null;

  const cancel = () => {
    if (busy) return;
    onCancel();
  };

  const confirm = () => {
    if (busy || inFlight.current || !typedOk) return;
    inFlight.current = true;
    void onConfirm();
  };

  return (
    <Modal
      open={open}
      onClose={cancel}
      closeOnBackdrop={!busy}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={cancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={confirm}
            loading={busy}
            disabled={!typedOk}
            leftIcon={variant === "danger" ? <TriangleAlert className="h-4 w-4" /> : undefined}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {children}

        {needsTyping && (
          <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3.5">
            <label htmlFor={inputId} className="block text-sm font-medium text-white">
              Type <span className="font-mono font-bold text-[var(--danger)]">{required}</span> to
              confirm
            </label>
            <Input
              ref={inputRef}
              id={inputId}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={required}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={busy}
              className="mt-2"
              aria-describedby={hintId}
            />
            <p id={hintId} className="mt-2 text-xs text-[var(--text-secondary)]">
              This action cannot be undone once it runs.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}