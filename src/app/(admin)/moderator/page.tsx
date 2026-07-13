"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  LogOut,
  CheckCircle2,
  XCircle,
  EyeOff,
  Eye,
  MessageSquare,
  FileText,
  History,
  AlertTriangle,
  Inbox,
  Loader2,
  KeyRound,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/admin/Button";
import { Card, CardHeader } from "@/components/admin/Card";
import { Modal } from "@/components/admin/Modal";
import { Field, Input, Textarea } from "@/components/admin/Field";
import { useToast } from "@/components/admin/Toast";

type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: "owner" | "moderator";
  perms: { reviews: boolean; submissions: boolean; hide_content: boolean };
};

type Review = {
  id: string;
  display_name: string;
  rating: number;
  review_text: string;
  status: string;
  hidden: boolean;
  rejected_reason?: string;
  image_url?: string;
  created_at: string;
};

type Submission = {
  id: string;
  name: string;
  discord: string;
  email: string;
  description: string;
  budget: string;
  deadline: string;
  reference_links: string;
  notes: string;
  status: string;
  hidden: boolean;
  rejected_reason?: string;
  created_at: string;
};

type LogEntry = {
  id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_label: string;
  reason: string;
  created_at: string;
};

type Tab = "queue" | "hidden" | "log";

export default function ModeratorPage() {
  const toast = useToast();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [booting, setBooting] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [tab, setTab] = useState<Tab>("queue");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [reject, setReject] = useState<{ type: "review" | "submission"; id: string; label: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [q, l] = await Promise.all([
        fetch("/api/moderation/queue").then((r) => r.json()),
        fetch("/api/moderation/log").then((r) => r.json()),
      ]);
      setReviews(q.reviews || []);
      setSubmissions(q.submissions || []);
      setLog(l.log || []);
    } catch {
      toast.error("Failed to load moderation data");
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSession(d?.user ?? null))
      .catch(() => setSession(null))
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.user) {
      setLoginError(data.error || "Invalid credentials");
      return;
    }
    setSession(data.user);
    setPassword("");
  }

  async function doLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setReviews([]);
    setSubmissions([]);
    setLog([]);
  }

  async function act(type: "review" | "submission", id: string, action: "approve" | "reject" | "hide" | "unhide", reason?: string) {
    const res = await fetch("/api/moderation/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, action, reason }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Action failed");
      return false;
    }
    const labels: Record<string, string> = { approve: "Approved", reject: "Rejected", hide: "Hidden", unhide: "Restored" };
    toast.success(`${labels[action]} successfully`);
    await loadData();
    return true;
  }

  async function confirmReject() {
    if (!reject) return;
    if (!rejectReason.trim()) {
      toast.error("Please add an internal reason");
      return;
    }
    const ok = await act(reject.type, reject.id, "reject", rejectReason.trim());
    if (ok) {
      setReject(null);
      setRejectReason("");
    }
  }

  if (booting) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" /> Loading…
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-[500px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.06] blur-[120px]" />
        <form onSubmit={doLogin} className="ad-panel relative w-full max-w-sm p-8">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#04060a] shadow-lg shadow-[var(--accent)]/20">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-center text-2xl font-bold text-white">Moderator Access</h1>
          <p className="mb-6 mt-1.5 text-center text-sm text-[var(--text-dim)]">
            Sign in with your moderator or owner account.
          </p>
          <Field label="Username">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoFocus />
          </Field>
          <Field label="Password" className="mt-4">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </Field>
          {loginError && (
            <p className="mt-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
              {loginError}
            </p>
          )}
          <Button type="submit" className="mt-5 w-full" size="md" leftIcon={<KeyRound className="h-4 w-4" />}>
            Sign In
          </Button>
        </form>
      </div>
    );
  }

  const canReviews = session.perms.reviews;
  const canSubmissions = session.perms.submissions;
  const canHide = session.perms.hide_content;

  const pendingReviews = reviews.filter((r) => r.status === "pending" && !r.hidden);
  const hiddenReviews = reviews.filter((r) => r.hidden);
  const pendingSubmissions = submissions.filter((s) => s.status === "pending" && !s.hidden);
  const hiddenSubmissions = submissions.filter((s) => s.hidden);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "queue", label: "Approval Queue", icon: <Inbox className="h-4 w-4" />, count: pendingReviews.length + pendingSubmissions.length },
    { id: "hidden", label: "Hidden Content", icon: <EyeOff className="h-4 w-4" />, count: hiddenReviews.length + hiddenSubmissions.length },
    { id: "log", label: "Moderation Log", icon: <History className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#04060a]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Moderator Dashboard</p>
              <p className="text-xs text-[var(--text-dim)]">
                Signed in as <span className="text-[var(--text-secondary)]">{session.name}</span>
                <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--accent)]">
                  {session.role}
                </span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={doLogout} leftIcon={<LogOut className="h-4 w-4" />}>
            Sign Out
          </Button>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-[var(--accent-soft)] text-white" : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
              }`}
            >
              {t.icon}
              {t.label}
              {typeof t.count === "number" && t.count > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-bold text-[#04060a]">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <PermissionSummary session={session} />

        {tab === "queue" && (
          <div className="mt-6 space-y-8">
            {canReviews && (
              <QueueSection
                title="Pending Reviews"
                icon={<MessageSquare className="h-4 w-4" />}
                items={pendingReviews}
                empty="No reviews waiting for approval."
                loading={loadingData}
                render={(r) => <ReviewBody review={r} />}
                onApprove={(r) => act("review", r.id, "approve")}
                onReject={(r) => setReject({ type: "review", id: r.id, label: r.display_name })}
                onHide={(r) => canHide && act("review", r.id, "hide")}
                canHide={canHide}
              />
            )}
            {canSubmissions && (
              <QueueSection
                title="Pending Commission Submissions"
                icon={<FileText className="h-4 w-4" />}
                items={pendingSubmissions}
                empty="No commission submissions waiting for approval."
                loading={loadingData}
                render={(s) => <SubmissionBody submission={s} />}
                onApprove={(s) => act("submission", s.id, "approve")}
                onReject={(s) => setReject({ type: "submission", id: s.id, label: s.name || "Submission" })}
                onHide={(s) => canHide && act("submission", s.id, "hide")}
                canHide={canHide}
              />
            )}
            {!canReviews && !canSubmissions && (
              <EmptyState text="Your account doesn't have permission to approve content yet. The owner can enable permissions from the admin dashboard." />
            )}
          </div>
        )}

        {tab === "hidden" && (
          <div className="mt-6 space-y-8">
            {canHide ? (
              <>
                <QueueSection
                  title="Hidden Reviews"
                  icon={<EyeOff className="h-4 w-4" />}
                  items={hiddenReviews}
                  empty="No hidden reviews."
                  loading={loadingData}
                  render={(r) => <ReviewBody review={r} />}
                  hidden
                  onUnhide={(r) => act("review", r.id, "unhide")}
                />
                <QueueSection
                  title="Hidden Submissions"
                  icon={<EyeOff className="h-4 w-4" />}
                  items={hiddenSubmissions}
                  empty="No hidden submissions."
                  loading={loadingData}
                  render={(s) => <SubmissionBody submission={s} />}
                  hidden
                  onUnhide={(s) => act("submission", s.id, "unhide")}
                />
              </>
            ) : (
              <EmptyState text="You don't have permission to manage hidden content." />
            )}
          </div>
        )}

        {tab === "log" && <LogSection log={log} loading={loadingData} />}
      </div>

      <Modal
        open={Boolean(reject)}
        onClose={() => {
          setReject(null);
          setRejectReason("");
        }}
        title="Reject submission"
        description={`Add an internal reason for rejecting ${reject?.label || "this item"}. This is recorded in the moderation log and not shown publicly.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setReject(null); setRejectReason(""); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmReject} leftIcon={<XCircle className="h-4 w-4" />}>
              Reject
            </Button>
          </>
        }
      >
        <Field label="Internal reason">
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Inappropriate language / spam / not relevant"
            rows={4}
            autoFocus
          />
        </Field>
      </Modal>
    </div>
  );
}

