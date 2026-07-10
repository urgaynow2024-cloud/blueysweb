"use client";

import { useState, useEffect } from "react";
import PortfolioAdmin from "@/components/PortfolioAdmin";
import { Star, CheckCircle2, Trash2, Edit2, ChevronRight, Settings, ImageIcon, Tag, HelpCircle, BarChart3, Save, RotateCcw, LogOut } from "lucide-react";
import StarRating from "@/components/StarRating";
import { uploadImage, approveReview, updateReview, deleteReview } from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function ReviewCard({ review, index, reviews, setReviews }: { review: any; index: number; reviews: any[]; setReviews: React.Dispatch<React.SetStateAction<any[]>> }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: review.name, text: review.text, star_rating: review.star_rating, project: review.project });

  async function handleApprove() {
    const result = await approveReview(review.id);
    if (result) {
      setReviews(reviews.map((r) => (r.id === review.id ? { ...r, approved: true } : r)));
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

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-6 space-y-4 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300">
      <div className="flex justify-between items-start">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${review.approved ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
          {review.approved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current animate-pulse" />}
          {review.approved ? "Approved" : "Pending"}
        </span>
        <div className="flex gap-2">
          {!review.approved && (
            <button onClick={handleApprove} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </button>
          )}
          <button onClick={() => setEditing(!editing)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:text-white bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 px-3 py-1.5 rounded-lg transition-all">
            <Edit2 className="w-3.5 h-3.5" /> {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={handleDelete} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-white bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Name</label>
              <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="field" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Project</label>
              <input value={editData.project || ""} onChange={(e) => setEditData({ ...editData, project: e.target.value })} className="field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Rating</label>
            <StarRating value={editData.star_rating || 5} onChange={(val) => setEditData({ ...editData, star_rating: val })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Review</label>
            <textarea rows={3} value={editData.text} onChange={(e) => setEditData({ ...editData, text: e.target.value })} className="field resize-y" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleEdit} className="btn-primary !text-sm !py-2 !px-5">Save</button>
            <button onClick={() => setEditing(false)} className="btn-secondary !text-sm !py-2 !px-5">Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">🎭</div>
            <div>
              <p className="font-bold text-white text-sm">{review.name}</p>
              {review.project && <p className="text-xs text-[var(--text-dim)]">{review.project}</p>}
              <div className="flex gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i <= (review.star_rating || 5) ? "text-[var(--accent)] fill-[var(--accent)]" : "text-[var(--text-dim)]"}`} />
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">"{review.text}"</p>
          {review.image_url && (
            <div className="mt-3">
              <img src={review.image_url} alt="Review" className="w-full h-40 object-cover rounded-xl border border-[var(--border)]" />
            </div>
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

type Tab = "portfolio" | "pricing" | "faq" | "workflow" | "reviews" | "site";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "portfolio", label: "Portfolio", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "pricing", label: "Pricing", icon: <Tag className="w-4 h-4" /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
  { id: "workflow", label: "Process", icon: <ChevronRight className="w-4 h-4" /> },
  { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
  { id: "site", label: "Site", icon: <Settings className="w-4 h-4" /> },
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

      const [{ data: siteData }, { data: pricingData }, { data: faqData }, { data: workflowData }, { data: reviewsData }] = await Promise.all([
        supabase.from("site_config").select("*"),
        supabase.from("pricing_tiers").select("*").order("sort_order", { ascending: true }),
        supabase.from("faq_items").select("*").order("sort_order", { ascending: true }),
        supabase.from("workflow_steps").select("*").order("sort_order", { ascending: true }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
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
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }

  const saveAll = async () => {
    setSaved(false);
    try {
      if (!isSupabaseConfigured || !supabase) {
        localStorage.setItem("adminData", JSON.stringify({ site, pricing, faq, workflow, reviews, updatedAt: new Date().toISOString() }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        return;
      }

      const siteRows = Object.entries(site).map(([key, value]) => ({ key, value: String(value) }));
      await supabase.from("site_config").upsert(siteRows, { onConflict: "key" });

      await supabase.from("pricing_tiers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      for (const item of pricing) {
        await supabase.from("pricing_tiers").upsert({ ...item, id: item.id || undefined });
      }

      await supabase.from("faq_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      for (const item of faq) {
        await supabase.from("faq_items").upsert({ ...item, id: item.id || undefined });
      }

      await supabase.from("workflow_steps").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      for (const item of workflow) {
        await supabase.from("workflow_steps").upsert({ ...item, id: item.id || undefined });
      }

      await supabase.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      for (const item of reviews) {
        await supabase.from("reviews").upsert({ ...item, id: item.id || undefined });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Save failed:", e);
      alert("Save failed. Check console.");
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
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={(e) => { e.preventDefault(); if (pw === ADMIN_PASSWORD) setAuthed(true); else alert("Wrong password"); }} className="glass rounded-2xl p-8 w-full max-w-sm border border-[var(--border)]">
          <h1 className="text-2xl font-bold text-white mb-2">Admin</h1>
          <p className="text-sm text-[var(--text-dim)] mb-6">Enter the admin password to continue.</p>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="field mb-4" />
          <button type="submit" className="w-full btn-primary">Login</button>
          <p className="text-center text-xs text-[var(--text-dim)] mt-4">Default: blueyadmin</p>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-sm flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin</h1>
            <p className="text-sm text-[var(--text-dim)] mt-1">
              {isSupabaseConfigured ? "Changes sync to Supabase." : "Supabase not configured — saving to localStorage."}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={saveAll} disabled={saved} className="btn-primary !text-sm !py-2 !px-4 inline-flex items-center gap-2">
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 xl:col-span-3">
            <div className="lg:sticky lg:top-24">
              <nav className="space-y-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "bg-[var(--accent)] text-[#05070a] shadow-lg shadow-[var(--accent)]/20" : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"}`}
                  >
                    {t.icon}
                    {t.label}
                    {tab === t.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </nav>

              <div className="mt-6 space-y-2">
                <button onClick={saveAll} disabled={saved} className="w-full btn-secondary !text-sm !py-2.5 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {saved ? "Saved" : "Save All"}
                </button>
                <button onClick={resetAll} className="w-full !text-sm !py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Reset Defaults
                </button>
                <button onClick={() => { localStorage.removeItem("adminData"); setAuthed(false); }} className="w-full !text-sm !py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-dim)] hover:text-white hover:border-[var(--border-hover)] transition-all flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 xl:col-span-9">
            {tab === "portfolio" && <PortfolioAdmin />}

            {tab === "pricing" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Pricing Tiers</h2>
                  <button onClick={() => setPricing([...pricing, { id: undefined, name: "New Tier", emoji: "✨", price: "£XX - £XX", badge: null, popular: false, features: [] }])} className="btn-primary !text-sm !py-2 !px-4">+ Add Tier</button>
                </div>
                {pricing.map((tier, i) => (
                  <div key={tier.id || i} className="bg-[var(--bg-card)] rounded-2xl p-6 space-y-4 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-white">Tier {i + 1}</h3>
                      <button onClick={() => setPricing(pricing.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Name</label>
                        <input value={tier.name} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], name: e.target.value }; setPricing(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Price</label>
                        <input value={tier.price} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], price: e.target.value }; setPricing(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Emoji</label>
                        <input value={tier.emoji} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], emoji: e.target.value }; setPricing(arr); }} className="field" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Features (one per line)</label>
                      <textarea rows={4} value={tier.features?.join("\n")} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], features: e.target.value.split("\n").filter(Boolean) }; setPricing(arr); }} className="field resize-y" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "faq" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">FAQ Items</h2>
                  <button onClick={() => setFaq([...faq, { id: undefined, question: "New question?", answer: "New answer." }])} className="btn-primary !text-sm !py-2 !px-4">+ Add</button>
                </div>
                {faq.map((item, i) => (
                  <div key={item.id || i} className="bg-[var(--bg-card)] rounded-2xl p-6 space-y-4 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-white">Question {i + 1}</h3>
                      <button onClick={() => setFaq(faq.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all">Remove</button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Question</label>
                      <input value={item.question} onChange={(e) => { const arr = [...faq]; arr[i] = { ...arr[i], question: e.target.value }; setFaq(arr); }} className="field" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Answer</label>
                      <textarea rows={3} value={item.answer} onChange={(e) => { const arr = [...faq]; arr[i] = { ...arr[i], answer: e.target.value }; setFaq(arr); }} className="field resize-y" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "workflow" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Process Steps</h2>
                  <button onClick={() => setWorkflow([...workflow, { id: undefined, emoji: "📝", title: "New Step", desc: "Description here." }])} className="btn-primary !text-sm !py-2 !px-4">+ Add Step</button>
                </div>
                {workflow.map((step, i) => (
                  <div key={step.id || i} className="bg-[var(--bg-card)] rounded-2xl p-6 space-y-4 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-white">Step {i + 1}</h3>
                      <button onClick={() => setWorkflow(workflow.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Emoji</label>
                        <input value={step.emoji} onChange={(e) => { const arr = [...workflow]; arr[i] = { ...arr[i], emoji: e.target.value }; setWorkflow(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Title</label>
                        <input value={step.title} onChange={(e) => { const arr = [...workflow]; arr[i] = { ...arr[i], title: e.target.value }; setWorkflow(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Description</label>
                        <input value={step.desc} onChange={(e) => { const arr = [...workflow]; arr[i] = { ...arr[i], desc: e.target.value }; setWorkflow(arr); }} className="field" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Client Reviews</h2>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">Pending Approval ({reviews.filter((r: any) => !r.approved).length})</h3>
                  <div className="space-y-4">
                    {reviews.filter((r: any) => !r.approved).length > 0 ? (
                      reviews.filter((r: any) => !r.approved).map((review, idx) => (
                        <ReviewCard key={review.id || idx} review={review} index={idx} reviews={reviews} setReviews={setReviews} />
                      ))
                    ) : (
                      <div className="bg-[var(--bg-card)] rounded-2xl p-8 text-center border border-[var(--border)]">
                        <p className="text-sm text-[var(--text-dim)]">No pending reviews</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">Approved ({reviews.filter((r: any) => r.approved).length})</h3>
                  <div className="space-y-4">
                    {reviews.filter((r: any) => r.approved).length > 0 ? (
                      reviews.filter((r: any) => r.approved).map((review, idx) => (
                        <ReviewCard key={review.id || idx} review={review} index={idx} reviews={reviews} setReviews={setReviews} />
                      ))
                    ) : (
                      <div className="bg-[var(--bg-card)] rounded-2xl p-8 text-center border border-[var(--border)]">
                        <p className="text-sm text-[var(--text-dim)]">No approved reviews yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === "site" && (
              <div className="bg-[var(--bg-card)] rounded-2xl p-7 space-y-5 border border-[var(--border)]">
                <h2 className="text-lg font-semibold text-white mb-4">Site Information</h2>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Site Name</label>
                  <input value={site.name} onChange={(e) => setSite({ ...site, name: e.target.value })} className="field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Tagline</label>
                  <input value={site.tagline} onChange={(e) => setSite({ ...site, tagline: e.target.value })} className="field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Description</label>
                  <textarea rows={3} value={site.description} onChange={(e) => setSite({ ...site, description: e.target.value })} className="field resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Discord</label>
                  <input value={site.discord} onChange={(e) => setSite({ ...site, discord: e.target.value })} className="field" />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
