"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getPortfolioImages } from "@/lib/db";
import PortfolioLightbox from "@/components/PortfolioLightbox";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { Images, Maximize2 } from "lucide-react";
import { portfolioCategories } from "@/data/site";

interface PortfolioImage {
  id: string;
  url: string;
  category?: string;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="h-[220px] w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
    </div>
  );
}

export default function PortfolioPage() {
  const [allImages, setAllImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
                setAllImages(data.portfolioImages.map((url: string, i: number) => ({ id: String(i), url })));
              }
            } catch (e) {}
          }
          setLoading(false);
          return;
        }
        const imgs = await getPortfolioImages();
        setAllImages(imgs.filter((i: any) => i.url).map((i: any) => ({ id: i.id, url: i.url, category: i.category || "VRChat Avatars" })));
      } catch (e) {
        console.error("Failed to load portfolio:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return allImages;
    return allImages.filter((img) => (img.category || "VRChat Avatars") === activeCategory);
  }, [allImages, activeCategory]);

  const urls = filtered.map((img) => img.url);

  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px]" />

        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Portfolio"
            icon={<Images className="h-4 w-4 text-[var(--accent)]" />}
            title="My Work"
            subtitle="Browse avatar commissions and edits — click any piece to view it full size."
          />

          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {["All", ...portfolioCategories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30"
                    : "border border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="columns-1 space-y-4 sm:columns-2 lg:columns-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="columns-1 space-y-4 sm:columns-2 lg:columns-3">
              {filtered.map((img, i) => (
                <Reveal key={img.id} delay={(i % 3) * 60}>
                  <div
                    onClick={() => setLightboxIndex(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLightboxIndex(i);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View portfolio image ${img.id} full size`}
                    className="sheen group relative mb-4 block aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-all duration-500 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/40"
                  >
                    <img
                      src={img.url}
                      alt={`Portfolio ${img.id}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                        <Maximize2 className="h-5 w-5" />
                      </span>
                    </div>
                    {img.category && (
                      <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                        {img.category}
                      </span>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Images className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                No portfolio images found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && (
        <PortfolioLightbox
          images={urls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + urls.length) % urls.length)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % urls.length)}
        />
      )}
    </div>
  );
}