/* ----------------------------- Sub-components ----------------------------- */

function PermissionSummary({ session }: { session: SessionUser }) {
  const list = [
    { key: "reviews", label: "Review moderation", on: session.perms.reviews },
    { key: "submissions", label: "Submission moderation", on: session.perms.submissions },
    { key: "hide_content", label: "Hide content", on: session.perms.hide_content },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <UserCog className="h-4 w-4 text-[var(--accent)]" />
      <span className="text-sm text-[var(--text-secondary)]">Your permissions:</span>
      {list.map((p) => (
        <span
          key={p.key}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            p.on
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-[var(--border)] bg-white/5 text-[var(--text-dim)]"
          }`}
        >
          {p.on ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {p.label}
        </span>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[var(--r-md)] border border-dashed border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
      <p className="mx-auto max-w-md px-4 text-sm text-[var(--text-secondary)]">{text}</p>
    </div>
  );
}

function QueueSection<T extends { id: string }>({
  title,
  icon,
  items,
  empty,
  loading,
  render,
  hidden,
  onApprove,
  onReject,
  onHide,
  onUnhide,
  canHide,
}: {
  title: string;
  icon: React.ReactNode;
  items: T[];
  empty: string;
  loading: boolean;
  render: (item: T) => React.ReactNode;
  hidden?: boolean;
  onApprove?: (item: T) => void;
  onReject?: (item: T) => void;
  onHide?: (item: T) => void;
  onUnhide?: (item: T) => void;
  canHide?: boolean;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
        {icon}
        {title}
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--text-dim)]">{items.length}</span>
      </div>
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="ad-panel h-32 animate-pulse opacity-60" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--r-md)] border border-dashed border-[var(--border)] py-10 text-center text-sm text-[var(--text-dim)]">
          {empty}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-5">
              {render(item)}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
                {hidden ? (
                  <Button size="sm" variant="secondary" onClick={() => onUnhide?.(item)} leftIcon={<Eye className="h-4 w-4" />}>
                    Restore
                  </Button>
                ) : (
                  <>
                    {onApprove && (
                      <Button size="sm" variant="primary" onClick={() => onApprove(item)} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
                        Approve
                      </Button>
                    )}
                    {onReject && (
                      <Button size="sm" variant="danger" onClick={() => onReject(item)} leftIcon={<XCircle className="h-4 w-4" />}>
                        Reject
                      </Button>
                    )}
                    {canHide && onHide && (
                      <Button size="sm" variant="ghost" onClick={() => onHide(item)} leftIcon={<EyeOff className="h-4 w-4" />}>
                        Hide
                      </Button>
                    )}
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm ${i <= rating ? "text-[var(--accent)]" : "text-[var(--text-dim)]"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewBody({ review }: { review: Review }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-lg font-bold text-white">
          {review.display_name?.[0]?.toUpperCase() || "★"}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{review.display_name}</p>
          <Stars rating={review.rating || 5} />
        </div>
        {review.status === "rejected" && (
          <span className="ml-auto rounded-full border border-[var(--danger-border)] bg-[var(--danger-soft)] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--danger)]">
            Rejected
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">"{review.review_text}"</p>
      {review.rejected_reason && (
        <p className="mt-3 rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-xs text-[var(--text-dim)]">
          <span className="font-semibold text-[var(--text-secondary)]">Reason: </span>
          {review.rejected_reason}
        </p>
      )}
      {review.image_url && (
        <img src={review.image_url} alt="Review" className="mt-3 h-32 rounded-xl border border-[var(--border)] object-cover" />
      )}
    </div>
  );
}

function SubmissionBody({ submission }: { submission: Submission }) {
  const rows: [string, string][] = [
    ["Discord", submission.discord || "—"],
    ["Email", submission.email || "—"],
    ["Budget", submission.budget || "—"],
    ["Deadline", submission.deadline || "—"],
  ];
  return (
    <div>
      <p className="text-sm font-bold text-white">{submission.name || "Anonymous"}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{submission.description}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-[var(--border)] bg-white/[0.02] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">{k}</p>
            <p className="truncate text-sm text-[var(--text)]">{v}</p>
          </div>
        ))}
      </div>
      {submission.reference_links && (
        <p className="mt-3 text-xs text-[var(--text-dim)]">
          <span className="font-semibold text-[var(--text-secondary)]">References: </span>
          {submission.reference_links}
        </p>
      )}
      {submission.rejected_reason && (
        <p className="mt-3 rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-xs text-[var(--text-dim)]">
          <span className="font-semibold text-[var(--text-secondary)]">Reason: </span>
          {submission.rejected_reason}
        </p>
      )}
    </div>
  );
}

function LogSection({ log, loading }: { log: LogEntry[]; loading: boolean }) {
  if (loading) {
    return <div className="ad-panel h-40 animate-pulse opacity-60" />;
  }
  if (log.length === 0) {
    return (
      <div className="rounded-[var(--r-md)] border border-dashed border-[var(--border)] py-16 text-center text-sm text-[var(--text-dim)]">
        No moderation activity yet.
      </div>
    );
  }
  return (
    <Card className="divide-y divide-[var(--border)]">
      {log.map((entry) => (
        <div key={entry.id} className="flex flex-wrap items-center gap-3 p-4">
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
              entry.action === "Approved"
                ? "bg-emerald-500/10 text-emerald-400"
                : entry.action === "Rejected"
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-white/5 text-[var(--text-secondary)]"
            }`}
          >
            {entry.action === "Approved" ? <CheckCircle2 className="h-4 w-4" /> : entry.action === "Rejected" ? <XCircle className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--text)]">
              <span className="font-semibold text-white">{entry.actor_name}</span>{" "}
              <span className="text-[var(--text-secondary)]">{entry.action.toLowerCase()}</span>{" "}
              <span className="text-[var(--text-secondary)]">
                {entry.entity_type} {entry.entity_label ? `“${entry.entity_label}”` : ""}
              </span>
            </p>
            {entry.reason && <p className="mt-0.5 text-xs text-[var(--text-dim)]">Reason: {entry.reason}</p>}
          </div>
          <span className="text-xs text-[var(--text-dim)]">{new Date(entry.created_at).toLocaleString()}</span>
        </div>
      ))}
    </Card>
  );
}
