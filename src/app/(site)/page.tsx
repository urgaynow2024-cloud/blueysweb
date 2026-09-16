"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/FeaturedWork";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import CommissionTierCard from "@/components/ui/CommissionTierCard";
import { ButtonLink } from "@/components/ui/Button";
import { getWorkflowSteps, getPricingTiers, getFaqItems, getSiteConfig, getApprovedReviews, getSiteImages, getAdoptables } from "@/lib/db";
import Link from "next/link";
import { Star, Zap, ArrowRight, Check, Sparkles, Clock, ShieldCheck, Rocket, HelpCircle, DollarSign, Palette, Box, Layers, Brush, Wrench } from "lucide-react";

function Stars({ rating, size = "h-4 w-4" }: { rating?: number; size?: string }) {
  const value = rating || 5;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= value ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--text-dim)]"}`} />
      ))}
    </div>
  );
}

function ServiceCard({ icon: Icon, title, desc, features }: { icon: React.ElementType; title: string; desc: string; features: string[] }) {
  return (
    <Reveal>
      <div className="card p-6 md:p-8 h-full flex flex-col">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="heading-sm text-white mb-2">{title}</h3>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)] flex-1 mb-4">{desc}</p>
        <ul className="space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Check className="h-2.5 w-2.5" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

function ProcessTimeline({ steps }: { steps: any[] }) {
  if (!steps.length) return null;
  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--accent)]/30 to-transparent hidden lg:block" />
      <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, i) => (
          <li key={step.title || i} className="group relative text-center">
            <div className="relative z-10 mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-2xl transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-[var(--accent)]/50 group-hover:bg-[var(--accent-soft)]">
              {step.emoji}
              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[10px] font-bold text-[#04060a]">
                {i + 1}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">{step.title}</h3>
            <p className="mt-1.5 px-1 text-xs leading-relaxed text-[var(--text-dim)]">{step.desc}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ReviewSummary({ reviews }: { reviews: any[] }) {
  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : "5.0";
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i <= Math.round(Number(avg)) ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--text-dim)]"}`} />
        ))}
      </div>
      <span className="font-semibold text-white">{avg}</span>
      <span className="text-sm text-[var(--text-secondary)]">
        · from {reviews.length} verified client {reviews.length === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
}

