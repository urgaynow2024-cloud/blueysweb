"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import AgeVerifier from "@/components/AgeVerifier";
import { nsfwPricingTiers, nsfwRules } from "@/config/site";
import { getNsfwPortfolioImages } from "@/lib/db";
import PortfolioLightbox from "@/components/PortfolioLightbox";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ShieldAlert, ArrowRight, Lock, Sparkles, Check, ImageIcon } from "lucide-react";

interface LightboxItem {
  url: string;
  caption?: string;
  title?: string;
  description?: string;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] animate-pulse">
      <div className="h-[200px] w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
    </div>
  );
}

export default function NsfwPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const lightboxImages = useMemo(() =>
    images.map((url, index) => ({ url, title: `NSFW Portfolio ${index + 1}` }) as LightboxItem),
    [images]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { isAgeVerified } = require("@/components/AgeVerifier");
      setIsVerified(isAgeVerified());
    }
  }, []);

  useEffect(() => {
    async function load() {
      if (!isVerified) return;
      setLoading(true);
      try {
        const data = await getNsfwPortfolioImages();
        setImages((data || []).map((img: { id: string; url: string }) => img.url));
      } catch (e) {
        console.error("Failed to load NSFW portfolio:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isVerified]);

  if (!isVerified) {
    return <AgeVerifier onVerified={() => setIsVerified(true)} />;
  }

  return (
    <div className="relative">
      <section className="section">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="18+ Only"
            title="NSFW Commissions"
            subtitle="Mature avatar customisation for verified adults. All work is delivered privately and discreetly."
          />

          <Reveal>
            <div className="mt-8 mx-auto max-w-2xl rounded-[var(--r-lg)] border border-rose-500/30 bg-rose-500/10 p-6 md:p-8">
              <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                Age Verification & Rules
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-rose-400">Requirements</h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    {nsfwRules.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-rose-400">What&rsquo;s Not Allowed</h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    {nsfwRules.notAllowed.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-sm italic text-[var(--text-dim)]">{nsfwRules.note}</p>
            </div>
          </Reveal>

          {/* NSFW Portfolio Gallery */}
          <div className="mt-16">
            <SectionHeading
              align="center"
              eyebrow="Portfolio"
              title="Previous Work"
              subtitle="Examples of mature avatar customisation. Click any image to view full size."
            />
            <Reveal>
              {loading ? (
                <div className="mt-8 gallery-masonry">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="gallery-masonry-item">
                      <SkeletonCard />
                    </div>
                  ))}
                </div>
              ) : images.length > 0 ? (
                <div className="mt-8 gallery-masonry">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setLightboxIndex(i);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View NSFW image ${i + 1} full size`}
                      className="gallery-masonry-item group relative overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] cursor-pointer transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)]"
                    >
                      <img src={url} alt={`NSFW Work ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                          <ImageIcon className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 empty-state">
                  <div className="empty-state-icon">
                    <ImageIcon className="h-7 w-7" />
                  </div>
                  <h3 className="empty-state-title">No NSFW portfolio yet</h3>
                  <p className="empty-state-desc">NSFW portfolio images will appear here when available.</p>
                </div>
              )}
            </Reveal>
          </div>

          {/* NSFW Pricing */}
          <div className="mt-16">
            <SectionHeading
              align="center"
              eyebrow="Rates"
              title="NSFW Pricing"
              subtitle="Adult content commissions are priced separately from SFW work."
            />
            <Reveal>
              <div className="mt-8 mx-auto max-w-3xl">
                {nsfwPricingTiers.map((tier, i) => (
                  <Reveal key={tier.id} delay={i * 80}>
                    <div className={`group py-6 md:py-8 ${i < nsfwPricingTiers.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            {tier.emoji && (
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl transition-transform duration-300 group-hover:scale-110">
                                {tier.emoji}
                              </span>
                            )}
                            <div>
                              <h3 className="text-base font-semibold text-white md:text-lg">{tier.name}</h3>
                              {tier.badge && (
                                <span className="text-xs font-medium text-[var(--accent-muted)]">{tier.badge}</span>
                              )}
                            </div>
                          </div>
                          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[var(--text-secondary)]">
                            {tier.features?.map((feat) => (
                              <li key={feat} className="flex items-center gap-2">
                                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                                  <Check className="h-2.5 w-2.5" />
                                </span>
                                {feat}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center gap-4 md:text-right">
                          <div>
                            <p className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">{tier.price}</p>
                            <p className="text-xs text-[var(--text-dim)]">Per avatar</p>
                          </div>
                          <Link href="/contact" className="btn-primary btn-sm">
                            Request
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-16 text-center">
              <p className="mb-4 text-sm text-[var(--text-dim)]">All NSFW work requires age verification and is delivered privately.</p>
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
                Contact for NSFW Commissions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-12 text-center">
              <a href="/" className="btn-ghost inline-flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Return to Main Site
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <PortfolioLightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % lightboxImages.length)}
        />
      )}
    </div>
  );
}