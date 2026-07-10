"use client";

import { useState, useEffect } from "react";
import { getSiteImages } from "@/lib/db";

export default function Hero() {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const images = await getSiteImages();
      if (images.hero?.url) {
        setHeroImage(images.hero.url);
      }
    }
    load();
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Layered atmospheric background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[var(--accent)] opacity-[0.04] blur-[180px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[var(--accent-2)] opacity-[0.03] blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-scene opacity-80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left — large featured render */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="relative group">
              <div className="relative aspect-[4/3] lg:aspect-[16/11] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg)] rounded-xl overflow-hidden border border-[var(--border)] shadow-2xl shadow-black/40">
                {heroImage ? (
                  <img src={heroImage} alt="Featured avatar render" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl md:text-[10rem] mb-2 opacity-[0.07] group-hover:opacity-[0.12] group-hover:scale-105 transition-all duration-700 select-none">
                        🎨
                      </div>
                      <p className="text-sm text-[var(--text-dim)]">Add your best avatar render here</p>
                    </div>
                  </div>
                )}

                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent opacity-60" />

                {/* Platform badges */}
                <div className="absolute top-5 left-5 flex gap-2">
                  <span className="badge badge-pc">PC</span>
                  <span className="badge badge-quest">Quest</span>
                </div>

                {/* Tool badges */}
                <div className="absolute top-5 right-5 flex gap-2">
                  <span className="badge badge-blender">Blender</span>
                  <span className="badge badge-unity">Unity</span>
                </div>

                {/* Corner accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
              </div>

              {/* Floating stat */}
              <div className="absolute -bottom-4 -right-2 md:-right-4 bg-[var(--bg)]/90 backdrop-blur-xl border border-[var(--border)] rounded-xl px-5 py-3 shadow-2xl">
                <p className="text-[10px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-0.5">Starting from</p>
                <p className="text-2xl font-bold text-white tracking-tight">£15</p>
              </div>

              {/* Bottom-left experience badge */}
              <div className="absolute -bottom-3 -left-2 md:-left-4 bg-[var(--bg)]/90 backdrop-blur-xl border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-2xl">
                <p className="text-[10px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-0.5">Experience</p>
                <p className="text-sm font-bold text-white">~2 years</p>
              </div>
            </div>
          </div>

          {/* Right — content */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="max-w-lg">
              <p className="section-label mb-5">VRChat Avatar Commissions</p>
              
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-white mb-5 tracking-tight leading-[1.1]">
                Bluey&rsquo;s <span className="text-gradient">Avatar Commissions</span>
              </h1>

              <p className="text-base md:text-lg text-[var(--text-secondary)] mb-8 leading-relaxed max-w-md">
                I create and customise VRChat avatars using Blender and Unity. Clean, stylish, performance-friendly avatars built for your VR experience.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <a
                  href="#work"
                  className="inline-flex items-center gap-2 bg-[var(--accent)] text-[#05070a] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[var(--accent-4)] transition-all shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/30"
                >
                  View Portfolio
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-[var(--border)] text-white px-6 py-3 rounded-xl font-bold text-sm hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all"
                >
                  Commission Me
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-4 border border-[var(--border)]">
                  <p className="text-xl font-bold text-white">~2 years</p>
                  <p className="text-[11px] text-[var(--text-dim)] mt-1 uppercase tracking-wider">Experience</p>
                </div>
                <div className="glass rounded-xl p-4 border border-[var(--border)]">
                  <p className="text-xl font-bold text-white">VRChat</p>
                  <p className="text-[11px] text-[var(--text-dim)] mt-1 uppercase tracking-wider">Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-[var(--bg)] to-transparent z-20" />
    </section>
  );
}