function AdoptableCard({ adoptable }: { adoptable: any }) {
  return (
    <Reveal>
      <Link
        href={`/adoptables/${adoptable.id}`}
        className="product-card group block overflow-hidden"
      >
        {adoptable.main_image && (
          <div className="product-image relative aspect-[4/3] overflow-hidden">
            <img
              src={adoptable.main_image}
              alt={adoptable.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/60 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`badge ${adoptable.availability === "available" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : adoptable.availability === "reserved" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}`}>
                {adoptable.availability === "available" ? "Available" : adoptable.availability === "reserved" ? "Reserved" : "Sold"}
              </span>
            </div>
          </div>
        )}
        <div className="p-5">
          <h3 className="font-semibold text-white group-hover:text-[var(--accent)] transition-colors">{adoptable.title}</h3>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)] line-clamp-2">{adoptable.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-white">
              {adoptable.sfw_price ? `£${adoptable.sfw_price}` : adoptable.price ? `£${adoptable.price}` : "N/A"}
            </span>
            <span className="text-xs font-medium text-[var(--accent)] group-hover:underline">View details →</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function Home() {
  const [site, setSite] = useState<any>({});
  const [workflow, setWorkflow] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [faq, setFaq] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [siteImages, setSiteImages] = useState<Record<string, { url: string }>>({});
  const [adoptables, setAdoptables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, w, p, f, r, images, a] = await Promise.all([
          getSiteConfig(),
          getWorkflowSteps(),
          getPricingTiers(),
          getFaqItems(),
          getApprovedReviews(),
          getSiteImages(),
          getAdoptables(),
        ]);
        const ALLOWED_PRICING_TIERS = ["Light Blender Work", "Standard Avatar Work", "Advanced Avatar Work"];
        setSite(s);
        setWorkflow(w);
        setPricing(p.filter((t: any) => ALLOWED_PRICING_TIERS.includes(t.name)));
        setFaq(f);
        setReviews(r);
        setSiteImages(images);
        setAdoptables(a.filter((ad: any) => ad.visible !== false).slice(0, 6));
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
        <div className="container py-20">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
                <div className="h-[220px] w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 1. Hero */}
      <Hero />

      <div className="relative z-10">
        {/* 2. Featured Artwork */}
        <FeaturedWork />

        {/* 3. What Bluey Makes — editorial feature block */}
        <section id="what-i-make" className="section section-alt section-transition" aria-labelledby="what-i-make-heading">
          <div className="container">
            <SectionHeading
              eyebrow="What Bluey Makes"
              title="Custom avatars, edits & accessories"
              subtitle="From texture recolours and accessory additions to full avatar overhauls — every commission is built around your vision."
              align="left"
              divider={false}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ServiceCard
                icon={Palette}
                title="Texture & Colour Work"
                desc="Recolours, pattern edits, material variants, and custom texture painting for existing avatar bases."
                features={["Full recolours", "Pattern design", "Material variants", "Custom painting", "Shader tweaks"]}
              />
              <ServiceCard
                icon={Box}
                title="Accessory & Prop Addition"
                desc="Adding jewellery, wings, tails, horns, weapons, glasses, and other props with proper weighting and toggles."
                features={["Jewellery & wearables", "Wings & tails", "Horns & ears", "Weapons & props", "Toggle systems"]}
              />
              <ServiceCard
                icon={Layers}
                title="Clothing & Hair Fitting"
                desc="Fitting clothing items and hair to your avatar base with clean weight painting and physics setup."
                features={["Clothing fitting", "Hair swaps & styling", "Weight painting", "PhysBone setup", "Quest optimisation"]}
              />
              <ServiceCard
                icon={Brush}
                title="Blender Asset Work"
                desc="Custom modelling, retopology, UV unwrapping, and asset creation for unique avatar components."
                features={["Custom modelling", "Retopology", "UV unwrapping", "Asset creation", "Clean topology"]}
              />
              <ServiceCard
                icon={Wrench}
                title="Unity Setup & Optimisation"
                desc="Complete Unity configuration: materials, shaders, toggles, visemes, performance tuning, and VRChat packaging."
                features={["Material & shader setup", "Toggle systems", "Viseme configuration", "Performance tuning", "VRChat packaging"]}
              />
              <ServiceCard
                icon={Sparkles}
                title="Full Avatar Overhauls"
                desc="Complete transformations combining Blender modelling, texture work, and Unity setup into a cohesive new avatar."
                features={["Full redesign", "Multi-piece outfits", "Complex toggles", "Cross-platform ready", "Source files optional"]}
              />
            </div>
            <div className="mt-10 text-center">
              <Link href="/services" className="btn-secondary inline-flex items-center gap-2">
                View All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Commission Process */}
        <section id="process" className="section section-transition" aria-labelledby="process-heading">
          <div className="container">
            <SectionHeading
              align="center"
              eyebrow="Process"
              title="How it works"
              subtitle="A simple, transparent workflow from first message to final delivery."
            />
            <ProcessTimeline steps={workflow} />
            <div className="mt-12 text-center">
              <Link href="/commission" className="btn-secondary inline-flex items-center gap-2">
                Start Your Commission
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Adoptables */}
        <section id="adoptables" className="section section-alt section-transition" aria-labelledby="adoptables-heading">
          <div className="container">
            <div className="mb-8 md:mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="section-label">Adoptables</span>
                <h2 id="adoptables-heading" className="display-lg text-white mt-2">Featured Adoptables</h2>
                <p className="mt-3 max-w-xl text-[var(--text-secondary)]">Pre-made avatar designs ready to claim — unique characters with full Unity setup.</p>
              </div>
              <Link href="/adoptables" className="btn-secondary inline-flex items-center gap-2">
                Browse All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {adoptables.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {adoptables.map((adoptable, i) => (
                  <AdoptableCard key={adoptable.id} adoptable={adoptable} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="empty-state-title">No adoptables yet</h3>
                <p className="empty-state-desc">Adoptables will appear here when available.</p>
              </div>
            )}
          </div>
        </section>

        {/* 6. Services — condensed overview with visual cards */}
        <section id="services" className="section section-transition" aria-labelledby="services-heading">
          <div className="container">
            <SectionHeading
              eyebrow="Services at a Glance"
              title="Tiered commission options"
              subtitle="Choose the tier that fits your project scope — from quick edits to complete overhauls."
              align="center"
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {pricing.map((tier: any, i: number) => (
                <Reveal key={tier.id || i} delay={i * 60}>
                  <CommissionTierCard tier={tier} />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/services" className="btn-secondary inline-flex items-center gap-2">
                View All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/services" className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-white transition-colors">
                <DollarSign className="h-3.5 w-3.5" />
                Full Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* 7. Reviews */}
        <section id="reviews" className="section section-alt section-transition" aria-labelledby="reviews-heading">
          <div className="container">
            <SectionHeading
              eyebrow="Client Feedback"
              title="Reviews"
              subtitle="What clients say about working together."
            />
            {reviews.length > 0 && <ReviewSummary reviews={reviews} />}
            {reviews.length > 0 ? (
              <>
                <div className="mx-auto max-w-3xl space-y-0">
                  {reviews.slice(0, 6).map((review, i) => (
                    <Reveal key={review.id || i} delay={i * 60}>
                      <div className="review-divider border-b border-[var(--border)] last:border-0">
                        <div className="py-6 flex items-start gap-4">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-sm font-bold text-white">
                            {review.display_name?.[0]?.toUpperCase() || "★"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-semibold text-white">{review.display_name}</p>
                              <Stars rating={review.rating} size="h-3 w-3" />
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">"{review.review_text}"</p>
                            {review.image_url && (
                              <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
                                <img src={review.image_url} alt="Commission preview" loading="lazy" className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
                {reviews.length > 3 && (
                  <div className="mt-10 text-center">
                    <Link href="/reviews" className="btn-secondary inline-flex items-center gap-2">
                      View All Reviews
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="mb-3 text-4xl opacity-30">💬</div>
                <p className="mx-auto mb-6 max-w-md text-sm text-[var(--text-dim)]">
                  Client reviews will appear here after commissions are completed.
                </p>
                <Link href="/reviews" className="btn-secondary">
                  Leave a Review
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 8. Final Commission CTA */}
        <section id="cta" className="section section-transition" aria-labelledby="cta-heading">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow justify-center">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                Ready when you are
              </span>
              <h2 className="display-lg mt-5 text-white">Ready to commission?</h2>
              <p className="lead mx-auto mt-4">
                Send me a message on Discord at{" "}
                <strong className="font-semibold text-white">{site.discord}</strong>, or submit a request and
                I&rsquo;ll get back to you.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/commission" className="btn-primary btn-md">
                  <Zap className="h-4 w-4" />
                  Start a Commission
                </Link>
                <a href="https://discord.gg/zt48MZm5kD" className="btn-secondary btn-md" target="_blank" rel="noopener noreferrer">
                  Open Discord
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--text-dim)]">
                <Link href="/tos" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/credits" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                  Credits
                </Link>
                <Link href="/faq" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}