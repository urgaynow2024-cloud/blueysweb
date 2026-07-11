"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AgeVerifier from "@/components/AgeVerifier";
import { nsfwPricingTiers, nsfwRules } from "@/data/site";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import PortfolioLightbox from "@/components/PortfolioLightbox";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] animate-pulse">
      <div className="w-full bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" style={{ height: "200px" }} />
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
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 page-head">
            <span className="section-label justify-center">18+ Only</span>
            <h2 className="display-lg text-white mb-3">NSFW Commissions</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Mature avatar customisation for verified adults. All work is delivered privately and discreetly.
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 md:p-8 mb-12">
            <h3 className="text-lg font-bold text-white mb-4">⚠️ Age Verification & Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2">Requirements</h4>
                <ul className="space-y-1.5">
                  {nsfwRules.requirements.map((req, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2">What&rsquo;s Not Allowed</h4>
                <ul className="space-y-1.5">
                  {nsfwRules.notAllowed.map((rule, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm text-[var(--text-dim)] mt-4 italic">
              {nsfwRules.note}
            </p>
          </div>

          {/* NSFW Portfolio Gallery */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <span className="section-label justify-center">NSFW Portfolio</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Previous Work</h2>
              <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
                Examples of mature avatar customisation. Click any image to view full size.
              </p>
            </div>

            {loading ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : images.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {images.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className="break-inside-avoid rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] group hover:border-[var(--border-hover)] transition-all duration-500 hover:shadow-2xl hover:shadow-black/30 cursor-pointer"
                  >
                    <img
                      src={url}
                      alt={`NSFW Work ${i + 1}`}
                      className="w-full h-auto block object-contain p-2"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-[var(--text-dim)] text-lg">No NSFW portfolio images available yet.</p>
              </div>
            )}
          </div>

          {/* NSFW Pricing */}
          <div className="mb-10">
            <span className="section-label justify-center">NSFW Rates</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight text-center">Pricing</h2>
            <p className="text-[var(--text-secondary)] text-center max-w-lg mx-auto">
              Adult content commissions are priced separately from SFW work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-16">
            {nsfwPricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative p-6 md:p-8 h-full flex flex-col border rounded-xl transition-all duration-500 ${
                  tier.popular
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-xl shadow-[var(--accent)]/5"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]"
                }`}
              >
                {tier.badge && (
                  <div className="text-[10px] font-bold tracking-wider uppercase text-[var(--accent)] mb-4">
                    {tier.badge}
                  </div>
                )}
                <h3 className="text-base font-semibold text-white mb-2">
                  {tier.emoji} {tier.name}
                </h3>
                <p className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                  {tier.price}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${
                    tier.popular
                      ? "bg-white text-black hover:bg-gray-100"
                      : "border border-[var(--border)] text-white hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  Request
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-[var(--text-dim)] mb-4">
              All NSFW work requires age verification and is delivered privately.
            </p>
            <Link href="/contact" className="btn-primary inline-flex">
              Contact for NSFW Commissions
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
