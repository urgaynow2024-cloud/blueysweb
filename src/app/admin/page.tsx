"use client";

import { useState, useEffect } from "react";
import PortfolioAdmin from "@/components/PortfolioAdmin";
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

const defaultReviews: any[] = [];

type Tab = "portfolio" | "pricing" | "faq" | "workflow" | "reviews" | "site";

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
        <div className="text-white text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin</h1>
            <p className="text-sm text-[var(--text-dim)] mt-1">
              {isSupabaseConfigured ? "Changes sync to Supabase." : "Supabase not configured — saving to localStorage."}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={saveAll} className="btn-primary !text-sm !py-2 !px-4">
              {saved ? "Saved ✓" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-8 border-b border-[var(--border)] overflow-x-auto">
          {[
            { id: "portfolio", label: "Portfolio" },
            { id: "pricing", label: "Pricing" },
            { id: "faq", label: "FAQ" },
            { id: "workflow", label: "Process" },
            { id: "reviews", label: "Reviews" },
            { id: "site", label: "Site" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "text-white border-b-2 border-[var(--accent)]" : "text-[var(--text-dim)] hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {tab === "portfolio" && (
              <PortfolioAdmin />
            )}

            {tab === "pricing" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Pricing Tiers</h2>
                  <button onClick={() => setPricing([...pricing, { id: undefined, name: "New Tier", emoji: "✨", price: "£XX - £XX", badge: null, popular: false, features: [] }])} className="btn-primary !text-sm !py-2 !px-4">+ Add</button>
                </div>
                {pricing.map((tier, i) => (
                  <div key={tier.id || i} className="glass rounded-2xl p-6 space-y-4 border border-[var(--border)]">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-white">Tier {i + 1}</h3>
                      <button onClick={() => setPricing(pricing.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Name</label>
                        <input value={tier.name} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], name: e.target.value }; setPricing(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Price</label>
                        <input value={tier.price} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], price: e.target.value }; setPricing(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Emoji</label>
                        <input value={tier.emoji} onChange={(e) => { const arr = [...pricing]; arr[i] = { ...arr[i], emoji: e.target.value }; setPricing(arr); }} className="field" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Features (one per line)</label>
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
                  <div key={item.id || i} className="glass rounded-2xl p-6 space-y-4 border border-[var(--border)]">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-white">Question {i + 1}</h3>
                      <button onClick={() => setFaq(faq.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Question</label>
                      <input value={item.question} onChange={(e) => { const arr = [...faq]; arr[i] = { ...arr[i], question: e.target.value }; setFaq(arr); }} className="field" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Answer</label>
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
                  <button onClick={() => setWorkflow([...workflow, { id: undefined, emoji: "📝", title: "New Step", desc: "Description here." }])} className="btn-primary !text-sm !py-2 !px-4">+ Add</button>
                </div>
                {workflow.map((step, i) => (
                  <div key={step.id || i} className="glass rounded-2xl p-6 space-y-4 border border-[var(--border)]">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-white">Step {i + 1}</h3>
                      <button onClick={() => setWorkflow(workflow.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Emoji</label>
                        <input value={step.emoji} onChange={(e) => { const arr = [...workflow]; arr[i] = { ...arr[i], emoji: e.target.value }; setWorkflow(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Title</label>
                        <input value={step.title} onChange={(e) => { const arr = [...workflow]; arr[i] = { ...arr[i], title: e.target.value }; setWorkflow(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Description</label>
                        <input value={step.desc} onChange={(e) => { const arr = [...workflow]; arr[i] = { ...arr[i], desc: e.target.value }; setWorkflow(arr); }} className="field" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Client Reviews</h2>
                  <button onClick={() => setReviews([...reviews, { id: undefined, name: "", avatar: "🎭", text: "", project: "" }])} className="btn-primary !text-sm !py-2 !px-4">+ Add Review</button>
                </div>
                {reviews.map((review, i) => (
                  <div key={review.id || i} className="glass rounded-2xl p-6 space-y-4 border border-[var(--border)]">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-white">Review {i + 1}</h3>
                      <button onClick={() => setReviews(reviews.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Client Name</label>
                        <input value={review.name} onChange={(e) => { const arr = [...reviews]; arr[i] = { ...arr[i], name: e.target.value }; setReviews(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Avatar / Emoji</label>
                        <input value={review.avatar} onChange={(e) => { const arr = [...reviews]; arr[i] = { ...arr[i], avatar: e.target.value }; setReviews(arr); }} className="field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Project Type</label>
                        <input value={review.project} onChange={(e) => { const arr = [...reviews]; arr[i] = { ...arr[i], project: e.target.value }; setReviews(arr); }} className="field" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Review Text</label>
                      <textarea rows={3} value={review.text} onChange={(e) => { const arr = [...reviews]; arr[i] = { ...arr[i], text: e.target.value }; setReviews(arr); }} className="field resize-y" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "site" && (
              <div className="glass rounded-2xl p-7 space-y-5 border border-[var(--border)]">
                <h2 className="text-lg font-semibold text-white mb-4">Site Information</h2>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Site Name</label>
                  <input value={site.name} onChange={(e) => setSite({ ...site, name: e.target.value })} className="field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Tagline</label>
                  <input value={site.tagline} onChange={(e) => setSite({ ...site, tagline: e.target.value })} className="field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Description</label>
                  <textarea rows={3} value={site.description} onChange={(e) => setSite({ ...site, description: e.target.value })} className="field resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Discord</label>
                  <input value={site.discord} onChange={(e) => setSite({ ...site, discord: e.target.value })} className="field" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-6 border border-[var(--border)]">
              <h3 className="text-sm font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2.5">
                <button onClick={saveAll} className="w-full btn-primary !text-sm !py-2.5">{saved ? "Saved ✓" : "Save All Changes"}</button>
                <button onClick={resetAll} className="w-full !text-sm !py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">Reset to Defaults</button>
                <button onClick={() => setAuthed(false)} className="w-full !text-sm !py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-dim)] hover:text-white transition-all">Logout</button>
              </div>
            </div>

            {saved && (
              <div className="glass rounded-2xl p-4 text-center border border-[var(--border)]">
                <p className="text-sm text-green-400 font-medium">All changes saved successfully</p>
              </div>
            )}

            <div className="glass rounded-2xl p-6 border border-[var(--border)]">
              <h3 className="text-sm font-bold text-white mb-3">Notes</h3>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                {isSupabaseConfigured ? "Images and data are saved to Supabase." : "Supabase not configured. Add your credentials in .env.local to enable cloud sync and image uploads."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
