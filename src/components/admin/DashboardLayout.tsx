"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { AdminTopbar } from "./AdminTopbar";
import { AdminSidebar } from "./AdminSidebar";
import { useSave } from "./SaveProvider";

interface DashboardLayoutProps {
  active: string;
  onSelect: (id: string) => void;
  onLogout: () => void;
  onReset: () => void;
  userName?: string;
  children: ReactNode;
}

export function DashboardLayout({ active, onSelect, onLogout, onReset, userName, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dirty } = useSave();

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className="admin-shell flex min-h-screen flex-col">
      <AdminTopbar onToggleSidebar={() => setSidebarOpen(true)} onLogout={onLogout} userName={userName} />

      <div className="admin-body">
        <aside className="hidden w-[280px] shrink-0 border-r border-[var(--border)] bg-[var(--bg-elevated)] lg:block">
          <div className="sticky top-[72px] h-[calc(100vh-72px)]">
            <AdminSidebar active={active} onSelect={onSelect} onLogout={onLogout} onReset={onReset} />
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[280px] border-r border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-3">
                <span className="px-2 text-sm font-semibold text-white">Menu</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close navigation"
                  className="grid h-9 w-9 place-items-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <AdminSidebar
                active={active}
                onSelect={(id) => {
                  onSelect(id);
                  setSidebarOpen(false);
                }}
                onLogout={() => {
                  setSidebarOpen(false);
                  onLogout();
                }}
                onReset={() => {
                  setSidebarOpen(false);
                  onReset();
                }}
              />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1100px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
