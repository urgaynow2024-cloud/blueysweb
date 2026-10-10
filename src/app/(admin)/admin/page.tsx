"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { LogOut, RotateCcw, Loader2, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";
import { useSave } from "@/components/admin/SaveProvider";
import { useToast } from "@/components/admin/Toast";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Field";

import { OverviewSection } from "@/components/admin/sections/OverviewSection";
import { SectionErrorBoundary } from "@/components/admin/SectionErrorBoundary";

/**
 * Sections are code-split so the dashboard's initial JavaScript
 * only contains the Overview. Each tab's chunk loads the first
 * time it is opened instead of bloating the first paint.
 */
const PortfolioSection = dynamic(() => import("@/components/admin/sections/PortfolioSection").then((m) => ({ default: m.PortfolioSection })), { ssr: false });
const PricingSection = dynamic(() => import("@/components/admin/sections/PricingSection").then((m) => ({ default: m.PricingSection })), { ssr: false });
const FaqSection = dynamic(() => import("@/components/admin/sections/FaqSection").then((m) => ({ default: m.FaqSection })), { ssr: false });
const WorkflowSection = dynamic(() => import("@/components/admin/sections/WorkflowSection").then((m) => ({ default: m.WorkflowSection })), { ssr: false });
const ReviewsSection = dynamic(() => import("@/components/admin/sections/ReviewsSection").then((m) => ({ default: m.ReviewsSection })), { ssr: false });
const SiteImagesSection = dynamic(() => import("@/components/admin/sections/SiteImagesSection").then((m) => ({ default: m.SiteImagesSection })), { ssr: false });
const NsfwSection = dynamic(() => import("@/components/admin/sections/NsfwSection").then((m) => ({ default: m.NsfwSection })), { ssr: false });
const LinksSection = dynamic(() => import("@/components/admin/sections/LinksSection").then((m) => ({ default: m.LinksSection })), { ssr: false });
const QueueSection = dynamic(() => import("@/components/admin/sections/QueueSection").then((m) => ({ default: m.QueueSection })), { ssr: false });
const SiteInfoSection = dynamic(() => import("@/components/admin/sections/SiteInfoSection").then((m) => ({ default: m.SiteInfoSection })), { ssr: false });
const ModeratorsSection = dynamic(() => import("@/components/admin/sections/ModeratorsSection").then((m) => ({ default: m.ModeratorsSection })), { ssr: false });
const AdoptablesSection = dynamic(() => import("@/components/admin/sections/AdoptablesSection").then((m) => ({ default: m.AdoptablesSection })), { ssr: false });
const TosSection = dynamic(() => import("@/components/admin/sections/TosSection").then((m) => ({ default: m.TosSection })), { ssr: false });
const CreditsSection = dynamic(() => import("@/components/admin/sections/CreditsSection").then((m) => ({ default: m.CreditsSection })), { ssr: false });
const NoAiBadgeSection = dynamic(() => import("@/components/admin/sections/NoAiBadgeSection").then((m) => ({ default: m.NoAiBadgeSection })), { ssr: false });

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const ADMIN_PASSWORD = "blueyadmin";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/**
 * Diagnostics (storage bucket status, the CORS upload probe,
 * database schema health) change rarely but used to run on
 * every dashboard load — including a real upload+delete cycle
 * in storage. Results are cached in sessionStorage for this
 * long so repeat visits render instantly and the write probe
 * only happens once per window.
 */
const DIAG_CACHE_TTL_MS = 10 * 60 * 1000;

