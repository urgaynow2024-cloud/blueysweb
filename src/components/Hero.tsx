"use client";

import { useState, useEffect } from "react";
import { getSiteImages } from "@/lib/db";
import Link from "next/link";
import { Zap, ArrowDown, Sparkles, ShieldCheck, Layers } from "lucide-react";

const TOOL_STRIP = [
  "Blender",
  "Unity",
  "VRChat",
  "Avatar Edits",
  "Clothing Fitting",
  "Toggles",
  "Optimisation",
  "Accessories",
];

export default function Hero() {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const images = await getSiteImages();
      if (images.hero?.url) setHeroImage(images.hero.url);
    }
    load();
  }, []);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-28 md:pb-24 md:pt-32">
      {/* Ambient atmosphere */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.06] blur-[180px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[420px] w-[600px] rounded-full bg-[var(--accent-2)] opacity-[0.05] blur-[150px]" />
        <div className="absolute inset-0 bg-grid opacity-[0.5]" />
        <div className="absolute inset-0 bg-dots opacity-30" />
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Content */}
          <div className="lg:col-span-6">
            <div className="fade-in">
              <span className="eyebrow">
                <span className="pill-dot" />
                VRChat Avatar Commissions
              </span>
            </div>

            <h1 className="display-xl mt-5 text-white fade-in">
              Avatars that feel <br className="hidden sm:block" />
              <span className="text-gradient-animated">unmistakably yours</span>
            </h1>

            <p className="lead mt-6 max-w-xl fade-in">
              Bluey&rsquo;s Avatar Commissions — handcrafted VRChat avatars built in Blender and
              Unity. Clean, stylish, and performance-friendly, tailored around your vision.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 fade-in">
              <a href="#work" className="btn-primary group">
                View Portfolio
                <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
              <a href="/contact" className="btn-secondary">
                <Zap className="h-4 w-4" />
                Commission Me
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--text-secondary)] fade-in">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                Studio-grade quality
              </span>
              <span className="inline-flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--accent)]" />
                PC &amp; Quest ready
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                Built in Blender &amp; Unity
              </span>
            </div>

            {/* Tool / skill marquee */}
            <div className="marquee-mask mt-10 overflow-hidden fade-in">
              <div className="marquee-track">
                {[...TOOL_STRIP, ...TOOL_STRIP].map((tool, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-dim)]"
                  >
                    <span className="h-1 w-1 rounded-full bg-[var(--accent)]/70" />
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Showcase */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-xl">
              {/* Rotating aurora glow behind the frame */}
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="hero-aurora" />
              </div>

              {/* Decorative stacked card for depth */}
              <div className="absolute -right-4 -top-4 hidden h-full w-full rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-elevated)]/40 sm:block" />

              <div className="fade-in float-soft">
                <div className="glow-border sheen relative aspect-[4/3] overflow-hidden rounded-[var(--r-xl)] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg)] shadow-2xl shadow-black/50">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt="Featured VRChat avatar commission"
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-[var(--text-dim)]">
                      <Sparkles className="h-10 w-10 animate-pulse opacity-40" />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent opacity-70" />

                  <div className="absolute right-4 top-4 flex gap-2">
                    <span className="badge badge-blender">Blender</span>
                    <span className="badge badge-unity">Unity</span>
                  </div>

                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
                </div>
              </div>

              {/* Floating price chip */}
              <div className="bob absolute -bottom-4 -left-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-float)]/90 px-4 py-3 shadow-2xl backdrop-blur-xl sm:-left-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                  Starting from
                </p>
                <p className="text-lg font-bold text-white">£15</p>
              </div>

              {/* Floating reviews chip (links to real, approved reviews) */}
              <Link
                href="/reviews"
                className="bob-delayed absolute -right-3 top-10 hidden items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-float)]/90 px-4 py-3 shadow-2xl backdrop-blur-xl transition-colors hover:border-[var(--accent)]/50 sm:flex"
              >
                <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />
                <span className="text-xs font-semibold text-white">Client reviews</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-24 bg-gradient-to-t from-[var(--bg)] to-transparent md:h-32" />

      {/* Scroll cue */}
      <a
        href="#work"
        className="pointer-events-auto absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--text-dim)] transition-colors hover:text-white md:flex"
      >
        Scroll to explore
        <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
      </a>
    </section>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z" />
    </svg>
  );
}
