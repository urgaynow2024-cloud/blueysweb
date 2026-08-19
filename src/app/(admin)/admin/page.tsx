"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LayoutDashboard, LogOut, RotateCcw, Loader2, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useSave } from "@/components/admin/SaveProvider";
import { useToast } from "@/components/admin/Toast";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Field";

import { PortfolioSection } from "@/components/admin/sections/PortfolioSection";
import { PricingSection } from "@/components/admin/sections/PricingSection";
import { FaqSection } from "@/components/admin/sections/FaqSection";
import { WorkflowSection } from "@/components/admin/sections/WorkflowSection";
import { ReviewsSection } from "@/components/admin/sections/ReviewsSection";
import { SiteImagesSection } from "@/components/admin/sections/SiteImagesSection";
import { NsfwSection } from "@/components/admin/sections/NsfwSection";
import { LinksSection } from "@/components/admin/sections/LinksSection";
import { QueueSection } from "@/components/admin/sections/QueueSection";
import { SiteInfoSection } from "@/components/admin/sections/SiteInfoSection";
import { ModeratorsSection } from "@/components/admin/sections/ModeratorsSection";
import { AdoptablesSection } from "@/components/admin/sections/AdoptablesSection";
import { TosSection } from "@/components/admin/sections/TosSection";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const ADMIN_PASSWORD = "blueyadmin";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const defaultSite: Record<string, string> = {};
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

type Tab = "portfolio" | "pricing" | "faq" | "workflow" | "reviews" | "site-images" | "nsfw" | "social-links" | "queue" | "site" | "moderators" | "adoptables" | "tos";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState<Tab>("portfolio");
  const [loading, setLoading] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  const [site, setSite] = useState<any>(defaultSite);
  const [pricing, setPricing] = useState<any[]>(defaultPricing);
  const [faq, setFaq] = useState<any[]>(defaultFaq);
  const [workflow, setWorkflow] = useState<any[]>(defaultWorkflow);
  const [reviews, setReviews] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [tos, setTos] = useState<any[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [corsTestResult, setCorsTestResult] = useState<{ bucket: string; success: boolean; error?: string } | null>(null);
  const [testingCors, setTestingCors] = useState(false);

  const { markDirty, register } = useSave();
  const toast = useToast();

  const dataRef = useRef({ site, pricing, faq, workflow, reviews, links, tos });
  useEffect(() => {
    dataRef.current = { site, pricing, faq, workflow, reviews, links, tos };
  }, [site, pricing, faq, workflow, reviews, links, tos]);

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

  async function loadAllData() {
    setLoading(true);
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
        setLoading(false);
        return;
      }

      const { checkStorageBuckets, getMissingBucketMessage, testBucketUpload } = await import("@/lib/storage-check");
      const bucketStatuses = await checkStorageBuckets();
      const missingMessage = getMissingBucketMessage(bucketStatuses);
      if (missingMessage) {
        setStorageError(missingMessage);
      }

      if (bucketStatuses.some((s) => s.exists)) {
        setTestingCors(true);
        const mainBucket = bucketStatuses.find((s) => s.exists)?.name || "portfolio-images";
        const result = await testBucketUpload(mainBucket);
        setCorsTestResult({ bucket: mainBucket, ...result });
        setTestingCors(false);
      }

      const [{ data: siteData }, { data: pricingData }, { data: faqData }, { data: workflowData }, { data: reviewsData }, { data: linksData }, { data: tosData }] = await Promise.all([
        supabase.from("site_config").select("*"),
        supabase.from("pricing_tiers").select("*").order("sort_order", { ascending: true }),
        supabase.from("faq_items").select("*").order("sort_order", { ascending: true }),
        supabase.from("workflow_steps").select("*").order("sort_order", { ascending: true }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("social_links").select("*").order("sort_order", { ascending: true }),
        supabase.from("tos_sections").select("*").order("sort_order", { ascending: true }),
      ]);
      if (siteData && siteData.length > 0) {
        const s: any = { ...defaultSite };
        siteData.forEach((row: any) => { s[row.key] = row.value; });
        setSite(s);
      }
      if (pricingData && pricingData.length > 0) setPricing(pricingData);
      if (faqData && faqData.length > 0) setFaq(faqData);
      if (workflowData && workflowData.length > 0) setWorkflow(workflowData);
      if (reviewsData && reviewsData.length > 0) setReviews(reviewsData);
      if (linksData && linksData.length > 0) setLinks(linksData);
      if (tosData && tosData.length > 0) setTos(tosData);
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
      setTestingCors(false);
    }
  }

  const contentSaver = useCallback(async () => {
    const { site, pricing, faq, workflow, reviews, links, tos } = dataRef.current;
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

      setLoginError("Server error. Please try again.");
    } catch {
      setLoginError("Network error. Please check your connection.");
    } finally {
      setLoginLoading(false);
    }
  }

  function doLogout() {
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

  if (loading) {
    return (
      <div className="ad-dashboard-bg grid min-h-screen place-items-center">
        <div className="pointer-events-none absolute -top-20 left-1/4 h-[300px] w-[300px] rounded-full bg-[var(--accent)]/10 blur-[120px] orb-slow" />
        <div className="relative z-10 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" /> Loading dashboard…
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      active={tab}
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
      {tab === "portfolio" && <PortfolioSection />}
      {tab === "pricing" && <PricingSection value={pricing} onChange={(n) => { setPricing(n); markDirty(); }} />}
      {tab === "faq" && <FaqSection value={faq} onChange={(n) => { setFaq(n); markDirty(); }} />}
      {tab === "workflow" && <WorkflowSection value={workflow} onChange={(n) => { setWorkflow(n); markDirty(); }} />}
      {tab === "reviews" && <ReviewsSection value={reviews} onChange={(n) => { setReviews(n); markDirty(); }} />}
      {tab === "site-images" && <SiteImagesSection />}
      {tab === "nsfw" && <NsfwSection />}
      {tab === "social-links" && <LinksSection value={links} onChange={(n) => { setLinks(n); markDirty(); }} />}
      {tab === "queue" && <QueueSection />}
      {tab === "moderators" && <ModeratorsSection />}
      {tab === "adoptables" && <AdoptablesSection />}
      {tab === "tos" && <TosSection value={tos} onChange={(n) => { setTos(n); markDirty(); }} />}
      {tab === "site" && <SiteInfoSection value={site} onChange={(n) => { setSite(n); markDirty(); }} />}

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