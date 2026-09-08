"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import PortfolioLightbox from "@/components/PortfolioLightbox";
import Reveal from "@/components/ui/Reveal";
import { Images, Maximize2 } from "lucide-react";

export default function PortfolioPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.06] blur-[130px] orb-slow" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-60 w-[500px] rounded-full bg-[var(--accent-nebula)] opacity-[0.03] blur-[100px] orb-med" />
        <div className="pointer-events-none absolute top-1/3 left-0 h-48 w-[400px] rounded-full bg-[var(--accent-star)] opacity-[0.03] blur-[110px] orb-fast" />

        <div className="container-wide">
          <div className="text-center">
            <span className="eyebrow justify-center">
              <Images className="h-3.5 w-3.5 text-[var(--accent)]" />
              Portfolio
            </span>
            <h1 className="display-xl mt-5 text-white">
              ✦ My <span className="text-gradient-animated">Work</span>
            </h1>
            <p className="lead mx-auto mt-4 max-w-2xl">
              Browse avatar commissions and edits — click any piece to view it full size.
            </p>
          </div>

          {loading ? (
            <div className="mt-16 columns-1 space-y-5 sm:columns-2 lg:columns-3 xl:columns-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="mb-5 break-inside-avoid">
                  <div className="aspect-[4/3] w-full rounded-[var(--r-md)] ad-shimmer" />
                </div>
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="mt-12 columns-1 space-y-5 sm:columns-2 lg:columns-3 xl:columns-4">
              {images.map((url, i) => (
                <Reveal key={i} delay={(i % 4) * 50}>
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
                    aria-label={`View portfolio image ${i + 1} full size`}
                    className="group relative mb-5 block aspect-[4/3] cursor-pointer overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] transition-all duration-500 hover:border-[var(--border-strong)] break-inside-avoid"
                  >
                    <img
                      src={url}
                      alt={`Portfolio ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                        <Maximize2 className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Images className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                Portfolio pieces will appear here after client approval.
              </p>
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && (
        <PortfolioLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % images.length)}
        />
      )}
    </div>
  );
}
