"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "../Card";
import { Field, Textarea } from "../Field";
import { Button } from "../Button";
import { Save, Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

interface MaintenanceMode {
  id?: string;
  enabled: boolean;
  message: string;
  allowed_ips: string[];
  updated_at?: string;
}

export function MaintenanceSection() {
  const [config, setConfig] = useState<MaintenanceMode>({ enabled: false, message: "", allowed_ips: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      try {
        const res = await fetch("/api/maintenance");
        if (res.ok) {
          const data = await res.json();
          setConfig({
            id: data.id,
            enabled: data.enabled || false,
            message: data.message || "",
            allowed_ips: data.allowed_ips || [],
          });
        }
      } catch (e) {
        console.error("Failed to load maintenance config:", e);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "blueyadmin",
        },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        toast.success("Maintenance settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="ad-skeleton h-8 w-48 rounded mb-6" />
        <div className="ad-skeleton h-32 w-full rounded-xl" />
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <CardHeader
            title="Maintenance Mode"
            description="Temporarily take the site offline for maintenance"
          />
          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.enabled ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                <Wrench className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {config.enabled ? "Maintenance Mode Active" : "Maintenance Mode Inactive"}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {config.enabled
                    ? "The website is currently offline for visitors."
                    : "The website is publicly accessible."}
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="h-5 w-9 rounded-full border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
              </label>
            </div>

            {config.enabled && (
              <>
                <Field label="Maintenance Message">
                  <Textarea
                    rows={4}
                    value={config.message}
                    onChange={(e) => setConfig({ ...config, message: e.target.value })}
                    placeholder="We'll be back soon! Thanks for your patience."
                  />
                </Field>
                <Field label="Allowed IPs (one per line)">
                  <Textarea
                    rows={3}
                    value={config.allowed_ips.join("\n")}
                    onChange={(e) => setConfig({ ...config, allowed_ips: e.target.value.split("\n").filter(Boolean) })}
                    placeholder="192.168.1.1&#10;10.0.0.1"
                  />
                </Field>
              </>
            )}

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={saving} leftIcon={<Save className="h-4 w-4" />}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div>
        <Card className="p-6">
          <CardHeader title="Status" description="Current maintenance state" />
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
              {config.enabled ? (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              )}
              <div>
                <div className="font-semibold text-white">{config.enabled ? "Offline" : "Online"}</div>
                <div className="text-xs text-[var(--text-dim)]">
                  {config.enabled ? "Visitors see maintenance page" : "Site is publicly accessible"}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
              <div className="text-xs text-[var(--text-dim)]">Allowed IPs</div>
              <div className="mt-1 text-sm text-white">
                {config.allowed_ips.length > 0 ? config.allowed_ips.join(", ") : "None (only admin access)"}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
