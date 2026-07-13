"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSave } from "../SaveProvider";
import { useToast } from "../Toast";
import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea, Select } from "../Field";
import { Button } from "../Button";

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

const DEFAULT_CONFIG = {
  queue_status: "open",
  queue_slots_total: "8",
  queue_slots_used: "0",
  queue_wait_time: "2-3 weeks",
  queue_notes: "",
  queue_last_updated: new Date().toISOString().split("T")[0],
};

export function QueueSection() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const itemsRef = useRef<QueueItem[]>(items);
  const configRef = useRef(config);

  const { markDirty, register } = useSave();
  const toast = useToast();

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    (async () => {
      try {
        const [qRes, cRes] = await Promise.all([fetch("/api/queue"), fetch("/api/queue/config")]);
        if (qRes.ok) {
          const data = await qRes.json();
          setItems(
            data.map((it: any) => ({
              id: it.id,
              title: it.title,
              stage: it.stage,
              progress: it.progress || 0,
              estimated_completion: it.estimated_completion || "",
              status: it.status || "active",
            }))
          );
        }
        if (cRes.ok) {
          const cfg = await cRes.json();
          setConfig((prev) => ({ ...prev, ...cfg }));
        }
      } catch {
        toast.error("Failed to load queue data");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const saveQueue = useCallback(async () => {
    const cRes = await fetch("/api/queue/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...configRef.current, queue_last_updated: new Date().toISOString().split("T")[0] }),
    });
    if (!cRes.ok) throw new Error("Failed to save queue config");
    for (const item of itemsRef.current) {
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
  }, []);

  useEffect(() => register("queue", saveQueue), [register, saveQueue]);

  function updateItem(i: number, field: string, value: any) {
    setItems((prev) => prev.map((it, j) => (j === i ? { ...it, [field]: value } : it)));
    markDirty();
  }
  function updateConfig(field: string, value: any) {
    setConfig((prev) => ({ ...prev, [field]: value }));
    markDirty();
  }
  function addItem() {
    setItems((prev) => [...prev, { title: "", stage: "Request Received", progress: 0, estimated_completion: "", status: "active" }]);
    markDirty();
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, j) => j !== i));
    markDirty();
  }

  if (loading) {
    return (
      <Card className="p-8">
        <CardHeader title="Commission Queue" />
        <p className="mt-4 text-sm text-[var(--text-dim)]">Loading…</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <CardHeader title="Queue Settings" description="Public availability shown on the queue page." />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Status">
            <Select value={config.queue_status} onChange={(e) => updateConfig("queue_status", e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </Select>
          </Field>
          <Field label="Total Slots">
            <Input type="number" min={0} value={config.queue_slots_total} onChange={(e) => updateConfig("queue_slots_total", e.target.value)} />
          </Field>
          <Field label="Slots Used">
            <Input type="number" min={0} value={config.queue_slots_used} onChange={(e) => updateConfig("queue_slots_used", e.target.value)} />
          </Field>
          <Field label="Wait Time">
            <Input value={config.queue_wait_time} onChange={(e) => updateConfig("queue_wait_time", e.target.value)} placeholder="e.g. 2-3 weeks" />
          </Field>
          <Field label="Queue Notes" className="md:col-span-2">
            <Textarea rows={3} value={config.queue_notes} onChange={(e) => updateConfig("queue_notes", e.target.value)} placeholder="Any notes for visitors…" />
          </Field>
        </div>
      </Card>

      <Card className="p-8">
        <CardHeader
          title="Queue Items"
          description="Track individual commissions through your pipeline."
          actions={
            <Button size="sm" variant="primary" onClick={addItem} leftIcon={<Plus className="h-4 w-4" />}>
              Add Item
            </Button>
          }
        />
        <div className="mt-6 space-y-4">
          {items.map((item, i) => (
            <div key={item.id || i} className="ad-panel ad-panel-hover p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Title">
                  <Input value={item.title} onChange={(e) => updateItem(i, "title", e.target.value)} placeholder="VRChat Avatar Edit" />
                </Field>
                <Field label="Stage">
                  <Select value={item.stage} onChange={(e) => updateItem(i, "stage", e.target.value)}>
                    {STAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Progress (%)">
                  <Input type="number" min={0} max={100} value={item.progress} onChange={(e) => updateItem(i, "progress", parseInt(e.target.value) || 0)} />
                </Field>
                <Field label="Est. Completion">
                  <Input value={item.estimated_completion} onChange={(e) => updateItem(i, "estimated_completion", e.target.value)} placeholder="e.g. 3 days" />
                </Field>
              </div>
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="ghost" onClick={() => removeItem(i)} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]" leftIcon={<Trash2 className="h-4 w-4" />}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
