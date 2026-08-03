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

import { HeroSection } from "@/components/admin/sections/HeroSection";
import { StatsSection } from "@/components/admin/sections/StatsSection";
import { ServicesSection } from "@/components/admin/sections/ServicesSection";
import { BeforeOrderingSection } from "@/components/admin/sections/BeforeOrderingSection";
import { TosSection } from "@/components/admin/sections/TosSection";
import { NavigationSection } from "@/components/admin/sections/NavigationSection";
import { WebsiteSettingsSection } from "@/components/admin/sections/WebsiteSettingsSection";
import { PortfolioCategoriesSection } from "@/components/admin/sections/PortfolioCategoriesSection";
import { CommissionFormSection } from "@/components/admin/sections/CommissionFormSection";
import { MediaLibrarySection } from "@/components/admin/sections/MediaLibrarySection";
import { HomepageSectionsSection } from "@/components/admin/sections/HomepageSectionsSection";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const ADMIN_PASSWORD = "blueyadmin";

const defaultSite = {
  name: "",
  tagline: "",
  description: "",
  discord: "",
};

const defaultPricing: any[] = [];
const defaultFaq: any[] = [];
const defaultWorkflow: any[] = [];
const defaultNavigation = [
  { id: undefined, label: "Work", href: "/", icon: "", is_external: false, is_visible: true },
  { id: undefined, label: "Services", href: "/services", icon: "", is_external: false, is_visible: true },
  { id: undefined, label: "Portfolio", href: "/portfolio", icon: "", is_external: false, is_visible: true },
  { id: undefined, label: "Process", href: "/process", icon: "", is_external: false, is_visible: true },
  { id: undefined, label: "Pricing", href: "/pricing", icon: "", is_external: false, is_visible: true },
  { id: undefined, label: "Before Ordering", href: "/before-ordering", icon: "", is_external: false, is_visible: true },
  { id: undefined, label: "FAQ", href: "/faq", icon: "", is_external: false, is_visible: true },
  { id: undefined, label: "Reviews", href: "/reviews", icon: "", is_external: false, is_visible: true },
  { id: undefined, label: "Contact", href: "/contact", icon: "", is_external: false, is_visible: true },
];

