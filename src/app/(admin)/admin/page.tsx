"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LayoutDashboard, LogOut, RotateCcw, Loader2 } from "lucide-react";
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

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const ADMIN_PASSWORD = "blueyadmin";

const defaultSite = {
  name: "Bluey's Avatar Commissions",
  tagline: "VRChat Avatar Edits • Blender Work • Unity Setup",
  description: "Clean, stylish, performance-friendly avatars built for VRChat.",
  discord: "BlueyBarks",
};

const defaultPricing = [
  { id: "light", name: "Light Blender Work", emoji: "✨", price: "£15 - £25", badge: null, popular: false, features: ["Easy asset additions", "Custom jewellery", "Simple clothing fitting", "Texture recolours", "Minor avatar fixes"] },
  { id: "custom", name: "Avatar Customisation", emoji: "🛠", price: "£30 - £55", badge: "Most Requested", popular: true, features: ["Multiple asset additions", "Advanced clothing fitting", "Hair combinations", "Toggles setup", "Basic optimisation"] },
  { id: "overhaul", name: "Avatar Overhaul", emoji: "🔥", price: "£60 - £90", badge: null, popular: false, features: ["Heavy Blender work", "Full avatar redesign", "Advanced toggle systems", "Large asset integration", "Performance optimisation"] },
];

const defaultFaq = [
  { id: "1", question: "What do I need to provide?", answer: "What you want done, avatar base name, reference images, and any required assets." },
  { id: "2", question: "How long does a commission take?", answer: "Depends on complexity. Light work is faster, overhauls take longer." },
  { id: "3", question: "Do you work on Quest?", answer: "Quest compatibility depends on the tier. Overhauls include Quest optimisation." },
  { id: "4", question: "What payment methods?", answer: "PayPal and Payhip only. 50% deposit before work begins." },
];

const defaultWorkflow = [
  { id: "1", emoji: "💬", title: "Enquiry", desc: "Message me on Discord with what you're looking for." },
  { id: "2", emoji: "📋", title: "Quote", desc: "I'll let you know the price and how long it'll take." },
  { id: "3", emoji: "💳", title: "Deposit", desc: "50% deposit before I start work." },
  { id: "4", emoji: "🎨", title: "Work", desc: "I'll send progress updates and previews as I go." },
  { id: "5", emoji: "📦", title: "Delivery", desc: "Final files sent once the remaining payment is done." },
];

type Tab = "portfolio" | "pricing" | "faq" | "workflow" | "reviews" | "site-images" | "nsfw" | "social-links" | "queue" | "site" | "moderators";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<Tab>("portfolio");
  const [loading, setLoading] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);

  const [site, setSite] = useState<any>(defaultSite);
  const [pricing, setPricing] = useState<any[]>(defaultPricing);
  const [faq, setFaq] = useState<any[]>(defaultFaq);
  const [workflow, setWorkflow] = useState<any[]>(defaultWorkflow);
  const [reviews, setReviews] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  const { markDirty, register } = useSave();
  const toast = useToast();

  const dataRef = useRef({ site, pricing, faq, workflow, reviews, links });
  useEffect(() => {
    dataRef.current = { site, pricing, faq, workflow, reviews, links };
  }, [site, pricing, faq, workflow, reviews, links]);

  useEffect(() => {
    if (authed) loadAllData();
  }, [authed]);

  async function loadAllData() {
    setLoading(true);
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
      const [{ data: siteData }, { data: pricingData }, { data: faqData }, { data: workflowData }, { data: reviewsData }, { data: linksData }] = await Promise.all([
        supabase.from("site_config").select("*"),
        supabase.from("pricing_tiers").select("*").order("sort_order", { ascending: true }),
        supabase.from("faq_items").select("*").order("sort_order", { ascending: true }),
        supabase.from("workflow_steps").select("*").order("sort_order", { ascending: true }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("social_links").select("*").order("sort_order", { ascending: true }),
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
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }

  const contentSaver = useCallback(async () => {
    const { site, pricing, faq, workflow, reviews, links } = dataRef.current;
    const res = await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site, pricing, faq, workflow, reviews, socialLinks: links }),
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
    // Establish an owner session (sets the httpOnly cookie used by moderator APIs).
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "owner", password: pw }),
    });
    if (res.ok) {
      setAuthed(true);
      return;
    }
    if (res.status === 401) {
      toast.error("Incorrect password");
      return;
    }
    // Fallback for local/demo mode (Supabase not configured): use the hardcoded check.
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      toast.error("Incorrect password");
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
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-[500px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.06] blur-[120px]" />
        <form
          onSubmit={doLogin}
          className="ad-panel relative w-full max-w-sm p-8"
        >
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#04060a] shadow-lg shadow-[var(--accent)]/20">
            <LayoutDashboard className="h-7 w-7" />
          </div>
          <h1 className="text-center text-2xl font-bold text-white">Admin Access</h1>
          <p className="mb-6 mt-1.5 text-center text-sm text-[var(--text-dim)]">Enter the admin password to continue.</p>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" autoFocus />
          <Button type="submit" className="mt-4 w-full" size="md">
            Login
          </Button>
          <p className="mt-5 text-center text-xs text-[var(--text-dim)]">Default: blueyadmin</p>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
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
