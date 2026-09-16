"use client";

import { useState, useEffect } from "react";
import { useSave } from "../SaveProvider";
import { Card, CardHeader } from "../Card";
import { Button } from "../Button";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Package,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Loader2,
} from "lucide-react";

interface OverviewProps {
  site: Record<string, string>;
  pricing: any[];
  faq: any[];
  workflow: any[];
  reviews: any[];
  links: any[];
  credits: any[];
  tos: any[];
  storageError: string | null;
  dbHealth: { healthy: boolean; tables: Record<string, { exists: boolean; missingColumns: string[] }> } | null;
  onSelect: (id: string) => void;
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  iconColor?: string;
}

function StatCard({ icon: Icon, title, value, subtitle, iconColor = "text-[var(--accent)]" }: StatCardProps) {
  return (
    <div className="ad-section-card p-5">
      <div className="flex items-start gap-4">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--text-dim)]">{title}</h3>
          <p className="mt-0.5 text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-[var(--text-dim)]">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export function OverviewSection({
  site,
  pricing,
  faq,
  workflow,
  reviews,
  links,
  credits,
  tos,
  storageError,
  dbHealth,
  onSelect,
}: OverviewProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const pendingReviews = reviews.filter((r: any) => r.status === "pending").length;
  const approvedReviews = reviews.filter((r: any) => r.status === "approved").length;
  const slotsTotal = parseInt(site.queue_slots_total || "0", 10);
  const slotsUsed = parseInt(site.queue_slots_used || "0", 10);
  const slotsAvailable = Math.max(0, slotsTotal - slotsUsed);
  const queueStatus = site.queue_status || "unknown";
  const statusConfig = {
    open: { label: "Open", color: "text-emerald-400" },
    limited: { label: "Limited", color: "text-amber-400" },
    closed: { label: "Closed", color: "text-red-400" },
    hold: { label: "On Hold", color: "text-amber-400" },
  }[queueStatus as string] || { label: queueStatus, color: "text-[var(--text-secondary)]" };

  const QUICK_LINKS = [
    { id: "portfolio", label: "Portfolio", icon: ImageIcon, count: 0 },
    { id: "pricing", label: "Pricing", icon: DollarSign, count: pricing.length },
    { id: "faq", label: "FAQ", icon: HelpCircle, count: faq.length },
    { id: "workflow", label: "Process", icon: Clock, count: workflow.length },
    { id: "reviews", label: "Reviews", icon: Star, count: reviews.length },
    { id: "adoptables", label: "Adoptables", icon: Package, count: 0 },
    { id: "credits", label: "Credits", icon: Users, count: credits.length },
    { id: "tos", label: "Terms of Service", icon: FileText, count: tos.length },
    { id: "site", label: "Site Info", icon: Sparkles, count: Object.keys(site).length },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-8">
          <CardHeader title="Dashboard" description="Overview of your commission studio." />
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-3/4 rounded bg-[var(--border)] animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-[var(--accent)]/4 blur-[120px] orb-slow" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} title="Queue Status" value={statusConfig.label} subtitle={`${slotsAvailable} of ${slotsTotal} slots available`} iconColor={statusConfig.color} />
        <StatCard icon={Star} title="Client Reviews" value={reviews.length} subtitle={`${approvedReviews} approved, ${pendingReviews} pending`} iconColor="text-amber-400" />
        <StatCard icon={HelpCircle} title="FAQ Items" value={faq.length} subtitle="Customer questions" />
        <StatCard icon={DollarSign} title="Pricing Tiers" value={pricing.length} subtitle="Active commission tiers" />
        <StatCard icon={FileText} title="TOS Sections" value={tos.length} subtitle="Legal terms" />
        <StatCard icon={Users} title="Credits" value={credits.length} subtitle="Community credits" />
        <StatCard icon={QrCode} title="Social Links" value={links.length} subtitle="External links" />
        <StatCard icon={Sparkles} title="Site Config" value={Object.keys(site).length} subtitle="Configuration entries" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader
            title="Quick Actions"
            description="Jump to a management section."
            actions={
              <Button size="sm" variant="secondary" onClick={() => onSelect("reviews")}>
                Moderate reviews
              </Button>
            }
          />
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => {
              const LinkIcon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelect(link.id)}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-left text-sm transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
                >
                  <span className="flex items-center gap-2.5">
                    <LinkIcon className="h-4 w-4 text-[var(--accent)]" />
                    {link.label}
                  </span>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="text-xs font-semibold text-[var(--text-dim)]">{link.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader title="System Status" description="Health of connected services." />
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
              <span className="flex items-center gap-2.5 text-sm">
                <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                Database
              </span>
              {dbHealth ? (
                <span className={`text-xs font-semibold ${dbHealth.healthy ? "text-emerald-400" : "text-[var(--danger)]"}`}>
                  {dbHealth.healthy ? "Healthy" : "Schema issues"}
                </span>
              ) : (
                <span className="text-xs text-[var(--text-dim)]">Not checked</span>
              )}
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
              <span className="flex items-center gap-2.5 text-sm">
                <ImageIcon className="h-4 w-4 text-[var(--accent)]" />
                Storage
              </span>
              <span className={`text-xs font-semibold ${storageError ? "text-[var(--warning)]" : "text-emerald-400"}`}>
                {storageError ? "Needs setup" : "OK"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
              <span className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
                Pending Review
              </span>
              <span className="text-xs font-semibold text-[var(--warning)]">
                {pendingReviews}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
