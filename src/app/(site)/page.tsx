"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/FeaturedWork";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { getWorkflowSteps, getPricingTiers, getFaqItems, getSiteConfig, getApprovedReviews, getSiteImages, getAdoptables } from "@/lib/db";
import Link from "next/link";
import { Star, Zap, ArrowRight, Check, Sparkles, Clock, ShieldCheck, Rocket, HelpCircle, DollarSign } from "lucide-react";
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

function ServiceRow({
  image,
  eyebrow,
  title,
  desc,
  features,
  reverse = false,
}: {
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
        <div className={`lg:col-span-6 ${reverse ? "lg:order-2" : "order-2 lg:order-1"}`}>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white/[0.03] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            {eyebrow}
          </span>
          <h3 className="heading-md text-white">{title}</h3>
          <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">{desc}</p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Check className="h-2.5 w-2.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className={`lg:col-span-6 ${reverse ? "lg:order-1" : "order-1 lg:order-2"}`}>
          <div className="group relative aspect-[16/10] overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
            {image ? (
              <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            ) : (
              <div className="grid h-full place-items-center text-5xl opacity-30">★</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/50 via-transparent to-transparent" />
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
      <ol className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
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
        className="group relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)]"
      >
        {adoptable.main_image && (
          <div className="relative aspect-[4/3] overflow-hidden">
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      <Hero />

      <div className="relative z-10">
        {/* Featured Artwork / Portfolio */}
        <section id="portfolio" className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Portfolio"
              title="Featured Artwork"
              subtitle="Recent commissions and avatar customisations."
            />
            <FeaturedWork />
            <div className="mt-10 text-center">
              <Link href="/portfolio" className="btn-secondary inline-flex items-center gap-2">
                View All Portfolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Services"
              title="What I provide"
              subtitle="I work on VRChat avatars in a few different ways — from subtle edits to complete overhauls."
            />

            <div className="space-y-8 md:space-y-12">
              <ServiceRow
                image={siteImages.avatar_editing?.url}
                eyebrow="Avatar Editing"
                title="Avatar Editing"
                desc="Texture recolours, accessory additions, clothing fitting, hair combinations, and minor geometry tweaks to existing bases."
                features={["Texture recolours", "Accessory additions", "Clothing fitting", "Hair combinations", "Minor fixes"]}
              />
              <ServiceRow
                image={siteImages.blender_work?.url}
                eyebrow="Blender"
                title="Blender Work"
                desc="Asset creation, retopology, UV work, material setup, and mesh adjustments for clean avatar bases."
                features={["Asset creation", "Retopology", "UV & material work", "Mesh adjustments", "Clean topology"]}
                reverse
              />
              <ServiceRow
                image={siteImages.unity_work?.url}
                eyebrow="Unity"
                title="Unity Setup"
                desc="Material configuration, toggles, optimisation, viseme setup, and VRChat-ready packaging."
                features={["Material config", "Toggle systems", "Performance tuning", "Viseme setup", "VRChat packaging"]}
              />
            </div>
          </div>
        </section>

        {/* Featured Adoptables */}
        <section className="section">
          <div className="container">
            <div className="mb-8 md:mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Adoptables</span>
                <h2 className="display-lg text-white mt-2">Featured Adoptables</h2>
                <p className="mt-3 max-w-xl text-[var(--text-secondary)]">Pre-made avatar designs ready to claim.</p>
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

        {/* Commission Process */}
        <section className="section section-alt">
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

        {/* Reviews */}
        <section className="section">
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

        {/* FAQ */}
        <section className="section section-alt">
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
                        {open ? <span className="h-3 w-3">−</span> : <span className="h-3 w-3">+</span>}
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
              <Link href="/commission" className="btn-secondary">
                Have more questions?
              </Link>
            </div>
          </div>
        </section>

        {/* Commission Availability */}
        <CommissionAvailability />

        {/* Final CTA */}
        <section className="section">
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
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}