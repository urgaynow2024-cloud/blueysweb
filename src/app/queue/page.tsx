"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  limited: { label: "Limited Slots", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  closed: { label: "Closed", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  hold: { label: "On Hold", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
};

const STAGES = ["Request Received", "Planning", "Blender Work", "Unity Setup", "Testing", "Final Delivery"];

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] animate-pulse">
      <div className="w-full bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" style={{ height: "120px" }} />
    </div>
  );
}

export default function QueuePage() {
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      const [itemsRes, configRes] = await Promise.all([
        supabase.from("queue_items").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
        supabase.from("site_config").select("key, value").in("key", ["queue_status", "queue_slots_total", "queue_slots_used", "queue_wait_time", "queue_notes", "queue_last_updated"]),
      ]);

      if (itemsRes.data) setQueueItems(itemsRes.data);
      if (configRes.data) {
        const cfg: Record<string, string> = {};
        configRes.data.forEach((row: any) => { cfg[row.key] = row.value; });
        setConfig(cfg);
      }
    } catch (e) {
      console.error("Failed to load queue:", e);
    } finally {
      setLoading(false);
    }
  }

  const status = STATUS_CONFIG[config.queue_status || "open"] || STATUS_CONFIG.open;
  const slotsTotal = parseInt(config.queue_slots_total || "8", 10);
  const slotsUsed = parseInt(config.queue_slots_used || "0", 10);
  const slotsAvailable = slotsTotal - slotsUsed;

  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 page-head">
            <span className="section-label justify-center">Commission Status</span>
            <h2 className="display-lg text-white mb-3">Commission Queue</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
              See current availability and active commission progress.
            </p>
          </div>

          {/* Status & Slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="md:col-span-2 bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-current animate-pulse" style={{ color: status.color.replace("text-", "") }} />
                <h3 className="text-lg font-bold text-white">Current Status</h3>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${status.bg} mb-4`}>
                <span className={`text-sm font-bold ${status.color}`}>{status.label}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {config.queue_status === "open" && "I'm currently accepting new commissions."}
                {config.queue_status === "limited" && "I have limited slots available. Commission requests may be slower."}
                {config.queue_status === "closed" && "I'm not accepting new commissions at this time."}
                {config.queue_status === "hold" && "Commission queue is on hold. Please check back later."}
              </p>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)] flex flex-col justify-center">
              <h3 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2">Available Slots</h3>
              <p className="text-4xl font-bold text-white mb-1">
                {slotsAvailable} <span className="text-lg text-[var(--text-dim)]">/ {slotsTotal}</span>
              </p>
              <p className="text-xs text-[var(--text-dim)]">
                {slotsAvailable > 0 ? "Open for requests" : "No slots available"}
              </p>
              <div className="w-full bg-[var(--bg)] rounded-full h-2 mt-4 overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, ((slotsTotal - slotsAvailable) / slotsTotal) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Wait Time & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {config.queue_wait_time && (
              <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2">Estimated Wait Time</h3>
                <p className="text-2xl font-bold text-white">{config.queue_wait_time}</p>
              </div>
            )}
            {config.queue_notes && (
              <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2">Queue Notes</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{config.queue_notes}</p>
              </div>
            )}
          </div>

          {/* Current Queue */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-white mb-6">Current Queue</h3>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : queueItems.length > 0 ? (
              <div className="space-y-4">
                {queueItems.map((item, i) => (
                  <div key={item.id || i} className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-bold text-[var(--text-dim)]">#{i + 1}</span>
                          <h4 className="text-base font-bold text-white">{item.title}</h4>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">{item.stage}</p>
                      </div>
                      {item.estimated_completion && (
                        <span className="text-xs text-[var(--text-dim)] bg-[var(--bg)] px-3 py-1 rounded-lg">
                          ~{item.estimated_completion}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-[var(--bg)] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(0, item.progress || 0))}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-[var(--text-dim)]">{item.progress || 0}% complete</span>
                      <span className="text-xs text-[var(--text-secondary)]">{item.status === "active" ? "In Progress" : item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[var(--text-dim)]">No active commissions in the queue.</p>
              </div>
            )}
          </div>

          {/* Last Updated */}
          {config.queue_last_updated && (
            <div className="text-center">
              <p className="text-xs text-[var(--text-dim)]">
                Last Updated: {new Date(config.queue_last_updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
