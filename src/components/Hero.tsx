"use client";

import { useState, useEffect } from "react";
import { getHeroContent, getSiteImages, getSiteConfig } from "@/lib/db";
import { Zap, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroData, setHeroData] = useState<any>(null);
  const [site, setSite] = useState<any>({});

  useEffect(() => {
    async function load() {
      try {
        const [images, hero, s] = await Promise.all([
          getSiteImages(),
          getHeroContent(),
          getSiteConfig(),
        ]);
        if (images.hero?.url) setHeroImage(images.hero.url);
        if (hero && hero.length > 0) setHeroData(hero[0]);
        setSite(s);
      } catch (e) {
        console.error("Failed to load hero data:", e);
      }
    }
    load();
  }, []);

  const title = heroData?.title || "Custom VRChat Avatars";
  const subtitle = heroData?.subtitle || site.tagline || "";
  const description = heroData?.description || site.description || "";
  const primaryText = heroData?.primary_button_text || "Request Commission";
  const primaryUrl = heroData?.primary_button_url || "/contact";
  const secondaryText = heroData?.secondary_button_text || "View Portfolio";
  const secondaryUrl = heroData?.secondary_button_url || "/portfolio";
  const imageAlt = heroData?.image_alt || "Featured VRChat avatar commission";

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-20 pb-16 md:pt-24 md:pb-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-[10%] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[160px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[360px] w-[520px] rounded-full bg-[var(--accent-2)] opacity-[0.04] blur-[130px]" />
        <div className="absolute inset-0 bg-dots opacity-[0.25]" />
      </div>

      <div className="container relative z-10">
        <div className="lg:flex lg:items-center lg:gap-14">
          {/* Content */}
          <div className="lg:w-1/2">
            {subtitle && (
              <span className="eyebrow">
                <span className="pill-dot" />
                {subtitle}
              </span>
            )}

            <h1 className="display-xl mt-5 max-w-2xl text-white">{title}</h1>

            {description && (
              <p className="lead mt-6 max-w-md">{description}</p>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              <a href={primaryUrl} className="btn-primary inline-flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {primaryText}
              </a>
              <a href={secondaryUrl} className="btn-secondary inline-flex items-center gap-2">
                {secondaryText}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Featured artwork */}
          <div className="lg:w-1/2">
            <div className="relative mx-auto mt-10 lg:mt-0">
              <div className="aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/50">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={imageAlt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <Sparkles className="h-12 w-12 text-[var(--text-dim)] opacity-40" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#work"
        className="pointer-events-auto absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--text-dim)] transition-colors hover:text-white md:flex"
      >
        Scroll to explore
      </a>
    </section>
  );
}
