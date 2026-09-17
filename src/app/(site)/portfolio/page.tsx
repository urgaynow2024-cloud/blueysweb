"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getPortfolioImages } from "@/lib/db";
import PortfolioLightbox from "@/components/PortfolioLightbox";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { Maximize2, Sparkles } from "lucide-react";

const CATEGORIES = ["All", "Characters", "Environments", "Customizations"];

function getCategory(url: string, index: number): string {
  const hash = url.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + index;
  const idx = hash % 3;
  return ["Characters", "Environments", "Customizations"][idx];
}

type PortfolioImage = { id: string; url: string; category: string; caption?: string };

export default function PortfolioPage() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

   useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getPortfolioImages();
        setImages(
          data.map((img: { id: string; url: string; caption?: string }, i) => ({
            id: img.id,
            url: img.url,
            category: getCategory(img.url, i),
            caption: img.caption || undefined,
          }))
        );
      } catch (e) {
        console.error("Failed to load portfolio:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredImages = useMemo(() => {
    if (activeCategory === "All") return images;
    return images.filter((img) => img.category === activeCategory);
  }, [images, activeCategory]);

  const featuredImage = filteredImages.length > 0 ? filteredImages[0] : null;
  const masonryImages = filteredImages.slice(1);

  const lightboxImages = filteredImages.map((i: PortfolioImage) => ({ url: i.url, caption: i.caption, title: `Portfolio Image` }));

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const openLightboxAt = (idx: number) => setLightboxIndex(idx);

  return (
    <div className="relative">
      <section id="portfolio" className="section">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Portfolio"
            title="Featured Work"
            subtitle="Recent avatar commissions and customisations."
          />

          {loading ? (
            <div className="mt-12 gallery-masonry">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Reveal key={i} delay={(i % 4) * 50}>
                  <div className="gallery-masonry-item">
                    <div className="aspect-[4/3] w-full rounded-[var(--r-md)] skeleton" />
                  </div>
                </Reveal>
              ))}
            </div>
          ) : filteredImages.length > 0 ? (
            <>
              {featuredImage && (
                <Reveal>
                  <div
                    onClick={() => openLightboxAt(filteredImages.findIndex((img) => img.id === featuredImage.id))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openLightboxAt(filteredImages.findIndex((img) => img.id === featuredImage.id));
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="View featured artwork full size"
                    className="portfolio-card portfolio-hero group relative mb-8 cursor-pointer overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-lg)]"
                  >
                    <div className="portfolio-image aspect-[16/9] w-full">
                      <img
                        src={featuredImage.url}
                        alt="Featured portfolio artwork"
                        loading="eager"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        onError={(e) => {
                          e.currentTarget.src = "https://picsum.photos/id/1000/1200/675";
                          e.currentTarget.alt = "Image failed to load - placeholder shown";
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/50 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                        <Maximize2 className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="pointer-events-none absolute bottom-4 left-6">
                      <span className="section-eyebrow !text-white/70">Featured</span>
                    </div>
                  </div>
                </Reveal>
              )}

              <div className="mb-8 flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-semibold transition-all duration-300 ${
                        isActive
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-white"
                      }`}
                    >
                      {cat}
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
                    </button>
                  );
                })}
              </div>

              {activeCategory !== "All" && (
                <p className="mb-6 text-sm text-[var(--text-secondary)]">
                  Showing {masonryImages.length} artwork{masonryImages.length !== 1 ? "s" : ""} in {activeCategory}
                </p>
              )}

              <div className="mt-4 gallery-masonry">
                {masonryImages.map((item, i) => (
                  <Reveal key={item.id || i} delay={(i % 4) * 50}>
                    <div
                      onClick={() => openLightboxAt(filteredImages.findIndex((img) => img.id === item.id))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openLightboxAt(filteredImages.findIndex((img) => img.id === item.id));
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View portfolio image ${i + 1} full size`}
                      className="portfolio-card group relative overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] cursor-pointer transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="portfolio-image">
                        <img
                          src={item.url}
                          alt={`Portfolio ${i + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          onError={(e) => {
                            e.currentTarget.src = "https://picsum.photos/id/1000/600/600";
                            e.currentTarget.alt = "Image failed to load - placeholder shown";
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                          <Maximize2 className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-16 empty-state">
              <div className="empty-state-icon">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="empty-state-title">No portfolio pieces yet</h3>
              <p className="empty-state-desc">
                Portfolio pieces will appear here after client approval.
              </p>
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <PortfolioLightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % lightboxImages.length)}
        />
      )}
    </div>
  );
}

