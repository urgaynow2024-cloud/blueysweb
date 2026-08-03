"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "../Card";
import { Field, Input } from "../Field";
import { Button } from "../Button";
import { Trash2, Bell, Webhook, CheckCircle2, Save } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

interface NotificationSetting {
  id?: string;
  notification_type: string;
  webhook_url: string;
  enabled: boolean;
}

interface Notification {
  id?: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at?: string;
}

const NOTIFICATION_TYPES = [
  { value: "commission_submitted", label: "New Commission Submitted", description: "When a new commission request is submitted" },
  { value: "contact_submitted", label: "New Contact Form Submitted", description: "When someone submits the contact form" },
  { value: "review_submitted", label: "New Review Submitted", description: "When a new review is submitted for moderation" },
  { value: "commission_updated", label: "Commission Status Updated", description: "When a commission status changes" },
  { value: "payment_received", label: "Payment Received", description: "When a payment is marked as received" },
];

export function NotificationsSection() {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [settingsRes, notifRes] = await Promise.all([
          fetch("/api/admin/notifications/settings").catch(() => ({ ok: false, json: () => Promise.resolve([]) })),
          fetch("/api/notifications").catch(() => ({ ok: false, json: () => Promise.resolve([]) })),
        ]);
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(Array.isArray(data) ? data : NOTIFICATION_TYPES.map((t) => ({ notification_type: t.value, webhook_url: "", enabled: true })));
        } else {
          setSettings(NOTIFICATION_TYPES.map((t) => ({ notification_type: t.value, webhook_url: "", enabled: true })));
        }
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Failed to load notifications:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/notifications/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "blueyadmin",
        },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        toast.success("Notification settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(index: number, patch: Partial<NotificationSetting>) {
    const next = settings.slice();
    next[index] = { ...next[index], ...patch };
    setSettings(next);
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "x-admin-password": "blueyadmin" },
        body: JSON.stringify({ read: true }),
      });
      setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  }

  async function deleteNotification(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": "blueyadmin" },
      });
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (e) {
      console.error("Failed to delete notification:", e);
    }
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="ad-skeleton h-8 w-48 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ad-skeleton h-20 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Webhook Settings */}
      <Card className="p-6">
        <CardHeader
          title="Webhook Configuration"
          description="Configure Discord webhooks for automated notifications"
          actions={
            <Button size="sm" variant="primary" onClick={handleSaveSettings} disabled={saving} leftIcon={<Save className="h-4 w-4" />}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          }
        />
        <div className="mt-6 space-y-4">
          {settings.map((setting, i) => {
            const typeInfo = NOTIFICATION_TYPES.find((t) => t.value === setting.notification_type);
            return (
              <div key={setting.notification_type} className="ad-panel ad-panel-hover rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-[var(--accent)]" />
                      <h3 className="font-semibold text-white">{typeInfo?.label || setting.notification_type}</h3>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={setting.enabled}
                          onChange={(e) => updateSetting(i, { enabled: e.target.checked })}
                          className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-dim)]">{typeInfo?.description}</p>
                  </div>
                  <div className="flex-1 min-w-[240px]">
                    <Field label="Discord Webhook URL">
                      <div className="relative">
                        <Webhook className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                        <Input
                          value={setting.webhook_url}
                          onChange={(e) => updateSetting(i, { webhook_url: e.target.value })}
                          placeholder="https://discord.com/api/webhooks/..."
                          className="pl-10"
                          disabled={!setting.enabled}
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Notifications */}
      <Card className="p-6">
        <CardHeader title="Recent Notifications" description="Latest system notifications" />
        <div className="mt-6">
          {notifications.length === 0 ? (
            <div className="ad-empty">
              <Bell className="h-12 w-12 text-[var(--text-dim)]" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 20).map((notif) => (
                <div
                  key={notif.id}
                  className={`ad-panel rounded-xl p-4 ${!notif.read ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                        {!notif.read && <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">{notif.message}</p>
                      <p className="mt-1 text-xs text-[var(--text-dim)]">
                        {notif.created_at ? new Date(notif.created_at).toLocaleString() : ""}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notif.read && (
                        <Button size="sm" variant="ghost" onClick={() => markAsRead(notif.id!)}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteNotification(notif.id!)} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
