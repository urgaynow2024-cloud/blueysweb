"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/FeaturedWork";
import { getWorkflowSteps, getPricingTiers, getFaqItems, getSiteConfig, getApprovedReviews, getSiteImages } from "@/lib/db";
import Link from "next/link";
import { Star, Zap } from "lucide-react";
import ClientReviewForm from "@/components/ClientReviewForm";
import StatsSection from "@/components/StatsSection";

export default function Home() {
  const [site, setSite] = useState<any>({});
  const [workflow, setWorkflow] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [faq, setFaq] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [siteImages, setSiteImages] = useState<Record<string, { url: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
      const [s, w, p, f, r, images] = await Promise.all([
        getSiteConfig(),
        getWorkflowSteps(),
        getPricingTiers(),
        getFaqItems(),
        getApprovedReviews(),
        getSiteImages(),
      ]);
      setSite(s);
      setWorkflow(w);
      setPricing(p);
      setFaq(f);
      setReviews(r);
      setSiteImages(images);
      } catch (e) {
        console.error("Failed to load home data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <Hero />
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[var(--bg-card)] rounded-2xl p-8 border border-[var(--border)] animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-[var(--bg)] rounded w-1/2" />
                    <div className="h-3 bg-[var(--bg)] rounded w-full" />
                    <div className="h-3 bg-[var(--bg)] rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Hero />

      <div className="relative z-10">
        <FeaturedWork />

        <div className="divider" />

        {/* Services */}
        <section className="section section-alt">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="mb-10 md:mb-14">
              <span className="section-label">Services</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">What I provide</h2>
              <p className="text-[var(--text-secondary)] max-w-xl">I work on VRChat avatars in a few different ways. Here&rsquo;s what I can help with.</p>
            </div>

            <div className="space-y-20">
              {/* Avatar Editing */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className={`${siteImages.avatar_editing?.url ? "lg:col-span-5 order-2 lg:order-1" : "lg:col-span-12"} `}>
                  <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-3 block">Avatar Editing</span>
                  <h3 className="text-2xl font-bold text-white mb-4">Avatar Editing</h3>
                  <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                    Texture recolours, accessory additions, clothing fitting, hair combinations, and minor geometry tweaks to existing bases.
                  </p>
                  <ul className="space-y-2.5">
                    {["Texture recolours", "Accessory additions", "Clothing fitting", "Hair combinations", "Minor fixes"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {siteImages.avatar_editing?.url && (
                  <div className="lg:col-span-7 order-1 lg:order-2">
                    <div className="aspect-[16/10] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg)] rounded-xl border border-[var(--border)] flex items-center justify-center overflow-hidden relative">
                      <img src={siteImages.avatar_editing.url} alt="Avatar Editing" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent opacity-40" />
                    </div>
                  </div>
                )}
              </div>

              {/* Blender Work */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {siteImages.blender_work?.url && (
                  <div className="lg:col-span-7">
                    <div className="aspect-[16/10] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg)] rounded-xl border border-[var(--border)] flex items-center justify-center overflow-hidden relative">
                      <img src={siteImages.blender_work.url} alt="Blender Work" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent opacity-40" />
                    </div>
                  </div>
                )}
                <div className={`${siteImages.blender_work?.url ? "lg:col-span-5" : "lg:col-span-12"}`}>
                  <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-3 block">Blender</span>
                  <h3 className="text-2xl font-bold text-white mb-4">Blender Work</h3>
                  <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                    Asset creation, retopology, UV work, material setup, and mesh adjustments for clean avatar bases.
                  </p>
                  <ul className="space-y-2.5">
                    {["Asset creation", "Retopology", "UV & material work", "Mesh adjustments", "Clean topology"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Unity Setup */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className={`${siteImages.unity_work?.url ? "lg:col-span-5 order-2 lg:order-1" : "lg:col-span-12"}`}>
                  <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-3 block">Unity</span>
                  <h3 className="text-2xl font-bold text-white mb-4">Unity Setup</h3>
                  <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                    Material configuration, toggles, optimisation, viseme setup, and VRChat-ready packaging.
                  </p>
                  <ul className="space-y-2.5">
                    {["Material config", "Toggle systems", "Performance tuning", "Viseme setup", "VRChat packaging"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {siteImages.unity_work?.url && (
                  <div className="lg:col-span-7 order-1 lg:order-2">
                    <div className="aspect-[16/10] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg)] rounded-xl border border-[var(--border)] flex items-center justify-center overflow-hidden relative">
                      <img src={siteImages.unity_work.url} alt="Unity Setup" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent opacity-40" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Process */}
        <section className="section">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <span className="section-label justify-center">Process</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">How it works</h2>
              <p className="text-[var(--text-secondary)] max-w-lg mx-auto">A simple, transparent workflow from request to delivery.</p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
                {workflow.map((step, i) => (
                  <div key={step.title || i} className="relative text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-2xl mx-auto mb-4 relative z-10 hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all duration-500">
                      {step.emoji}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
                    <p className="text-xs text-[var(--text-dim)] leading-relaxed px-1">{step.desc}</p>
                    {i < workflow.length - 1 && (
                      <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-10">
              <a href="/contact" className="btn-secondary inline-flex">
                Start Your Commission
              </a>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Reviews */}
        <section className="section section-alt">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="mb-10 md:mb-14">
              <span className="section-label">Client Feedback</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Reviews</h2>
              <p className="text-[var(--text-secondary)]">What clients say about working with me.</p>
            </div>

{reviews.length > 0 ? (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {reviews.map((review, i) => (
        <div key={review.id || i} className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)] relative overflow-hidden group hover:border-[var(--border-hover)] transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.02] blur-3xl rounded-full pointer-events-none group-hover:opacity-[0.05] transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">🎭</div>
              <div>
                <p className="font-bold text-white">{review.display_name}</p>
                <div className="flex gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= (review.rating || 5) ? "text-[var(--accent)] fill-[var(--accent)]" : "text-[var(--text-dim)]"}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed italic">"{review.review_text}"</p>
            {review.image_url && (
              <div className="mt-4">
                <img src={review.image_url} alt="Review image" className="w-full h-48 object-cover rounded-xl border border-[var(--border)]" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
    {reviews.length > 2 && (
      <div className="text-center mt-8">
        <Link href="/reviews" className="btn-secondary inline-flex items-center gap-2">
          View All Reviews
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    )}
  </>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4 opacity-20">💬</div>
                <p className="text-[var(--text-dim)] text-lg max-w-md mx-auto mb-6">
                  Client reviews will appear here after commissions are completed.
                </p>
                <a href="/reviews" className="btn-primary inline-flex items-center gap-2">
                  Leave a Review
                </a>
              </div>
            )}
          </div>
        </section>

        <div className="divider" />

        {/* FAQ */}
        <section className="section">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-14">
              <span className="section-label justify-center">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Common questions</h2>
              <p className="text-[var(--text-secondary)]">Quick answers to things you might be wondering.</p>
            </div>

            <div className="space-y-2.5">
              {faq.map((item, i) => (
                <div
                  key={i}
                  className="border border-[var(--border)] rounded-xl p-5 md:p-6 hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]/50 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-bold text-white group-hover:text-[var(--accent)] transition-colors">{item.question}</h3>
                    <span className="text-[var(--text-dim)] mt-0.5 text-lg leading-none">+</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-3">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <a href="/contact" className="btn-secondary inline-flex">
                Have more questions?
              </a>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Pricing */}
        <section className="section section-alt">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-14">
              <span className="section-label justify-center">Rates</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Pricing</h2>
              <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
                Prices vary depending on complexity, optimisation requirements, and assets used.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {pricing.map((tier) => (
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
                    {tier.features.map((feat: string) => (
                      <li key={feat} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/contact"
                    className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${
                      tier.popular
                        ? "bg-white text-black hover:bg-gray-100"
                        : "border border-[var(--border)] text-white hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    Request
                  </a>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-xs text-[var(--text-dim)] mb-3">All pricing is per-avatar and varies by complexity.</p>
              <a href="/nsfw" className="text-sm text-[var(--accent)] hover:text-white transition-colors">
                View NSFW Pricing &rarr;
              </a>
            </div>
          </div>
        </section>

        <StatsSection />

        <div className="divider" />

        {/* CTA */}
        <section className="section relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[var(--accent)] opacity-[0.04] blur-[120px] rounded-full" />
          </div>
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Ready to commission?
              </h2>
              <p className="text-[var(--text-secondary)] max-w-lg mx-auto mb-8 text-base leading-relaxed">
                Send me a message on Discord at{" "}
                <strong className="text-white font-semibold">{site.discord}</strong> or
                submit a request and I&rsquo;ll get back to you.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="/contact" className="btn-primary inline-flex">
                  Start a Commission
                </a>
                <a
                  href="https://discord.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex"
                >
                  Open Discord
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
