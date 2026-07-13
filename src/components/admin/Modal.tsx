"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
}

export function Modal({ open, onClose, title, description, children, footer, closeOnBackdrop = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ad-modal-backdrop"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ad-modal" role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined}>
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-6">
            <div className="min-w-0">
              {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
              {description && <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--text-dim)] transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children && <div className="p-6">{children}</div>}
        {footer && <div className="flex justify-end gap-3 border-t border-[var(--border)] p-6">{footer}</div>}
      </div>
    </div>
  );
}
