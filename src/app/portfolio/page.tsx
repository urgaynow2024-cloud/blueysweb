"use client";

import { useState, useEffect } from "react";
import { commissions } from "@/data/site";
import ShowcaseCard from "@/components/ShowcaseCard";
import SectionTitle from "@/components/SectionTitle";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function PortfolioPage() {
  const [items, setItems] = useState(commissions);
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
        const { data } = await supabase.from("portfolio_items").select("*").order("sort_order", { ascending: true });
        if (data && data.length > 0) setItems(data);
      } catch (e) {
        console.error("Failed to load portfolio:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionTitle title="Portfolio" subtitle="Browse completed avatar commissions and edits" />

          {loading ? (
            <div className="text-center py-20 text-[var(--text-dim)]">Loading...</div>
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item, i) => (
                  <ShowcaseCard key={item.id || i} item={item} index={i} />
                ))}
              </div>

              <div className="text-center mt-14">
                <a href="/contact" className="btn-primary inline-flex">
                  Commission a piece →
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
                <div className="relative text-6xl">🎨</div>
              </div>
              <p className="text-[var(--text-dim)] text-lg">
                Portfolio pieces will appear here after client approval.
              </p>
              <a href="/contact" className="btn-primary mt-8 inline-flex">
                Commission a piece →
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
