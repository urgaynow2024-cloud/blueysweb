"use client";

import Link from "next/link";
import { CircleCheck, CalendarClock } from "lucide-react";
import { useCommissionStatus } from "@/lib/commission-status";

export default function CommissionAvailability() {
  const state = useCommissionStatus();
  const { label, desc, dot, border, bg, text, slotsTotal, slotsUsed, slotsAvailable, note, loading } = state;

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8">
        <div className="pointer-events-none absolute -top-16 -right-16 h-[200px] w-[200px] rounded-full bg-[var(--accent-cosmic)] opacity-[0.05] blur-[80px]" />
        <div className="mb-4 h-6 w-1/3 rounded bg-[var(--bg)]" />
        <div className="h-4 w-1/2 rounded bg-[var(--bg)]" />
      </div>
    );
  }

  const progressPercent = slotsTotal > 0 ? (slotsUsed / slotsTotal) * 100 : 0;

  return (
    <div className={`relative overflow-hidden rounded-[var(--r-lg)] border ${border} ${bg} p-5 md:p-7`}>
      <div className="pointer-events-none absolute -top-20 -right-20 h-[250px] w-[250px] rounded-full bg-[var(--accent-cosmic)] opacity-[0.05] blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-[200px] w-[200px] rounded-full bg-[var(--accent-nebula)] opacity-[0.04] blur-[80px]" />
      <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 animate-pulse rounded-full ${dot}`} />
          <div>
            <h3 className={`text-lg font-bold ${text}`}>{label}</h3>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{desc}</p>
          </div>
        </div>

        <div className="flex-1 md:text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">Available Slots</p>
          <p className="text-2xl font-bold text-white">
            {slotsAvailable} <span className="text-sm text-[var(--text-dim)]">/ {slotsTotal}</span>
          </p>
          <div className="mx-auto mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--bg)]">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-700" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="flex shrink-0">
          <Link href="/commission" className="btn-primary !py-2.5 !px-5 !text-sm inline-flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Request Commission
          </Link>
        </div>
      </div>

      {note && (
        <div className="relative mt-6 pt-4">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
          <p className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
            <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
            {note}
          </p>
        </div>
      )}
    </div>
  );
}
