"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, CheckCircle2, Loader2 } from "lucide-react";

interface QueueItem {
  id?: string;
  title: string;
  stage: string;
  progress: number;
  estimated_completion: string;
  status: string;
}

const STATUS_OPTIONS = ["open", "limited", "closed", "hold"];
const STAGE_OPTIONS = ["Request Received", "Planning", "Blender Work", "Unity Setup", "Testing", "Final Delivery"];

export default function QueueAdmin() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState({
    queue_status: "open",
    queue_slots_total: "8",
    queue_slots_used: "0",
    queue_wait_time: "2-3 weeks",
    queue_notes: "",
    queue_last_updated: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [queueRes, configRes] = await Promise.all([
        fetch("/api/queue"),
        fetch("/api/queue/config"),
      ]);

      if (queueRes.ok) {
        const queueData = await queueRes.json();
        setItems(queueData.map((item: any) => ({
          id: item.id,
          title: item.title,
          stage: item.stage,
          progress: item.progress || 0,
          estimated_completion: item.estimated_completion || "",
          status: item.status || "active",
        })));
      }

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(prev => ({ ...prev, ...configData }));
      }
    } catch (e) {
      setError("Failed to load queue data");
    } finally {
      setLoading(false);
    }
  }

  async function saveAll() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const configRes = await fetch("/api/queue/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, queue_last_updated: new Date().toISOString().split("T")[0] }),
      });

      if (!configRes.ok) {
        throw new Error("Failed to save queue config");
      }

      for (const item of items) {
        if (item.id) {
          await fetch(`/api/queue/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
        } else if (item.title) {
          await fetch("/api/queue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      loadData();
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function addItem() {
    setItems([...items, {
      title: "",
      stage: "Request Received",
      progress: 0,
      estimated_completion: "",
      status: "active",
    }]);
  }

  function updateItem(index: number, field: string, value: any) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-[var(--text-dim)]">Loading queue...</div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Queue updated successfully
        </div>
      )}

      {/* Queue Settings */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold text-white mb-4">Queue Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Status</label>
            <select
              value={config.queue_status}
              onChange={(e) => setConfig({ ...config, queue_status: e.target.value })}
              className="field"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Total Slots</label>
            <input
              type="number"
              min="0"
              value={config.queue_slots_total}
              onChange={(e) => setConfig({ ...config, queue_slots_total: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Slots Used</label>
            <input
              type="number"
              min="0"
              value={config.queue_slots_used}
              onChange={(e) => setConfig({ ...config, queue_slots_used: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Wait Time</label>
            <input
              value={config.queue_wait_time}
              onChange={(e) => setConfig({ ...config, queue_wait_time: e.target.value })}
              placeholder="e.g. 2-3 weeks"
              className="field"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Queue Notes</label>
            <textarea
              rows={3}
              value={config.queue_notes}
              onChange={(e) => setConfig({ ...config, queue_notes: e.target.value })}
              placeholder="Any notes for visitors..."
              className="field resize-y"
            />
          </div>
        </div>
      </div>

      {/* Queue Items */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Queue Items</h3>
          <button onClick={addItem} className="btn-primary !text-sm !py-2 !px-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={item.id || i} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Title</label>
                  <input
                    value={item.title}
                    onChange={(e) => updateItem(i, "title", e.target.value)}
                    placeholder="e.g. VRChat Avatar Edit"
                    className="field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Stage</label>
                  <select
                    value={item.stage}
                    onChange={(e) => updateItem(i, "stage", e.target.value)}
                    className="field"
                  >
                    {STAGE_OPTIONS.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.progress}
                    onChange={(e) => updateItem(i, "progress", parseInt(e.target.value) || 0)}
                    className="field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Est. Completion</label>
                  <input
                    value={item.estimated_completion}
                    onChange={(e) => updateItem(i, "estimated_completion", e.target.value)}
                    placeholder="e.g. 3 days"
                    className="field"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => removeItem(i)}
                  className="text-xs text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={saveAll}
            disabled={saving}
            className="btn-primary !text-sm !py-2.5 !px-6 inline-flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Queue</>}
          </button>
        </div>
      </div>
    </div>
  );
}