type Tab = "portfolio" | "pricing" | "faq" | "workflow" | "reviews" | "site-images" | "nsfw" | "social-links" | "queue" | "site" | "moderators" | "hero" | "stats" | "services" | "before-ordering" | "tos" | "navigation" | "website-settings" | "portfolio-categories" | "commission-form" | "media-library" | "homepage-sections" | "commissions" | "notifications" | "maintenance" | "changelog" | "roles";

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
  const [hero, setHero] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [beforeOrdering, setBeforeOrdering] = useState<any[]>([]);
  const [tosSections, setTosSections] = useState<any[]>([]);
  const [navigation, setNavigation] = useState<any[]>(defaultNavigation);
  const [websiteSettings, setWebsiteSettings] = useState<Record<string, string>>({});
  const [portfolioCategories, setPortfolioCategories] = useState<any[]>([]);
  const [commissionForm, setCommissionForm] = useState<any[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [homepageSections, setHomepageSections] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState<any>(null);
  const [changelog, setChangelog] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const { markDirty, register } = useSave();
  const toast = useToast();

  const dataRef = useRef({ site, pricing, faq, workflow, reviews, links, hero, stats, services, beforeOrdering, tosSections, navigation, websiteSettings, portfolioCategories, commissionForm, mediaLibrary, homepageSections, commissions, notifications, maintenanceMode, changelog, roles });
  useEffect(() => {
    dataRef.current = { site, pricing, faq, workflow, reviews, links, hero, stats, services, beforeOrdering, tosSections, navigation, websiteSettings, portfolioCategories, commissionForm, mediaLibrary, homepageSections, commissions, notifications, maintenanceMode, changelog, roles };
  }, [site, pricing, faq, workflow, reviews, links, hero, stats, services, beforeOrdering, tosSections, navigation, websiteSettings, portfolioCategories, commissionForm, mediaLibrary, homepageSections, commissions, notifications, maintenanceMode, changelog, roles]);

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
            if (data.hero) setHero(data.hero);
             if (data.stats) setStats(data.stats);
             if (data.services) setServices(data.services);
             if (data.beforeOrdering) setBeforeOrdering(data.beforeOrdering);
            if (data.tosSections) setTosSections(data.tosSections);
            if (data.navigation) setNavigation(data.navigation);
            if (data.websiteSettings) setWebsiteSettings(data.websiteSettings);
            if (data.portfolioCategories) setPortfolioCategories(data.portfolioCategories);
            if (data.commissionForm) setCommissionForm(data.commissionForm);
            if (data.mediaLibrary) setMediaLibrary(data.mediaLibrary);
            if (data.homepageSections) setHomepageSections(data.homepageSections);
          } catch {}
        }
        setLoading(false);
        return;
      }
      const [{ data: siteData }, { data: pricingData }, { data: faqData }, { data: workflowData }, { data: reviewsData }, { data: linksData }, { data: heroData }, { data: statsData }, { data: servicesData }, { data: beforeData }, { data: tosData }, { data: navData }, { data: settingsData }, { data: catsData }, { data: formData }, { data: mediaData }, { data: hsData }] = await Promise.all([
        supabase.from("site_config").select("*"),
        supabase.from("pricing_tiers").select("*").order("sort_order", { ascending: true }),
        supabase.from("faq_items").select("*").order("sort_order", { ascending: true }),
        supabase.from("workflow_steps").select("*").order("sort_order", { ascending: true }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("social_links").select("*").order("sort_order", { ascending: true }),
        supabase.from("hero_content").select("*").order("sort_order", { ascending: true }),
        supabase.from("homepage_stats").select("*").order("sort_order", { ascending: true }),
        supabase.from("services").select("*").order("sort_order", { ascending: true }),
        supabase.from("before_ordering_items").select("*").order("sort_order", { ascending: true }),
        supabase.from("tos_sections").select("*").order("sort_order", { ascending: true }),
        supabase.from("navigation_items").select("*").order("sort_order", { ascending: true }),
        supabase.from("website_settings").select("*"),
        supabase.from("portfolio_categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("commission_form_fields").select("*").order("sort_order", { ascending: true }),
        supabase.from("media_library").select("*").order("sort_order", { ascending: true }),
        supabase.from("homepage_sections").select("*").order("sort_order", { ascending: true }),
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
      if (heroData && heroData.length > 0) setHero(heroData);
      if (statsData && statsData.length > 0) setStats(statsData);
      if (servicesData && servicesData.length > 0) setServices(servicesData);
      if (beforeData && beforeData.length > 0) setBeforeOrdering(beforeData);
      if (tosData && tosData.length > 0) setTosSections(tosData);
      if (navData && navData.length > 0) setNavigation(navData);
      if (settingsData && settingsData.length > 0) {
        const s: Record<string, string> = {};
        settingsData.forEach((row: any) => { s[row.key] = row.value; });
        setWebsiteSettings(s);
      }
      if (catsData && catsData.length > 0) setPortfolioCategories(catsData);
      if (formData && formData.length > 0) setCommissionForm(formData);
      if (mediaData && mediaData.length > 0) setMediaLibrary(mediaData);
      if (hsData && hsData.length > 0) setHomepageSections(hsData);
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }

  const contentSaver = useCallback(async () => {
     const { site, pricing, faq, workflow, reviews, links, hero, stats, services, beforeOrdering, tosSections, navigation, websiteSettings, portfolioCategories, commissionForm, mediaLibrary, homepageSections, commissions, notifications, maintenanceMode, changelog, roles } = dataRef.current;
    const res = await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site, pricing, faq, workflow, reviews, socialLinks: links, hero, stats, services, beforeOrdering, tosSections, navigation, websiteSettings, portfolioCategories, commissionForm, mediaLibrary, homepageSections, commissions, notifications, maintenanceMode, changelog, roles }),
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
    setHero([]);
    setStats([]);
     setServices([]);
     setBeforeOrdering([]);
    setTosSections([]);
    setNavigation([]);
    setWebsiteSettings({});
    setPortfolioCategories([]);
    setCommissionForm([]);
    setMediaLibrary([]);
    setHomepageSections([]);
    setCommissions([]);
    setNotifications([]);
    setMaintenanceMode(null);
    setChangelog([]);
    setRoles([]);
    localStorage.removeItem("adminData");
    setResetOpen(false);
    toast.info("Content reset to defaults â press Save Changes to apply");
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

  if (!isSupabaseConfigured) {
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
        <div className="ad-panel rounded-xl border border-[var(--warning-border)] bg-[var(--warning-soft)] p-6">
          <h2 className="text-lg font-bold text-white">Supabase Not Configured</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Your admin changes cannot be saved because Supabase credentials are missing. Create a <code className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-xs text-[var(--accent)]">.env.local</code> file with your Supabase URL, anon key, and service role key.
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Without Supabase, changes you make here will not persist and may be lost when you navigate away.
          </p>
        </div>
      </DashboardLayout>
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
      {tab === "hero" && <HeroSection value={hero} onChange={(n) => { setHero(n); markDirty(); }} />}
      {tab === "stats" && <StatsSection value={stats} onChange={(n) => { setStats(n); markDirty(); }} />}
      {tab === "services" && <ServicesSection value={services} onChange={(n) => { setServices(n); markDirty(); }} />}
      {tab === "before-ordering" && <BeforeOrderingSection value={beforeOrdering} onChange={(n) => { setBeforeOrdering(n); markDirty(); }} />}
      {tab === "tos" && (
        <TosSection
          value={tosSections}
          onChange={(n) => { setTosSections(n); markDirty(); }}
          siteValue={site}
          onSiteChange={(siteUpdate) => { setSite(siteUpdate); markDirty(); }}
        />
      )}
      {tab === "navigation" && <NavigationSection value={navigation} onChange={(n) => { setNavigation(n); markDirty(); }} />}
      {tab === "website-settings" && <WebsiteSettingsSection value={websiteSettings} onChange={(n) => { setWebsiteSettings(n); markDirty(); }} />}
      {tab === "portfolio-categories" && <PortfolioCategoriesSection value={portfolioCategories} onChange={(n) => { setPortfolioCategories(n); markDirty(); }} />}
      {tab === "commission-form" && <CommissionFormSection value={commissionForm} onChange={(n) => { setCommissionForm(n); markDirty(); }} />}
      {tab === "media-library" && <MediaLibrarySection value={mediaLibrary} onChange={(n) => { setMediaLibrary(n); markDirty(); }} />}
      {tab === "homepage-sections" && <HomepageSectionsSection value={homepageSections} onChange={(n) => { setHomepageSections(n); markDirty(); }} />}
      {tab === "commissions" && <div className="ad-panel rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"><h2 className="text-lg font-bold text-white">Commissions</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">Commission management coming soon. Use the API routes for now.</p></div>}
      {tab === "notifications" && <div className="ad-panel rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"><h2 className="text-lg font-bold text-white">Notifications</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">Notification settings coming soon. Configure webhooks via the API.</p></div>}
      {tab === "maintenance" && <div className="ad-panel rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"><h2 className="text-lg font-bold text-white">Maintenance Mode</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">Maintenance mode configuration coming soon. Use the API to enable/disable.</p></div>}
      {tab === "changelog" && <div className="ad-panel rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"><h2 className="text-lg font-bold text-white">Changelog</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">Changelog management coming soon. Use the API to add entries.</p></div>}
      {tab === "roles" && <div className="ad-panel rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"><h2 className="text-lg font-bold text-white">Roles</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">Role management coming soon. Default roles are seeded in the database.</p></div>}

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