"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/FeaturedWork";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import PricingCard from "@/components/ui/PricingCard";
import { getWorkflowSteps, getPricingTiers, getFaqItems, getSiteConfig, getApprovedReviews, getSiteImages } from "@/lib/db";
import Link from "next/link";
import { Star, Zap, ArrowRight, Check, Plus, Minus, Sparkles, MessageSquarePlus, Users } from "lucide-react";
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
  const [returningClients, setReturningClients] = useState<number>(0);
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
        setSite(s);
        setWorkflow(w);
        setPricing(p);
        setFaq(f);
        setReviews(r);
        setSiteImages(images);

        const statsRes = await fetch("/api/stats").then((res) => res.json()).catch(() => ({ returningClients: 0 }));
        setReturningClients(Number(statsRes.returningClients) || 0);
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
                <div key={i} className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
                  <div className="space-y-3">
                    <div className="h-4 w-1/2 rounded bg-[var(--bg)]" />
                    <div className="h-3 w-full rounded bg-[var(--bg)]" />
                    <div className="h-3 w-2/3 rounded bg-[var(--bg)]" />
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

        <StatsBand site={site} reviews={reviews} returningClients={returningClients} />

        <div className="divider" />

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

        <div className="divider" />

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

        <div className="divider" />

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
                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {reviews.slice(0, 6).map((review, i) => (
                    <Reveal key={review.id || i} delay={i * 60}>
                      <article className="premium-card group relative h-full overflow-hidden p-6 md:p-7">
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--accent)] opacity-[0.04] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.08]" />
                        <div className="relative flex items-center gap-4">
                          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-lg">
                            {review.display_name?.[0]?.toUpperCase() || "★"}
                          </div>
                          <div>
                            <p className="font-bold text-white">{review.display_name}</p>
                            <Stars rating={review.rating} />
                          </div>
                        </div>
                        <p className="relative mt-4 text-[var(--text-secondary)] leading-relaxed">"{review.review_text}"</p>
                        {review.image_url && (
                          <img src={review.image_url} alt="Commission preview" className="relative mt-4 w-full rounded-xl border border-[var(--border)] object-cover" />
                        )}
                      </article>
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
              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
                <div className="mb-4 text-5xl opacity-20">💬</div>
                <p className="mx-auto mb-6 max-w-md text-lg text-[var(--text-dim)]">
                  Client reviews will appear here after commissions are completed.
                </p>
                <ButtonLink href="/reviews">Leave a Review</ButtonLink>
              </div>
            )}
          </div>
        </section>

        <div className="divider" />

        {/* FAQ */}
        <section className="section">
          <div className="container max-w-3xl">
            <SectionHeading
              align="center"
              eyebrow="Common questions"
              title="FAQ"
              subtitle="Quick answers to the things people ask most."
            />
            <div className="space-y-3">
              {faq.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-card)] transition-colors duration-300 hover:border-[var(--border-hover)]"
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                    >
                      <span className={`font-semibold transition-colors ${open ? "text-white" : "text-[var(--text)]"}`}>
                        {item.question}
                      </span>
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--accent)] transition-all duration-300 ${
                          open ? "rotate-180 bg-[var(--accent-soft)]" : ""
                        }`}
                      >
                        {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                    <div
                      className="grid transition-all duration-500 ease-out"
                      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">{item.answer}</p>
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

        <div className="divider" />

        {/* Pricing */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              align="center"
              eyebrow="Rates"
              title="Pricing"
              subtitle="Clear, per-avatar pricing that scales with complexity. A 50% deposit starts the work; the balance is due on delivery."
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {pricing.map((tier, i) => (
                <Reveal key={tier.id || i} delay={i * 80}>
                  <PricingCard tier={tier} />
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

        <div className="divider" />

        {/* CTA */}
        <section className="section relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px]" />
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
                <ButtonLink href="https://discord.com/" variant="secondary" external>
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

function StatsBand({ site, reviews, returningClients }: { site: any; reviews: any[]; returningClients: number }) {
  const approved = reviews || [];
  const totalReviews = approved.length;
  const avgRating = totalReviews
    ? (approved.reduce((sum: number, r: any) => sum + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
    : "—";
  const stats = [
    { label: "Average rating", value: avgRating, icon: <Star className="h-4 w-4" /> },
    { label: "Total reviews", value: totalReviews, icon: <MessageSquarePlus className="h-4 w-4" /> },
    { label: "Turnaround", value: site.stat_delivery || "5-10 days", icon: <Zap className="h-4 w-4" /> },
    { label: "Returning clients", value: String(returningClients), icon: <Users className="h-4 w-4" /> },
  ];
  return (
    <section className="section !pb-0">
      <div className="container">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div className="group relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center transition-colors duration-500 hover:border-[var(--border-hover)]">
                <div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  {s.icon}
                </div>
                <p className="font-display text-2xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-xs text-[var(--text-dim)]">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewSummary({ reviews }: { reviews: any[] }) {
  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : "5.0";
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i <= Math.round(Number(avg)) ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--text-dim)]"}`} />
        ))}
      </div>
      <span className="font-semibold text-white">{avg}</span>
      <span className="text-sm text-[var(--text-secondary)]">
        from {reviews.length} verified client {reviews.length === 1 ? "review" : "reviews"}
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
          <div className="group relative aspect-[16/10] overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg)] shadow-lg shadow-black/30">
            {image ? (
              <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
            ) : (
              <div className="grid h-full place-items-center text-5xl opacity-30">{emoji}</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 via-transparent to-transparent" />
            {emoji && (
              <div className="absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[var(--bg-float)]/80 text-2xl backdrop-blur-md">
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
      {/* connecting line (desktop) */}
      <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent lg:block" />
      <ol className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {steps.map((step, i) => (
          <li key={step.title || i} className="group relative text-center">
            <div className="relative z-10 mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] text-2xl shadow-md transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-[var(--accent)]/50 group-hover:shadow-[var(--shadow-glow)]">
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
