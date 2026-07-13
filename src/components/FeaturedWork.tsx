"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] animate-pulse">
      <div className="h-[180px] w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
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

  return (
    <section id="work" className="section">
      <div className="container">
        <div className="mb-10 md:mb-14">
          <span className="section-label">Portfolio</span>
          <h2 className="display-lg text-white">Featured Work</h2>
          <p className="mt-3 max-w-xl text-[var(--text-secondary)]">Recent commissions and avatar customisations.</p>
        </div>

        {loading ? (
          <div className="columns-1 space-y-4 sm:columns-2">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="columns-1 space-y-4 sm:columns-2">
              {images.map((url, i) => (
                <Reveal key={i} delay={(i % 4) * 60}>
                  <Link
                    href="/portfolio"
                    className="group block break-inside-avoid overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-all duration-500 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/30"
                  >
                    <img src={url} alt={`Work ${i + 1}`} loading="lazy" className="block w-full object-contain p-2 transition-transform duration-700 group-hover:scale-[1.03]" />
                  </Link>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/portfolio" className="btn-secondary inline-flex items-center gap-2">
                View All Work
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
            <p className="text-[var(--text-dim)]">Portfolio pieces will appear here after client approval.</p>
          </div>
        )}
      </div>
    </section>
  );
}
