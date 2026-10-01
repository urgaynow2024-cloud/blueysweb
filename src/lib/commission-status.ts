"use client";

import { useEffect, useState } from "react";

/**
 * Single source of truth for commission availability.
 *
 * Previously the Hero rendered a hardcoded "Commissions Open" badge while the
 * availability panel read `queue_status` from the database. The two could
 * disagree, and they did: the queue was configured as "limited" while the Hero
 * still claimed "Open".
 *
 * Everything now derives from the same `site_config` queue keys managed by the
 * admin Queue section, so there is exactly one system.
 */

export type CommissionState = {
  status: string;
  label: string;
  text: string;
  border: string;
  bg: string;
  dot: string;
  desc: string;
  slotsTotal: number;
  slotsUsed: number;
  slotsAvailable: number;
  note: string;
  loading: boolean;
  error: boolean;
};

const STATUS_CONFIG: Record<string, Omit<CommissionState, "slotsTotal" | "slotsUsed" | "slotsAvailable" | "note" | "loading" | "error">> = {
  open: {
    status: "open",
    label: "Open",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
    desc: "Currently accepting new commissions.",
  },
  limited: {
    status: "limited",
    label: "Limited Slots",
    text: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
    desc: "Only a few commission slots are currently available.",
  },
  closed: {
    status: "closed",
    label: "Closed",
    text: "text-red-400",
    border: "border-red-500/40",
    bg: "bg-red-500/10",
    dot: "bg-red-400",
    desc: "Not accepting new commissions at this time.",
  },
};

export function useCommissionStatus(): CommissionState {
  const [status, setStatus] = useState("open");
  const [slotsTotal, setSlotsTotal] = useState(0);
  const [slotsUsed, setSlotsUsed] = useState(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/queue/config");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setStatus(data.queue_status || "open");
        setSlotsTotal(parseInt(data.queue_slots_total || "0", 10) || 0);
        setSlotsUsed(parseInt(data.queue_slots_used || "0", 10) || 0);
        setNote(data.queue_notes || "");
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  const slotsAvailable = Math.max(0, slotsTotal - slotsUsed);

  return {
    ...config,
    status: config.status,
    slotsTotal,
    slotsUsed,
    slotsAvailable,
    note,
    loading,
    error,
  };
}