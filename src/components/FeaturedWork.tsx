"use client";

import { useState, useEffect } from "react";
import { commissions as staticCommissions } from "@/data/site";
import ShowcaseCard from "@/components/ShowcaseCard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function FeaturedWork() {
  const [items, setItems] = useState(staticCommissions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (!isSupabaseConfigured || !supabase) {
          const stored = localStorage.getItem("adminData");
          if (stored) {
            try {
              const data = JSON.parse(stored);
              if (data.commissions && data.commissions.length > 0) {
                setItems(data.commissions);
              }
            } catch (e) {}
          }
          setLoading(false);
          return;
        }
        const { data } = await supabase.from("portfolio_items").select("*").order("sort_order", { ascending: true }).limit(4);
        if (data && data.length > 0) setItems(data);
      } catch (e) {
        console.error("Failed to load featured work:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section id="work" className="section">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center py-20 text-[var(--text-dim)]">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="section">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-10 md:mb-14">
          <span className="section-label">Portfolio</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Featured Work</h2>
          <p className="text-[var(--text-secondary)] max-w-xl">Recent commissions and avatar customisations.</p>
        </div>

        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.slice(0, 4).map((item, i) => (
                <ShowcaseCard key={item.id || i} item={item} index={i} />
              ))}
            </div>

            <div className="text-center mt-10">
              <a href="/portfolio" className="btn-secondary inline-flex">
                View All Work
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <div className="text-8xl mb-6 opacity-10">🎨</div>
            <p className="text-[var(--text-dim)] text-lg md:text-xl mb-8 max-w-md mx-auto">
              Portfolio pieces will appear here after client approval.
            </p>
            <a href="/contact" className="btn-primary inline-flex">
              Commission a piece
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
