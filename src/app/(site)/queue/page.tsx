"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Reveal from "@/components/ui/Reveal";
import { Clock, StickyNote, Inbox, Sparkles } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; border: string; dot: string }> = {
  open: {
    label: "Open",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  limited: {
    label: "Limited Slots",
    color: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  closed: {
    label: "Closed",
    color: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
  hold: {
    label: "On Hold",
    color: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
};

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] animate-pulse">
      <div className="h-[120px] w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
    </div>
  );
}

function clampPct(v: number) {
  return Math.min(100, Math.max(0, v));
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
  const slotsAvailable = Math.max(0, slotsTotal - slotsUsed);

  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.05] blur-[130px] orb-slow" />

        <div className="container">
          <div className="text-center">
            <span className="eyebrow justify-center">
              <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
              Commission Status
            </span>
            <h1 className="display-xl mt-5 text-white">
              ✦ Commission <span className="text-gradient-animated">Queue</span>
            </h1>
            <p className="lead mx-auto mt-4 max-w-xl">
              See current availability and active commission progress.
            </p>
          </div>

          {/* Status & Slots */}
          <div className="my-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
            <Reveal>
              <div className={`relative overflow-hidden rounded-[var(--r-lg)] border ${status.border} p-6 md:p-8`}>
                <div className="pointer-events-none absolute -top-20 -right-20 h-[250px] w-[250px] rounded-full bg-[var(--accent-cosmic)] opacity-[0.05] blur-[80px]" />
                <div className="relative flex flex-col items-start gap-5">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 animate-pulse rounded-full ${status.dot}`} />
                    <h3 className={`text-lg font-bold ${status.color}`}>{status.label}</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {config.queue_status === "open" && "I'm currently accepting new commissions."}
                    {config.queue_status === "limited" && "I have limited slots available. Commission requests may be slower."}
                    {config.queue_status === "closed" && "I'm not accepting new commissions at this time."}
                    {config.queue_status === "hold" && "Commission queue is on hold. Please check back later."}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80} className="flex flex-col justify-center">
              <div className="h-full border-b border-[var(--border)] pb-8 md:border-b-0 md:pb-0">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">Available Slots</h3>
                <p className="mb-1 text-4xl font-bold text-white">
                  {slotsAvailable} <span className="text-lg text-[var(--text-dim)]">/ {slotsTotal}</span>
                </p>
                <p className="text-xs text-[var(--text-dim)]">{slotsAvailable > 0 ? "Open for requests" : "No slots available"}</p>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg)]">
                  <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-700" style={{ width: `${clampPct(((slotsTotal - slotsAvailable) / slotsTotal) * 100)}%` }} />
                </div>
              </div>
            </Reveal>
          </div>

          {/* Wait Time & Notes */}
          <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-2">
            {config.queue_wait_time && (
              <Reveal>
                <div className="h-full border-b border-[var(--border)] pb-8 md:border-b-0 md:pb-0">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    <Clock className="h-4 w-4 text-[var(--accent)]" />
                    Estimated Wait Time
                  </h3>
                  <p className="text-2xl font-bold text-white">{config.queue_wait_time}</p>
                </div>
              </Reveal>
            )}
            {config.queue_notes && (
              <Reveal delay={60}>
                <div className="h-full">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    <StickyNote className="h-4 w-4 text-[var(--accent)]" />
                    Queue Notes
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{config.queue_notes}</p>
                </div>
              </Reveal>
            )}
          </div>

          {/* Current Queue */}
          <div className="mb-8">
            <h3 className="heading-md text-white">Current Queue</h3>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : queueItems.length > 0 ? (
            <div className="space-y-0">
              {queueItems.map((item, i) => (
                <Reveal key={item.id || i} delay={(i % 4) * 50}>
                  <div className={`py-6 ${i < queueItems.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-3">
                          <span className="text-xs font-bold text-[var(--text-dim)]">#{i + 1}</span>
                          <h4 className="text-base font-bold text-white">{item.title}</h4>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">{item.stage}</p>
                      </div>
                      {item.estimated_completion && (
                        <span className="rounded-lg bg-[var(--bg)] px-3 py-1 text-xs text-[var(--text-dim)]">~{item.estimated_completion}</span>
                      )}
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg)]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-4)] transition-all duration-700" style={{ width: `${clampPct(item.progress || 0)}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-xs text-[var(--text-dim)]">{item.progress || 0}% complete</span>
                      <span className="text-xs text-[var(--text-secondary)]">{item.status === "active" ? "In Progress" : item.status}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-[var(--text-dim)]">No active commissions in the queue.</p>
            </div>
          )}

          {config.queue_last_updated && (
            <div className="mt-10 text-center">
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