const defaultSite: Record<string, string> = {
  name: "Bluey's Creations",
  queue_status: "open",
  queue_slots_total: "8",
  queue_slots_used: "3",
  queue_wait_time: "2-3 weeks",
  no_ai_enabled: "true",
  no_ai_placement: "all",
};
const defaultPricing: any[] = [];
const defaultFaq: any[] = [
  { question: "What do I need to provide?", answer: "What you want done, avatar base name, reference images, and any required assets provided.", sort_order: 0 },
  { question: "How long does a commission take?", answer: "Depends on the tier and complexity. Light work is faster, full overhauls take longer.", sort_order: 1 },
  { question: "Do you work on Quest?", answer: "Quest compatibility depends on the tier. Overhauls include Quest optimisation.", sort_order: 2 },
  { question: "What payment methods?", answer: "PayPal and Payhip only. 50% deposit before work begins.", sort_order: 3 },
  { question: "Can I request NSFW work?", answer: "Limited NSFW commissions are accepted case-by-case for 18+ clients. See NSFW page for details.", sort_order: 4 },
  { question: "What files do I get?", answer: "Unity-ready VRChat avatar files. Blender source files on request.", sort_order: 5 },
];
const defaultWorkflow: any[] = [];

  type Tab = "overview" | "portfolio" | "pricing" | "faq" | "workflow" | "reviews" | "site-images" | "nsfw" | "social-links" | "queue" | "site" | "moderators" | "adoptables" | "credits" | "tos" | "no-ai";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [resetOpen, setResetOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [userName, setUserName] = useState("Admin");
  const pwRef = useRef<HTMLInputElement>(null);

  const [site, setSite] = useState<any>(defaultSite);
  const [pricing, setPricing] = useState<any[]>(defaultPricing);
  const [faq, setFaq] = useState<any[]>(defaultFaq);
  const [workflow, setWorkflow] = useState<any[]>(defaultWorkflow);
  const [reviews, setReviews] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [tos, setTos] = useState<any[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [corsTestResult, setCorsTestResult] = useState<{ bucket: string; success: boolean; error?: string } | null>(null);
  const [dbHealth, setDbHealth] = useState<{ healthy: boolean; tables: Record<string, { exists: boolean; missingColumns: string[] }>; error?: string } | null>(null);

  const { markDirty, register } = useSave();
  const toast = useToast();

  const dataRef = useRef({ site, pricing, faq, workflow, reviews, links, credits, tos });
  useEffect(() => {
    dataRef.current = { site, pricing, faq, workflow, reviews, links, credits, tos };
  }, [site, pricing, faq, workflow, reviews, links, credits, tos]);

  /**
   * Session restore.
   *
   * The login session lives in an httpOnly cookie that survives
   * refreshes, but the page always started at the login screen.
   * Checking /api/auth/me on mount lets a returning owner skip
   * the password step entirely; the API still verifies the
   * signed cookie on every request, so this does not weaken
   * the auth flow.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const { user } = (await res.json()) as { user?: { name?: string; username?: string } };
        if (cancelled || !user) return;
        setUserName(user.name || user.username || "Admin");
        setAuthed(true);
      } catch {
        // No valid session — show the login form.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authed) loadAllData();
  }, [authed]);

  useEffect(() => {
    if (lockedUntil && Date.now() < lockedUntil) {
      const timer = setTimeout(() => setLockedUntil(lockedUntil), 1000);
      return () => clearTimeout(timer);
    } else if (lockedUntil && Date.now() >= lockedUntil) {
      setLockedUntil(null);
      setAttempts(0);
    }
  }, [lockedUntil]);

  function readDiagCache(key: string): any | null {
    if (typeof sessionStorage === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(`bc_diag_${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.ts !== "number" || Date.now() - parsed.ts > DIAG_CACHE_TTL_MS) return null;
      return parsed.value ?? null;
    } catch {
      return null;
    }
  }

  function writeDiagCache(key: string, value: any) {
    if (typeof sessionStorage === "undefined") return;
    try {
      sessionStorage.setItem(`bc_diag_${key}`, JSON.stringify({ value, ts: Date.now() }));
    } catch {
      // sessionStorage can be unavailable (private browsing);
      // diagnostics simply run again on the next visit.
    }
  }

  /**
   * Diagnostics: storage bucket status, the CORS upload probe and
   * database schema health.
   *
   * These used to run — sequentially — before any dashboard
   * content was allowed to render, and the CORS probe performed a
   * real upload-then-delete in storage on every single visit.
   *
   * They are now (a) deferred until after the dashboard has
   * painted, and (b) cached in sessionStorage for
   * DIAG_CACHE_TTL_MS, so a repeat visit does zero diagnostic
   * round-trips. The upload probe still runs, just once per
   * cache window instead of every load.
   */
  async function runDiagnostics() {
    const { checkStorageBuckets, getMissingBucketMessage, testBucketUpload } = await import("@/lib/supabase/check");

    const cachedBuckets = readDiagCache("storage_buckets");
    if (cachedBuckets) {
      setStorageError(getMissingBucketMessage(cachedBuckets));
    } else {
      checkStorageBuckets()
        .then((statuses: any[]) => {
          writeDiagCache("storage_buckets", statuses);
          setStorageError(getMissingBucketMessage(statuses));

          const mainBucket = statuses.find((s: any) => s.exists)?.name;
          if (!mainBucket) return;

          const cachedCors = readDiagCache(`cors:${mainBucket}`);
          if (cachedCors) {
            setCorsTestResult({ bucket: mainBucket, ...cachedCors });
            return;
          }
          return testBucketUpload(mainBucket).then((result: any) => {
            writeDiagCache(`cors:${mainBucket}`, result);
            setCorsTestResult({ bucket: mainBucket, ...result });
          });
        })
        .catch(() => {});
    }

    const cachedHealth = readDiagCache("db_health");
    if (cachedHealth) {
      setDbHealth(cachedHealth);
      return;
    }
    fetch("/api/database/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          writeDiagCache("db_health", data);
          setDbHealth(data);
        }
      })
      .catch(() => {});
  }

  function scheduleDiagnostics() {
    // Yield so the dashboard shell and overview paint first.
    const run = () => runDiagnostics();
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(run, { timeout: 1500 });
    } else {
      setTimeout(run, 100);
    }
  }

  async function loadAllData() {
    setStorageError(null);
    setCorsTestResult(null);
    try {
      if (!isSupabaseConfigured || !supabase) {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          try {
            const data = JSON.parse(stored);
            if (data.site) setSite(data.site);
            if (data.pricing) setPricing(data.pricing);
            if (data.faq) setFaq(data.faq);
            if (data.workflow) setWorkflow(data.workflow);
            if (data.reviews) setReviews(data.reviews);
            if (data.links) setLinks(data.links);
          } catch {}
        }
        return;
      }

      // Content loads first, in parallel. Each result is applied
      // as soon as it resolves, so the dashboard fills in
      // progressively instead of waiting for the slowest query.
      const jobs: PromiseLike<void>[] = [
        supabase.from("site_config").select("*").then(({ data }) => {
          if (data && data.length > 0) {
            const s: any = { ...defaultSite };
            data.forEach((row: any) => { s[row.key] = row.value; });
            setSite(s);
          }
        }),
        supabase.from("pricing_tiers").select("*").order("sort_order", { ascending: true }).then(({ data }) => {
          if (data && data.length > 0) setPricing(data);
        }),
        supabase.from("faq_items").select("*").order("sort_order", { ascending: true }).then(({ data }) => {
          if (data && data.length > 0) setFaq(data);
        }),
        supabase.from("workflow_steps").select("*").order("sort_order", { ascending: true }).then(({ data }) => {
          if (data && data.length > 0) setWorkflow(data);
        }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }).then(({ data }) => {
          if (data && data.length > 0) setReviews(data);
        }),
        supabase.from("social_links").select("*").order("sort_order", { ascending: true }).then(({ data }) => {
          if (data && data.length > 0) setLinks(data);
        }),
        supabase.from("credits").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }).then(({ data }) => {
          if (data && data.length > 0) setCredits(data);
        }),
        supabase.from("tos_sections").select("*").order("sort_order", { ascending: true }).then(({ data }) => {
          if (data && data.length > 0) setTos(data);
        }),
      ];

      // Fire-and-forget: diagnostics must not hold up content.
      scheduleDiagnostics();

      await Promise.all(jobs.map((job) => Promise.resolve(job).catch(() => {})));
    } catch (e) {
      console.error("Failed to load data:", e);
    }
  }

  const contentSaver = useCallback(async () => {
    const { site, pricing, faq, workflow, reviews, links, credits, tos } = dataRef.current;
    const res = await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site, pricing, faq, workflow, reviews, socialLinks: links, tos }),
    });
    if (!res.ok) {
      const r = await res.json().catch(() => ({}));
      throw new Error(r.error || "Save failed");
    }
  }, []);

  useEffect(() => {
    return register("content", contentSaver);
  }, [register, contentSaver]);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");

    if (lockedUntil && Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      setLoginError(`Account locked. Try again in ${remaining}s.`);
      return;
    }

    if (!pw) {
      setLoginError("Password is required");
      pwRef.current?.focus();
      return;
    }

    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "owner", password: pw }),
      });

      if (res.ok) {
        setAuthed(true);
        setAttempts(0);
        return;
      }

      if (res.status === 401) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
          setLockedUntil(lockUntil);
          setLoginError(`Too many failed attempts. Account locked for 15 minutes.`);
          toast.error("Account locked due to too many failed attempts");
        } else {
          const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
          setLoginError(`Incorrect password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
        }
        setPw("");
        pwRef.current?.focus();
        return;
      }

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        const retryAfter = res.headers.get("Retry-After");
        const waitTime = retryAfter ? `${retryAfter}s` : "a while";
        setLoginError(data.error || `Too many attempts. Try again in ${waitTime}.`);
        setPw("");
        pwRef.current?.focus();
        return;
      }

      setLoginError("Server error. Please try again.");
    } catch {
      setLoginError("Network error. Please check your connection.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function doLogout() {
    // The session cookie is httpOnly, so clearing client state is not enough —
    // without this the cookie survives and the admin API stays writable.
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Log out locally regardless: the UI must never stay in a signed-in
      // state because the network call failed.
    }
    localStorage.removeItem("adminData");
    setAuthed(false);
  }

  function doReset() {
    setSite(defaultSite);
    setPricing(defaultPricing);
    setFaq(defaultFaq);
    setWorkflow(defaultWorkflow);
    setReviews([]);
    setLinks([]);
    localStorage.removeItem("adminData");
    setResetOpen(false);
    toast.info("Content reset to defaults — press Save Changes to apply");
    markDirty();
  }

  if (!authed) {
    const isLocked = Boolean(lockedUntil && Date.now() < lockedUntil);
    const remainingSeconds = isLocked ? Math.ceil((lockedUntil! - Date.now()) / 1000) : 0;

    return (
      <div className="ad-login-bg relative grid min-h-screen place-items-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 bg-cosmic-fog" />
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[var(--accent)]/15 blur-[180px] orb-slow" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[var(--accent-2)]/10 blur-[140px] orb-med" />
        <form
          onSubmit={doLogin}
          className="ad-login-card relative"
          noValidate
        >
          <div className="ad-login-icon">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="ad-login-title">Admin Access</h1>
          <p className="ad-login-subtitle">Enter the admin password to continue.</p>

          {loginError && (
            <div className="ad-login-error mt-5" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="ad-login-form">
            <div className="ad-login-field">
              <Input
                ref={pwRef}
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setLoginError("");
                }}
                placeholder="Password"
                autoFocus
                disabled={isLocked}
                aria-label="Admin password"
                aria-describedby={loginError ? "login-error" : undefined}
                aria-invalid={!!loginError}
                className={loginError ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20" : ""}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="ad-login-toggle"
                aria-label={showPw ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="md"
              disabled={isLocked || loginLoading}
              loading={loginLoading}
            >
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <DashboardLayout
      active={tab}
      userName={userName}
      onSelect={(id) => {
        if (id === "__reset") setResetOpen(true);
        else setTab(id as Tab);
      }}
      onLogout={doLogout}
      onReset={() => setResetOpen(true)}
    >
      {storageError && (
        <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-[var(--warning-border)] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Storage buckets missing</p>
              <p className="mt-1 whitespace-pre-line text-xs opacity-90">{storageError}</p>
            </div>
          </div>
        </div>
      )}
      {dbHealth && !dbHealth.healthy && (
        <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-[var(--warning-border)] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Database schema incomplete</p>
              <p className="mt-1 whitespace-pre-line text-xs opacity-90">
                {dbHealth.error || "Some required tables or columns are missing. Run the database setup to fix this."}
                {"\n\n"}
                {Object.entries(dbHealth.tables).filter(([_, t]) => !t.exists || t.missingColumns.length > 0).map(([table, t]) => {
                  if (!t.exists) return `- Table "${table}" is missing`;
                  if (t.missingColumns.length > 0) return `- Table "${table}" is missing columns: ${t.missingColumns.join(", ")}`;
                  return null;
                }).filter(Boolean).join("\n")}
              </p>
            </div>
          </div>
        </div>
      )}
      {corsTestResult && (
        <div className={`mx-auto mb-6 max-w-3xl rounded-xl border p-4 text-sm ${corsTestResult.success ? "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]" : "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]"}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">{corsTestResult.success ? `Upload test passed for "${corsTestResult.bucket}"` : `Upload test failed for "${corsTestResult.bucket}"`}</p>
              {corsTestResult.error && <p className="mt-1 whitespace-pre-line text-xs opacity-90">{corsTestResult.error}</p>}
              {!corsTestResult.success && (
                <p className="mt-2 text-xs opacity-90">
                  Check CORS settings in Supabase Dashboard → Storage → {corsTestResult.bucket} → Configuration → CORS.
                  Make sure your domain is allowed and methods include GET, POST, PUT, DELETE, OPTIONS.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {tab === "overview" && (
        <OverviewSection
          site={site}
          pricing={pricing}
          faq={faq}
          workflow={workflow}
          reviews={reviews}
          links={links}
          credits={credits}
          tos={tos}
          storageError={storageError}
          dbHealth={dbHealth}
          onSelect={(id) => setTab(id as Tab)}
        />
      )}
      {tab === "portfolio" && <PortfolioSection />}
      {tab === "pricing" && <PricingSection value={pricing} onChange={(n) => { setPricing(n); markDirty(); }} />}
      {tab === "faq" && <FaqSection value={faq} onChange={(n) => { setFaq(n); markDirty(); }} />}
      {tab === "workflow" && <WorkflowSection value={workflow} onChange={(n) => { setWorkflow(n); markDirty(); }} />}
      {tab === "reviews" && (
        <SectionErrorBoundary fallbackLabel="Reviews section failed to load">
          <ReviewsSection value={reviews} onChange={(n) => { setReviews(n); markDirty(); }} />
        </SectionErrorBoundary>
      )}
      {tab === "site-images" && <SiteImagesSection />}
      {tab === "nsfw" && <NsfwSection />}
      {tab === "social-links" && <LinksSection value={links} onChange={(n) => { setLinks(n); markDirty(); }} />}
      {tab === "queue" && <QueueSection />}
      {tab === "moderators" && <ModeratorsSection />}
      {tab === "adoptables" && <AdoptablesSection />}
      {tab === "credits" && <CreditsSection value={credits} onChange={(n) => { setCredits(n); markDirty(); }} />}
      {tab === "tos" && <TosSection value={tos} onChange={(n) => { setTos(n); markDirty(); }} />}
      {tab === "site" && <SiteInfoSection value={site} onChange={(n) => { setSite(n); markDirty(); }} />}
      {tab === "no-ai" && <NoAiBadgeSection site={site} onChange={(n) => { setSite(n); markDirty(); }} />}

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset to defaults?"
        description="This restores all content sections to their default values. Image uploads and queue items are not affected. You can undo by not saving."
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={doReset} leftIcon={<RotateCcw className="h-4 w-4" />}>Reset Defaults</Button>
          </>
        }
      >
        <div className="flex items-center gap-3 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]">
          <LogOut className="h-4 w-4" />
          This action is reversible until you press Save Changes.
        </div>
      </Modal>
    </DashboardLayout>
  );
}