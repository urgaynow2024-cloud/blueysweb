"use client";

import { useState, useEffect, useRef } from "react";
import PortfolioAdmin from "@/components/PortfolioAdmin";
import { Star, CheckCircle2, Trash2, Edit2, ChevronRight, Settings, ImageIcon, Tag, HelpCircle, Save, RotateCcw, LogOut, Link as LinkIcon, Loader2, X, LayoutDashboard, BarChart3 } from "lucide-react";
import StarRating from "@/components/StarRating";
import SiteImagesAdmin from "@/components/SiteImagesAdmin";
import NsfwPortfolioAdmin from "@/components/NsfwPortfolioAdmin";
import SocialLinksAdmin from "@/components/SocialLinksAdmin";
import QueueAdmin from "@/components/QueueAdmin";
import { uploadImage, approveReview, updateReview, deleteReview } from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function ReviewCard({ review, index, reviews, setReviews }: { review: any; index: number; reviews: any[]; setReviews: React.Dispatch<React.SetStateAction<any[]>> }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: review.display_name,
    review_text: review.review_text,
    rating: review.rating,
    image_url: review.image_url || null,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleApprove() {
    const result = await approveReview(review.id);
    if (result) {
      setReviews(reviews.map((r) => (r.id === review.id ? { ...r, status: "approved" } : r)));
    }
  }

  async function handleEdit() {
    const result = await updateReview(review.id, editData);
    if (result) {
      setReviews(reviews.map((r) => (r.id === review.id ? { ...r, ...editData } : r)));
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this review permanently?")) return;
    const result = await deleteReview(review.id);
    if (result) {
      setReviews(reviews.filter((r) => r.id !== review.id));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file");
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, "reviews");
      if (url) {
        setEditData((d) => ({ ...d, image_url: url }));
      } else {
        alert("Image upload failed. Check Supabase configuration.");
      }
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:border-[var(--border-hover)]">
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${review.status === "approved" ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>
          {review.status === "approved" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <div className="h-3.5 w-3.5 animate-pulse rounded-full border-2 border-current" />}
          {review.status === "approved" ? "Approved" : "Pending"}
        </span>
        <div className="flex gap-2">
          {review.status !== "approved" && (
            <button onClick={handleApprove} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/5 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/10 hover:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </button>
          )}
          <button onClick={() => setEditing(!editing)} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/5 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition-all hover:bg-[var(--accent)]/10">
            <Edit2 className="h-3.5 w-3.5" /> {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={handleDelete} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/10">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">Name</label>
              <input value={editData.display_name} onChange={(e) => setEditData({ ...editData, display_name: e.target.value })} className="field" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">Rating</label>
            <StarRating value={editData.rating || 5} onChange={(val) => setEditData({ ...editData, rating: val })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">Review</label>
            <textarea rows={3} value={editData.review_text} onChange={(e) => setEditData({ ...editData, review_text: e.target.value })} className="field resize-y" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">Review image (optional)</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {editData.image_url ? (
              <div className="group relative">
                <img src={editData.image_url} alt="Review preview" className="h-40 w-full rounded-xl border border-[var(--border)] object-cover" />
                <button
                  type="button"
                  onClick={() => setEditData((d) => ({ ...d, image_url: null }))}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage || !isSupabaseConfigured}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-5 py-6 text-center text-[var(--text-dim)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-secondary)] disabled:opacity-50"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                    <span className="text-sm">Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-sm">Click to add an image</span>
                  </>
                )}
              </button>
            )}
            {!isSupabaseConfigured && <p className="mt-1.5 text-xs text-[var(--text-dim)]">Image upload requires Supabase configuration</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleEdit} className="btn-primary !px-5 !py-2 !text-sm">Save</button>
            <button onClick={() => setEditing(false)} className="btn-secondary !px-5 !py-2 !text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-lg">
              {review.display_name?.[0]?.toUpperCase() || "★"}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{review.display_name}</p>
              <div className="mt-0.5 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i <= (review.rating || 5) ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--text-dim)]"}`} />
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">"{review.review_text}"</p>
          {review.image_url && (
            <img src={review.image_url} alt="Review" className="mt-3 h-40 w-full rounded-xl border border-[var(--border)] object-cover" />
          )}
        </div>
      )}
    </div>
  );
}

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

const defaultReviews: any[] = [];

type Tab = "portfolio" | "pricing" | "faq" | "workflow" | "reviews" | "site" | "site-images" | "nsfw" | "social-links" | "queue";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "portfolio", label: "Portfolio", icon: <ImageIcon className="h-4 w-4" /> },
  { id: "pricing", label: "Pricing", icon: <Tag className="h-4 w-4" /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "workflow", label: "Process", icon: <ChevronRight className="h-4 w-4" /> },
  { id: "reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
  { id: "site-images", label: "Site Images", icon: <ImageIcon className="h-4 w-4" /> },
  { id: "nsfw", label: "NSFW Content", icon: <ImageIcon className="h-4 w-4" /> },
  { id: "social-links", label: "Links", icon: <LinkIcon className="h-4 w-4" /> },
  { id: "queue", label: "Queue", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "site", label: "Site Info", icon: <Settings className="h-4 w-4" /> },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<Tab>("portfolio");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [site, setSite] = useState(defaultSite);
  const [pricing, setPricing] = useState<any[]>(defaultPricing);
  const [faq, setFaq] = useState<any[]>(defaultFaq);
  const [workflow, setWorkflow] = useState<any[]>(defaultWorkflow);
  const [reviews, setReviews] = useState<any[]>(defaultReviews);
  const [links, setLinks] = useState<any[]>([]);

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
          } catch (e) {}
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

  const saveAll = async () => {
    setSaved(false);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, pricing, faq, workflow, reviews, socialLinks: links }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Save failed");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      console.error("Save failed:", e);
      alert(e.message || "Save failed. Check console.");
    }
  };

  const resetAll = () => {
    if (!confirm("Reset all data to defaults? This cannot be undone.")) return;
    setSite(defaultSite);
    setPricing(defaultPricing);
    setFaq(defaultFaq);
    setWorkflow(defaultWorkflow);
    setReviews(defaultReviews);
    localStorage.removeItem("adminData");
    saveAll();
  };

  if (!authed) {
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-[500px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.06] blur-[120px]" />
        <form
          onSubmit={(e) => { e.preventDefault(); if (pw === ADMIN_PASSWORD) setAuthed(true); else alert("Wrong password"); }}
          className="relative w-full max-w-sm rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-2xl shadow-black/40"
        >
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#04060a] shadow-lg shadow-[var(--accent)]/20">
            <LayoutDashboard className="h-7 w-7" />
          </div>
          <h1 className="text-center text-2xl font-bold text-white">Admin Access</h1>
          <p className="mb-6 mt-1.5 text-center text-sm text-[var(--text-dim)]">Enter the admin password to continue.</p>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="field mb-4" />
          <button type="submit" className="btn-primary w-full">Login</button>
          <p className="mt-5 text-center text-xs text-[var(--text-dim)]">Default: blueyadmin</p>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-2 text-sm text-white">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" /> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#04060a]">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Admin Dashboard</h1>
            </div>
            <p className="text-sm text-[var(--text-dim)]">
              {isSupabaseConfigured ? "Changes sync to Supabase." : "Supabase not configured — saving to localStorage."}
            </p>
          </div>
          <button onClick={saveAll} disabled={saved} className="btn-primary !px-5 !py-2.5 !text-sm inline-flex items-center gap-2 disabled:opacity-60">
            {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 xl:col-span-3">
            <div className="lg:sticky lg:top-6">
              <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0 lg:-mx-1 lg:px-1">
                {tabs.map((t) => {
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      aria-current={active ? "page" : undefined}
                      className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-4)] text-[#04060a] shadow-lg shadow-[var(--accent)]/20"
                          : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-white"
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-4 space-y-2 lg:mt-5">
                <button onClick={saveAll} disabled={saved} className="btn-secondary w-full !px-4 !py-2.5 !text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  <Save className="h-4 w-4" /> {saved ? "Saved" : "Save All"}
                </button>
                <button onClick={resetAll} className="w-full !rounded-xl !py-2.5 !text-sm inline-flex items-center justify-center gap-2 border border-red-500/20 text-red-400 transition-all hover:border-red-500/30 hover:bg-red-500/10">
                  <RotateCcw className="h-4 w-4" /> Reset Defaults
                </button>
                <button onClick={() => { localStorage.removeItem("adminData"); setAuthed(false); }} className="w-full !rounded-xl !py-2.5 !text-sm inline-flex items-center justify-center gap-2 border border-[var(--border)] text-[var(--text-dim)] transition-all hover:border-[var(--border-hover)] hover:text-white">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 xl:col-span-9">
            {tab === "portfolio" && <PortfolioAdmin />}

            {tab === "pricing" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Pricing Tiers</h2>
                  <button onClick={() => setPricing([...pricing, { id: undefined, name: "New Tier", emoji: "✨", price: "£XX - £XX", badge: null, popular: false, features: [] }])} className="btn-primary !px-4 !py-2 !text-sm">+ Add Tier</button>
                </div>
                {pricing.map((tier, i) => (
                  <div key={tier.id || i} className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:border-[var(--border-hover)]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Tier {i + 1}</h3>
                      <button onClick={() => setPricing(pricing.filter((_, j) => j !== i))} className="rounded-lg bg-red-500/5 px-3 py-1.5 text-xs text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300">Remove</button>
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Name</label>
                        <input value={tier.name} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], name: e.target.value }; setPricing(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Price</label>
                        <input value={tier.price} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], price: e.target.value }; setPricing(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Emoji</label>
                        <input value={tier.emoji} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], emoji: e.target.value }; setPricing(arr); }} className="field" />
                      </div>
                    </div>
                    <div className="mt-5">
                      <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Features (one per line)</label>
                      <textarea rows={4} value={tier.features?.join("\n")} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], features: e.target.value.split("\n").filter(Boolean) }; setPricing(arr); }} className="field resize-y" />
                      <div className="mt-4 flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`nsfw-${i}`}
                          checked={tier.is_nsfw || false}
                          onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], is_nsfw: e.target.checked }; setPricing(arr); }}
                          className="h-4 w-4 rounded border-[var(--border)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                        <label htmlFor={`nsfw-${i}`} className="text-xs font-semibold text-[var(--text-secondary)]">NSFW Pricing Tier (18+ only)</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "faq" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">FAQ Items</h2>
                  <button onClick={() => setFaq([...faq, { id: undefined, question: "New question?", answer: "New answer." }])} className="btn-primary !px-4 !py-2 !text-sm">+ Add</button>
                </div>
                {faq.map((item, i) => (
                  <div key={item.id || i} className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:border-[var(--border-hover)]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Question {i + 1}</h3>
                      <button onClick={() => setFaq(faq.filter((_, j) => j !== i))} className="rounded-lg bg-red-500/5 px-3 py-1.5 text-xs text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300">Remove</button>
                    </div>
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Question</label>
                        <input value={item.question} onChange={(e) => { const arr = [...faq]; arr[i] = { ...arr[i], question: e.target.value }; setFaq(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Answer</label>
                        <textarea rows={3} value={item.answer} onChange={(e) => { const arr = [...faq]; arr[i] = { ...arr[i], answer: e.target.value }; setFaq(arr); }} className="field resize-y" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "workflow" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Process Steps</h2>
                  <button onClick={() => setWorkflow([...workflow, { id: undefined, emoji: "📝", title: "New Step", desc: "Description here." }])} className="btn-primary !px-4 !py-2 !text-sm">+ Add Step</button>
                </div>
                {workflow.map((step, i) => (
                  <div key={step.id || i} className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:border-[var(--border-hover)]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Step {i + 1}</h3>
                      <button onClick={() => setWorkflow(workflow.filter((_, j) => j !== i))} className="rounded-lg bg-red-500/5 px-3 py-1.5 text-xs text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300">Remove</button>
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Emoji</label>
                        <input value={step.emoji} onChange={(e) => { const arr = [...workflow]; arr[i] = { ...arr[i], emoji: e.target.value }; setWorkflow(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Title</label>
                        <input value={step.title} onChange={(e) => { const arr = [...workflow]; arr[i] = { ...arr[i], title: e.target.value }; setWorkflow(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Description</label>
                        <input value={step.desc} onChange={(e) => { const arr = [...workflow]; arr[i] = { ...arr[i], desc: e.target.value }; setWorkflow(arr); }} className="field" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white">Client Reviews</h2>

                <div>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Pending ({reviews.filter((r: any) => r.status === "pending").length})</h3>
                  <div className="space-y-4">
                    {reviews.filter((r: any) => r.status === "pending").length > 0 ? (
                      reviews.filter((r: any) => r.status === "pending").map((review, idx) => (
                        <ReviewCard key={review.id || idx} review={review} index={idx} reviews={reviews} setReviews={setReviews} />
                      ))
                    ) : (
                      <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
                        <p className="text-sm text-[var(--text-dim)]">No pending reviews</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Approved ({reviews.filter((r: any) => r.status === "approved").length})</h3>
                  <div className="space-y-4">
                    {reviews.filter((r: any) => r.status === "approved").length > 0 ? (
                      reviews.filter((r: any) => r.status === "approved").map((review, idx) => (
                        <ReviewCard key={review.id || idx} review={review} index={idx} reviews={reviews} setReviews={setReviews} />
                      ))
                    ) : (
                      <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
                        <p className="text-sm text-[var(--text-dim)]">No approved reviews yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === "site-images" && <SiteImagesAdmin />}

            {tab === "nsfw" && <NsfwPortfolioAdmin />}

            {tab === "social-links" && <SocialLinksAdmin />}

            {tab === "queue" && <QueueAdmin />}

            {tab === "site" && (
              <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7">
                <h2 className="mb-6 text-lg font-semibold text-white">Site Information</h2>
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Site Name</label>
                    <input value={site.name} onChange={(e) => setSite({ ...site, name: e.target.value })} className="field" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Tagline</label>
                    <input value={site.tagline} onChange={(e) => setSite({ ...site, tagline: e.target.value })} className="field" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Description</label>
                    <textarea rows={3} value={site.description} onChange={(e) => setSite({ ...site, description: e.target.value })} className="field resize-y" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">Discord</label>
                    <input value={site.discord} onChange={(e) => setSite({ ...site, discord: e.target.value })} className="field" />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
