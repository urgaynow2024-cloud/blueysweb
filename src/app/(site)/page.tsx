"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/FeaturedWork";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { getWorkflowSteps, getPricingTiers, getFaqItems, getSiteConfig, getApprovedReviews, getSiteImages } from "@/lib/db";
import Link from "next/link";
import { Star, Zap, ArrowRight, Check, Plus, Minus, Sparkles, MessageSquarePlus, HelpCircle, Clock, DollarSign, ShieldCheck, Rocket } from "lucide-react";
import CommissionAvailability from "@/components/CommissionAvailability";

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

export default function Home() {
  const [site, setSite] = useState<any>({});
  const [workflow, setWorkflow] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [faq, setFaq] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [siteImages, setSiteImages] = useState<Record<string, { url: string }>>({});
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
        const ALLOWED_PRICING_TIERS = ["Light Blender Work", "Standard Avatar Work", "Advanced Avatar Work"];
        setSite(s);
        setWorkflow(w);
        setPricing(p.filter((t: any) => ALLOWED_PRICING_TIERS.includes(t.name)));
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
          <div className="container py-20">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="ad-shimmer h-40 rounded-[var(--r-md)]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/4 top-[-10%] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.08] blur-[180px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[400px] w-[600px] rounded-full bg-[var(--accent-nebula)] opacity-[0.06] blur-[150px]" />
        <div className="absolute left-[60%] top-[40%] h-[300px] w-[500px] rounded-full bg-[var(--accent-star)] opacity-[0.04] blur-[120px]" />
        <div className="absolute left-[10%] top-[60%] h-[350px] w-[500px] rounded-full bg-[var(--accent-4)] opacity-[0.03] blur-[140px] orb-slow" />
      </div>

      <Hero />

      <div className="relative z-10">
        <FeaturedWork />

        {/* Services */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Services"
              title="What I provide"
              subtitle="I work on VRChat avatars in a few different ways — from subtle edits to complete overhauls."
            />

            <div className="space-y-6 md:space-y-10">
              <ServiceRow
                emoji="✏️"
                image={siteImages.avatar_editing?.url}
                eyebrow="Avatar Editing"
                title="Avatar Editing"
                desc="Texture recolours, accessory additions, clothing fitting, hair combinations, and minor geometry tweaks to existing bases."
                features={["Texture recolours", "Accessory additions", "Clothing fitting", "Hair combinations", "Minor fixes"]}
              />
              <ServiceRow
                emoji="🔧"
                image={siteImages.blender_work?.url}
                eyebrow="Blender"
                title="Blender Work"
                desc="Asset creation, retopology, UV work, material setup, and mesh adjustments for clean avatar bases."
                features={["Asset creation", "Retopology", "UV & material work", "Mesh adjustments", "Clean topology"]}
                reverse
              />
              <ServiceRow
                emoji="⚙️"
                image={siteImages.unity_work?.url}
                eyebrow="Unity"
                title="Unity Setup"
                desc="Material configuration, toggles, optimisation, viseme setup, and VRChat-ready packaging."
                features={["Material config", "Toggle systems", "Performance tuning", "Viseme setup", "VRChat packaging"]}
              />
            </div>
          </div>
        </section>

        {/* Process timeline */}
        <section className="section">
          <div className="container">
            <SectionHeading
              align="center"
              eyebrow="Process"
              title="How it works"
              subtitle="A simple, transparent workflow from first message to final delivery."
            />
            <ProcessTimeline steps={workflow} />
            <div className="mt-12 text-center">
              <ButtonLink href="/contact" variant="secondary">
                Start Your Commission
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Client Feedback"
              title="Reviews"
              subtitle="What clients say about working together."
            />
            {reviews.length > 0 && <ReviewSummary reviews={reviews} />}
            {reviews.length > 0 ? (
              <>
                <div className="mx-auto max-w-3xl">
                  {reviews.slice(0, 6).map((review, i) => (
                    <Reveal key={review.id || i} delay={i * 60}>
                      <div className="review-divider">
                        <div className="flex items-start gap-4">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-sm font-bold text-white">
                            {review.display_name?.[0]?.toUpperCase() || "★"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-semibold text-white">{review.display_name}</p>
                              <Stars rating={review.rating} size="h-3 w-3" />
                            </div>
                            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">"{review.review_text}"</p>
                            {review.image_url && (
                              <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
                                <img src={review.image_url} alt="Commission preview" loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
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
                    <ButtonLink href="/reviews" variant="secondary">
                      View All Reviews
                      <ArrowRight className="h-4 w-4" />
                    </ButtonLink>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="mb-3 text-4xl opacity-30">💬</div>
                <p className="mx-auto mb-6 max-w-md text-sm text-[var(--text-dim)]">
                  Client reviews will appear here after commissions are completed.
                </p>
                <ButtonLink href="/reviews">Leave a Review</ButtonLink>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="container max-w-3xl">
            <SectionHeading
              align="center"
              eyebrow="Common questions"
              title="FAQ"
              subtitle="Quick answers to the things people ask most."
            />
            <div className="space-y-0">
              {faq.map((item, i) => {
                const open = openFaq === i;
                const faqIcon = item.key?.toLowerCase().includes("price") || item.key?.toLowerCase().includes("cost") || item.key?.toLowerCase().includes("payment")
                  ? DollarSign
                  : item.key?.toLowerCase().includes("time") || item.key?.toLowerCase().includes("long") || item.key?.toLowerCase().includes("fast")
                  ? Clock
                  : item.key?.toLowerCase().includes("quest") || item.key?.toLowerCase().includes("pc") || item.key?.toLowerCase().includes("performance")
                  ? ShieldCheck
                  : item.key?.toLowerCase().includes("file") || item.key?.toLowerCase().includes("get")
                  ? Rocket
                  : HelpCircle;
                const Icon = faqIcon;
                return (
                  <div
                    key={i}
                    className={`border-b border-[var(--border)] transition-all duration-300 ${open ? "bg-[rgba(255,255,255,0.015)]" : ""}`}
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 px-0 py-5 text-left"
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className={`font-semibold transition-colors ${open ? "text-white" : "text-[var(--text)]"}`}>
                          {item.question}
                        </span>
                      </span>
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[var(--accent)] transition-all duration-300 ${
                          open ? "rotate-180 bg-[var(--accent-soft)]" : ""
                        }`}
                      >
                        {open ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </span>
                    </button>
                    <div
                      className="grid transition-all duration-500 ease-out"
                      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-10 text-center">
              <ButtonLink href="/contact" variant="secondary">
                Have more questions?
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              align="center"
              eyebrow="Rates"
              title="Pricing"
              subtitle="Clear, per-avatar pricing that scales with complexity. A 50% deposit starts the work; the balance is due on delivery."
            />
            <div className="mx-auto max-w-3xl">
              {pricing.map((tier, i) => (
                <Reveal key={tier.id || i} delay={i * 80}>
                  <div className={`group py-6 md:py-8 ${i < pricing.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
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
                          {tier.features?.map((feat: string) => (
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
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
              <p className="text-xs text-[var(--text-dim)]">
                Starting from <span className="font-semibold text-[var(--text-secondary)]">£15</span> · typical turnaround{" "}
                <span className="font-semibold text-[var(--text-secondary)]">{site.stat_delivery || "5–10 days"}</span>
              </p>
              <Link href="/nsfw" className="text-sm text-[var(--accent)] transition-colors hover:text-white">
                View NSFW Pricing &rarr;
              </Link>
            </div>
          </div>
        </section>

        <CommissionAvailability />

        {/* CTA */}
        <section className="section relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.08] blur-[120px]" />
          </div>
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
                <ButtonLink href="/contact">
                  <Zap className="h-4 w-4" />
                  Start a Commission
                </ButtonLink>
                <ButtonLink href="https://discord.gg/zt48MZm5kD" variant="secondary" external>
                  Open Discord
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </div>
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

/* -------------------------------------------------------------------------- */

function ServiceRow({
  emoji,
  image,
  eyebrow,
  title,
  desc,
  features,
  reverse = false,
}: {
  emoji?: string;
  image?: string;
  eyebrow: string;
  title: string;
  desc: string;
  features: string[];
  reverse?: boolean;
}) {
  return (
    <Reveal>
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className={`lg:col-span-5 ${reverse ? "lg:order-2" : "order-2 lg:order-1"}`}>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white/[0.03] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            {eyebrow}
          </span>
          <h3 className="heading-md text-white">{title}</h3>
          <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">{desc}</p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Check className="h-3 w-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className={`lg:col-span-7 ${reverse ? "lg:order-1" : "order-1 lg:order-2"}`}>
          <div className="group relative aspect-[16/10] overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[rgba(255,255,255,0.02)]">
            {image ? (
              <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
            ) : (
              <div className="grid h-full place-items-center text-5xl opacity-30">{emoji}</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/60 via-transparent to-transparent" />
            {emoji && (
              <div className="absolute bottom-4 left-4 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[rgba(8,11,18,0.7)] text-xl backdrop-blur-md">
                {emoji}
              </div>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function ProcessTimeline({ steps }: { steps: any[] }) {
  if (!steps.length) return null;
  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent lg:block" />
      <ol className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {steps.map((step, i) => (
          <li key={step.title || i} className="group relative text-center">
            <div className="relative z-10 mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-2xl transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-[var(--accent)]/50 group-hover:bg-[var(--accent-soft)]">
              {step.emoji}
              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-4)] text-[10px] font-bold text-[#04060a]">
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
