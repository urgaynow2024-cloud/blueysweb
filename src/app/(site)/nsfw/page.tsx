"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AgeVerifier from "@/components/AgeVerifier";
import { nsfwPricingTiers, nsfwRules } from "@/data/site";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import PortfolioLightbox from "@/components/PortfolioLightbox";
import Reveal from "@/components/ui/Reveal";
import { ShieldAlert, ArrowRight, Lock, Sparkles, Check, ImageIcon } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] animate-pulse">
      <div className="h-[200px] w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
    </div>
  );
}

export default function NsfwPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
        if (!isSupabaseConfigured || !supabase) {
          const stored = localStorage.getItem("adminData");
          if (stored) {
            try {
              const data = JSON.parse(stored);
              if (data.nsfwPortfolioImages && data.nsfwPortfolioImages.length > 0) {
                setImages(data.nsfwPortfolioImages);
              }
            } catch (e) {}
          }
          setLoading(false);
          return;
        }
        const { data } = await supabase
          .from("nsfw_portfolio_images")
          .select("url")
          .order("sort_order", { ascending: true });
        if (data && data.length > 0) setImages(data.map((img) => img.url));
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
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.05] blur-[130px] orb-slow" />

        <div className="container">
          <div className="text-center">
            <span className="eyebrow justify-center">
              <Lock className="h-3.5 w-3.5 text-[var(--accent)]" />
              18+ Only
            </span>
            <h1 className="display-xl mt-5 text-white">
              ✦ <span className="text-gradient-animated">NSFW Commissions</span>
            </h1>
            <p className="lead mx-auto mt-4 max-w-xl">
              Mature avatar customisation for verified adults. All work is delivered privately and discreetly.
            </p>
          </div>

          <Reveal>
            <div className="mx-auto my-12 max-w-2xl rounded-2xl border border-red-500/30 bg-red-500/10 p-6 md:p-8">
              <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                Age Verification &amp; Rules
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-red-400">Requirements</h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    {nsfwRules.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-red-400">What&rsquo;s Not Allowed</h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    {nsfwRules.notAllowed.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
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
          <div className="mb-16">
            <div className="text-center">
              <span className="section-eyebrow justify-center">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                NSFW Portfolio
              </span>
              <h2 className="display-lg mt-3 text-white">Previous Work</h2>
              <p className="lead mx-auto mt-2 max-w-xl">Examples of mature avatar customisation. Click any image to view full size.</p>
            </div>

            {loading ? (
              <div className="mt-12 columns-1 space-y-4 sm:columns-2 lg:columns-3">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : images.length > 0 ? (
              <div className="mt-12 columns-1 space-y-4 sm:columns-2 lg:columns-3">
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
                    className="break-inside-avoid cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-all duration-500 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/30 group"
                  >
                    <img src={url} alt={`NSFW Work ${i + 1}`} loading="lazy" className="block w-full object-contain p-2 transition-transform duration-700 group-hover:scale-[1.02]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <p className="text-[var(--text-dim)]">No NSFW portfolio images available yet.</p>
              </div>
            )}
          </div>

          {/* NSFW Pricing */}
          <div className="mb-16">
            <div className="text-center">
              <span className="section-eyebrow justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                NSFW Rates
              </span>
              <h2 className="display-lg mt-3 text-white">Pricing</h2>
              <p className="lead mx-auto mt-2 max-w-xl">Adult content commissions are priced separately from SFW work.</p>
            </div>

            <div className="mx-auto max-w-3xl mt-12">
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
          </div>

          <div className="text-center">
            <p className="mb-4 text-sm text-[var(--text-dim)]">All NSFW work requires age verification and is delivered privately.</p>
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              Contact for NSFW Commissions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
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
