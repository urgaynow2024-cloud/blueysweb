"use client";

import { useState, useEffect } from "react";

const STATUS_CONFIG: Record<string, { label: string; color: string; border: string; bg: string; text: string; desc: string }> = {
  open: {
    label: "Open",
    color: "bg-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    desc: "Currently accepting new commissions.",
  },
  limited: {
    label: "Limited Slots",
    color: "bg-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    desc: "Only a few commission slots are currently available.",
  },
  closed: {
    label: "Closed",
    color: "bg-red-400",
    border: "border-red-500/40",
    bg: "bg-red-500/10",
    text: "text-red-400",
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
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)] animate-pulse">
        <div className="h-6 bg-[var(--bg)] rounded w-1/3 mb-4" />
        <div className="h-4 bg-[var(--bg)] rounded w-1/2" />
      </div>
    );
  }

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const slotsAvailable = Math.max(0, slotsTotal - slotsUsed);
  const progressPercent = slotsTotal > 0 ? (slotsUsed / slotsTotal) * 100 : 0;

  return (
    <div className={`rounded-xl p-4 md:p-6 border ${config.border} ${config.bg}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Status */}
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${config.color} animate-pulse`} />
          <div>
            <h3 className={`text-lg font-bold ${config.text}`}>{config.label}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{config.desc}</p>
          </div>
        </div>

        {/* Slots */}
        <div className="flex-1 md:text-center">
          <p className="text-[10px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-0.5">Available Slots</p>
          <p className="text-2xl font-bold text-white">
            {slotsAvailable} <span className="text-sm text-[var(--text-dim)]">/ {slotsTotal}</span>
          </p>
          <div className="w-full md:max-w-xs mx-auto bg-[var(--bg)] rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-[var(--accent)] text-[#05070a] px-4 py-2 rounded-lg font-bold text-xs hover:bg-[var(--accent-4)] transition-all shadow-lg shadow-[var(--accent)]/20"
          >
            Request Commission
          </a>
        </div>
      </div>

      {/* Optional note */}
      {note && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{note}</p>
        </div>
      )}
    </div>
  );
}
