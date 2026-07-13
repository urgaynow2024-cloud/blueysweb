"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Save, Eye, Menu, LogOut, ChevronDown, User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { useSave } from "./SaveProvider";

interface TopbarProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
  userName?: string;
}

export function AdminTopbar({ onToggleSidebar, onLogout, userName = "Admin" }: TopbarProps) {
  const { dirty, saving, saveAll } = useSave();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  return (
    <header className="ad-topbar sticky top-0 z-50 flex items-center gap-3 border-b border-[var(--border)] px-4 lg:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-white transition-colors hover:bg-white/10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#04060a] shadow-lg shadow-[var(--accent)]/20">
          <LayoutDashboard className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold leading-tight text-white">Admin Dashboard</h1>
          <SyncStatus dirty={dirty} saving={saving} />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="ad-btn ad-btn-secondary ad-btn-sm hidden sm:inline-flex"
        >
          <Eye className="h-4 w-4" />
          Preview Website
        </Link>

        <Button
          variant="primary"
          size="sm"
          onClick={saveAll}
          disabled={!dirty || saving}
          loading={saving}
          leftIcon={!saving && !dirty ? <Save className="h-4 w-4" /> : undefined}
        >
          {saving ? "Saving…" : dirty ? "Save Changes" : "Saved"}
        </Button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="User menu"
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-1 pr-2 transition-colors hover:bg-white/5"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-sm font-bold text-[#04060a]">
              B
            </span>
            <span className="hidden text-sm font-medium text-white md:inline">{userName}</span>
            <ChevronDown className="hidden h-4 w-4 text-[var(--text-dim)] md:inline" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-float)] p-1.5 shadow-[var(--shadow-lg)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
                <User className="h-4 w-4 text-[var(--text-dim)]" />
                <span className="truncate text-sm text-[var(--text-secondary)]">{userName}</span>
              </div>
              <div className="my-1 h-px bg-[var(--border)]" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SyncStatus({ dirty, saving }: { dirty: boolean; saving: boolean }) {
  if (saving) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving changes…
      </span>
    );
  }
  if (dirty) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--warning)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)] shadow-[0_0_8px_var(--warning)]" />
        Unsaved changes
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
      <CheckCircle2 className="h-3 w-3 text-[var(--success)]" />
      All changes saved
    </span>
  );
}
