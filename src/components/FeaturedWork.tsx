"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function SkeletonCard() {
  return (
    <div className="group relative aspect-video rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] animate-pulse">
      <div className="w-full h-full bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

export default function FeaturedWork() {
  const [images, setImages] = useState<string[]>([]);
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
              if (data.portfolioImages && data.portfolioImages.length > 0) {
                setImages(data.portfolioImages.slice(0, 4));
              }
            } catch (e) {}
          }
          setLoading(false);
          return;
        }
        const { data } = await supabase.from("portfolio_images").select("url").order("sort_order", { ascending: true }).limit(4);
        if (data && data.length > 0) setImages(data.map((img) => img.url));
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
          <div className="mb-10 md:mb-14">
            <span className="section-label">Portfolio</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Featured Work</h2>
            <p className="text-[var(--text-secondary)] max-w-xl">Recent commissions and avatar customisations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
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

        {images.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {images.map((url, i) => (
                <div key={i} className="group relative aspect-video rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] hover:border-[var(--border-hover)] transition-all duration-500 hover:shadow-2xl hover:shadow-black/30">
                  <img src={url} alt={`Work ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <a href="/portfolio" className="btn-secondary inline-flex items-center gap-2">
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
