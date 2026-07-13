"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AgeVerifier from "@/components/AgeVerifier";
import { nsfwPricingTiers, nsfwRules } from "@/data/site";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import PortfolioLightbox from "@/components/PortfolioLightbox";
import SectionHeading from "@/components/ui/SectionHeading";
import PricingCard from "@/components/ui/PricingCard";
import Reveal from "@/components/ui/Reveal";
import { ShieldAlert, ArrowRight } from "lucide-react";

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
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="18+ Only"
            title="NSFW Commissions"
            subtitle="Mature avatar customisation for verified adults. All work is delivered privately and discreetly."
          />

          <Reveal>
            <div className="mb-14 rounded-[var(--r-lg)] border border-red-500/30 bg-red-500/10 p-6 md:p-8">
              <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                Age Verification &amp; Rules
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-red-400">Requirements</h4>
                  <ul className="space-y-1.5">
                    {nsfwRules.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-red-400">What&rsquo;s Not Allowed</h4>
                  <ul className="space-y-1.5">
                    {nsfwRules.notAllowed.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
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
            <SectionHeading align="center" eyebrow="NSFW Portfolio" title="Previous Work" subtitle="Examples of mature avatar customisation. Click any image to view full size." />

            {loading ? (
              <div className="columns-1 space-y-4 sm:columns-2 lg:columns-3">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : images.length > 0 ? (
              <div className="columns-1 space-y-4 sm:columns-2 lg:columns-3">
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
                    className="sheen break-inside-avoid cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-all duration-500 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/30 group"
                  >
                    <img src={url} alt={`NSFW Work ${i + 1}`} loading="lazy" className="block w-full object-contain p-2 transition-transform duration-700 group-hover:scale-[1.02]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
                <p className="text-[var(--text-dim)]">No NSFW portfolio images available yet.</p>
              </div>
            )}
          </div>

          {/* NSFW Pricing */}
          <SectionHeading align="center" eyebrow="NSFW Rates" title="Pricing" subtitle="Adult content commissions are priced separately from SFW work." />

          <div className="mb-16 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {nsfwPricingTiers.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 80}>
                <PricingCard tier={tier} />
              </Reveal>
            ))}
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
