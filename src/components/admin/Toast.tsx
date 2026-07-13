"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  leaving: boolean;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-[18px] w-[18px]" />,
  error: <XCircle className="h-[18px] w-[18px]" />,
  info: <Info className="h-[18px] w-[18px]" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const push = useCallback(
    (message: string, type: ToastType) => {
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, type, message, leaving: false }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const api: ToastApi = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="ad-toast-region" role="region" aria-live="polite" aria-label="Notifications">
        {items.map((t) => (
          <div key={t.id} className={`ad-toast ${t.leaving ? "leaving" : ""}`} role="status">
            <span className={`ad-toast-icon ad-toast-${t.type}`}>{ICONS[t.type]}</span>
            <p className="flex-1 text-sm leading-snug text-[var(--text)]">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[var(--text-dim)] transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
