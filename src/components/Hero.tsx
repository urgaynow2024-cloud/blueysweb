"use client";

import { useState, useEffect, useRef } from "react";
import { getSiteImages } from "@/lib/db";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import StorageImage from "@/components/ui/StorageImage";
import { Zap, ArrowDown, Circle, Sparkles, Award, ShieldCheck, ImageOff } from "lucide-react";
import { useCommissionStatus } from "@/lib/commission-status";
import { toSupabaseRenderUrl } from "@/lib/supabase/client";

export default function Hero() {
  const commission = useCommissionStatus();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    async function load() {
      const images = await getSiteImages();
      if (images.hero?.url) {
        // Use Supabase render API for hero image to avoid Next.js optimizer timeouts
        // on large PNG files. The render API returns an already-optimized WebP.
        const renderUrl = toSupabaseRenderUrl(images.hero.url, {
          width: 1200,
          quality: 75,
          format: "webp",
        });
        setHeroImage(renderUrl);
      }
    }
    load();

    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const parallax = Math.min(scrollY * 0.15, 80);
  const textParallax = Math.min(scrollY * 0.06, 40);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[95vh] flex items-center overflow-hidden pb-16 pt-20 section-transition"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[var(--accent-cosmic)] opacity-[0.08] blur-[120px] drift-slow"
          style={{ transform: `translateY(${parallax * 0.3}px)` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-[var(--accent-nebula)] opacity-[0.06] blur-[100px] drift"
          style={{ transform: `translateY(${-parallax * 0.2}px)` }}
        />
        <div
          className="absolute top-1/2 left-1/3 h-[250px] w-[250px] rounded-full bg-[var(--accent-star)] opacity-[0.05] blur-[80px] drift-slow"
          style={{ transform: `translateY(${parallax * 0.15}px)` }}
        />
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7 lg:order-2">
            <div className="relative mx-auto max-w-2xl" style={{ transform: `translateY(${parallax * -0.2}px)` }}>
              <div
                className={`relative overflow-hidden rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-lg)] ${mounted ? "fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: "0.1s" }}
              >
                {heroImage ? (
                  <>
                    <StorageImage
                      src={heroImage}
                      alt="Featured VRChat avatar commission showcase"
                      fill
                      priority
                      fetchPriority="high"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="h-full min-h-[340px] max-h-[60vh] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg)]/40 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="grid min-h-[360px] max-h-[60vh] place-items-center px-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ImageOff className="h-7 w-7 text-[var(--text-dim)]" aria-hidden />
                      <p className="text-sm text-[var(--text-dim)]">No hero image uploaded yet</p>
                      <p className="text-xs text-[var(--text-dim)]">
                        Upload one from Admin &rarr; Site Images.
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute right-4 top-4 flex flex-col gap-2">
                  <span className="badge badge-blender float-badge" style={{ animationDelay: "0.2s" }}>Blender</span>
                  <span className="badge badge-unity float-badge" style={{ animationDelay: "0.3s" }}>Unity</span>
                  <span className="badge bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30 float-badge" style={{ animationDelay: "0.4s" }}>VRChat Ready</span>
                </div>

                <div className="absolute left-4 top-4">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold status-pulse ${commission.border} ${commission.bg} ${commission.text}`}>
                    <Circle className="h-2 w-2 fill-current animate-pulse" />
                    {commission.loading ? "…" : `Commissions ${commission.label}`}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg)]/80 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 text-[var(--accent)]" />
                    Custom Avatars
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg)]/80 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] backdrop-blur-sm">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    PC & Quest
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg)]/80 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] backdrop-blur-sm">
                    <Award className="h-3 w-3 text-amber-400" />
                    2+ Years Exp
                  </span>
                </div>

                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
              </div>

              <div
                className={`absolute -bottom-5 -left-2 md:-left-6 scale-in ${mounted ? "" : "opacity-0"}`}
                style={{ animationDelay: "0.5s" }}
              >
                <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-card)]/95 px-5 py-3.5 shadow-[var(--shadow-lg)] backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">Starting from</p>
                  <p className="text-xl font-bold text-white">£15</p>
                </div>
              </div>

              <div
                className="absolute -top-4 -right-2 md:-right-4 scale-in"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Zap className="h-4 w-4" />
                </div>
              </div>

              <div className="absolute -bottom-6 -right-2 md:-right-6 scale-in" style={{ animationDelay: "0.7s" }}>
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 lg:order-1" style={{ transform: `translateY(${textParallax}px)` }}>
            <span
              className={`eyebrow ${mounted ? "fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0s" }}
            >
              <span className="pill-dot" />
              {siteConfig.hero.eyebrow}
            </span>

            <h1
              id="hero-heading"
              className={`display-xl mt-6 text-white ${mounted ? "fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.15s" }}
            >
              Avatars that feel
              <br />
              <span className="text-gradient">unmistakably yours</span>
            </h1>

            <p
              className={`lead mt-6 max-w-xl mx-auto lg:mx-0 ${mounted ? "fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.3s" }}
            >
              {siteConfig.hero.subtitle}
            </p>

            <div
              className={`mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start ${mounted ? "fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.45s" }}
            >
              <Link href="/commission" className="btn-primary btn-md group">
                <Zap className="h-4 w-4" />
                Commission Me
              </Link>
              <a href="#featured-work" className="btn-secondary btn-md group">
                View Featured Work
                <ArrowDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
              </a>
            </div>

            <div
              className={`mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[var(--text-secondary)] ${mounted ? "fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.55s" }}
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Studio-grade quality
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                PC & Quest ready
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
                Built in Blender & Unity
              </span>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#featured-work"
        className={`pointer-events-auto absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-[var(--text-dim)] transition-colors hover:text-white md:flex fade-in-up ${mounted ? "" : "opacity-0"}`}
        style={{ animationDelay: "0.8s" }}
      >
        Scroll
        <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
      </a>
    </section>
  );
}