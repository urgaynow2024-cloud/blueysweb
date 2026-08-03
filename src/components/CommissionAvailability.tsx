"use client";

import { useState, useEffect } from "react";
import { CircleCheck, CalendarClock } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; text: string; border: string; bg: string; dot: string; desc: string }> = {
  open: {
    label: "Open",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
    desc: "Currently accepting new commissions.",
  },
  limited: {
    label: "Limited Slots",
    text: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
    desc: "Only a few commission slots are currently available.",
  },
  closed: {
    label: "Closed",
    text: "text-red-400",
    border: "border-red-500/40",
    bg: "bg-red-500/10",
    dot: "bg-red-400",
    desc: "Not accepting new commissions at this time.",
  },
};

export default function CommissionAvailability() {
  const [status, setStatus] = useState("open");
  const [slotsTotal, setSlotsTotal] = useState(6);
  const [slotsUsed, setSlotsUsed] = useState(3);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/queue/config");
        if (res.ok) {
          const data = await res.json();
          setStatus(data.queue_status || "open");
          setSlotsTotal(parseInt(data.queue_slots_total || "6", 10));
          setSlotsUsed(parseInt(data.queue_slots_used || "0", 10));
          setNote(data.queue_notes || "");
        }
      } catch (e) {
        console.error("Failed to load availability:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8">
        <div className="mb-4 h-6 w-1/3 rounded bg-[var(--bg)]" />
        <div className="h-4 w-1/2 rounded bg-[var(--bg)]" />
      </div>
    );
  }

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const slotsAvailable = Math.max(0, slotsTotal - slotsUsed);
  const progressPercent = slotsTotal > 0 ? (slotsUsed / slotsTotal) * 100 : 0;

  return (
    <div className={`rounded-[var(--r-lg)] border ${config.border} ${config.bg} p-5 md:p-7`}>
      <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 animate-pulse rounded-full ${config.dot}`} />
          <div>
            <h3 className={`text-lg font-bold ${config.text}`}>{config.label}</h3>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{config.desc}</p>
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
          <a href="/contact" className="btn-primary !py-2.5 !px-5 !text-sm inline-flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Request Commission
          </a>
        </div>
      </div>

      {note && (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <p className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
            <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
            {note}
          </p>
        </div>
      )}
    </div>
  );
}
