"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function SkeletonCard() {
  return (
    <div className="aspect-square rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] animate-pulse">
      <div className="w-full h-full bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

export default function PortfolioPage() {
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
                setImages(data.portfolioImages);
              }
            } catch (e) {}
          }
          setLoading(false);
          return;
        }
        const { data } = await supabase.from("portfolio_images").select("url").order("sort_order", { ascending: true });
        if (data && data.length > 0) setImages(data.map((img) => img.url));
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
          <div className="text-center mb-12 page-head">
            <span className="section-label justify-center">Portfolio</span>
            <h2 className="display-lg text-white mb-3">My Work</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">Browse avatar commissions and edits.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] group hover:border-[var(--border-hover)] transition-all duration-500 hover:shadow-2xl hover:shadow-black/30">
                  <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
                <div className="relative text-6xl">🎨</div>
              </div>
              <p className="text-[var(--text-dim)] text-lg">Portfolio images will appear here after upload.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
