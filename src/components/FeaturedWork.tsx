"use client";

import { useState, useEffect } from "react";
import { getSiteImages, getPortfolioImages } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ImageIcon, Sparkles } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export default function FeaturedWork() {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const siteImages = await getSiteImages();
        if (siteImages.hero?.url) setHeroImage(siteImages.hero.url);

        const allImages = await getPortfolioImages();
        setImages((allImages || []).slice(0, 6).map((img: { id: string; url: string }) => img.url));
      } catch (e) {
        console.error("Failed to load featured work:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section id="featured-work" className="section section-transition" aria-labelledby="featured-heading">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb-slow absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[var(--accent-cosmic)] opacity-[0.07]" />
        <div className="orb-med absolute top-1/2 -right-24 h-[400px] w-[400px] rounded-full bg-[var(--accent-nebula)] opacity-[0.06]" />
        <div className="orb-fast absolute -bottom-20 left-1/3 h-[300px] w-[300px] rounded-full bg-[var(--accent-star)] opacity-[0.05]" />
      </div>
      <div className="container relative">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <div>
            <span className="section-label">Portfolio</span>
            <h2 id="featured-heading" className="display-lg text-white mt-3">Featured Artwork</h2>
            <p className="mt-3 max-w-xl text-[var(--text-secondary)]">Recent commissions and avatar customisations — each built to client specs.</p>
          </div>
          <Link href="/portfolio" className="btn-secondary inline-flex items-center gap-2">
            View All Work
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
                <div className="h-[240px] w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
              </div>
            ))}
          </div>
        ) : images.length > 0 ? (
          <div className="gallery-masonry">
            {images.map((url, i) => (
              <Reveal key={i} delay={(i % 6) * 60}>
                <Link
                  href="/portfolio"
                  className="sheen group relative mb-5 block aspect-[4/3] cursor-pointer overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] transition-all duration-500 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/40 gallery-masonry-item card-lift"
                >
                  <img
                    src={url}
                    alt={`Commission ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-between p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-sm font-semibold text-white">View commission</span>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white/25">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--accent-2)]/5" />
            <div className="relative">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h3 className="heading-sm text-white mb-2">No portfolio pieces yet</h3>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                Portfolio pieces will appear here after client approval.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}