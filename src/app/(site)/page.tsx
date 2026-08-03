"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/FeaturedWork";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import PricingCard from "@/components/ui/PricingCard";
import ClientTestimonials from "@/components/ClientTestimonials";
import {
  getWorkflowSteps,
  getPricingTiers,
  getApprovedReviews,
  getSiteConfig,
  getHomepageStats,
  getServices,
  getFaqItems,
} from "@/lib/db";
import Link from "next/link";
import { Star, ArrowRight, Plus, Minus, Sparkles, Users, Zap } from "lucide-react";
import CommissionAvailability from "@/components/CommissionAvailability";

interface SiteConfig {
  discord_url?: string;
  discord?: string;
  stat_delivery?: string;
  queue_wait_time?: string;
  [k: string]: string | number | undefined;
}
interface WorkflowStep {
  id?: string;
  title?: string;
  description?: string;
  emoji?: string;
  sort_order?: number;
}
interface PricingTier {
  id?: string;
  name: string;
  price: string;
  is_nsfw?: boolean;
  features?: string[];
  emoji?: string;
  badge?: string | null;
  popular?: boolean;
}
interface Review {
  id?: string;
  display_name?: string;
  image_url?: string;
  rating?: number;
  review_text?: string;
  created_at?: string;
}
interface StatItem {
  id?: string;
  label: string;
  value: number | string;
  suffix: string;
  sublabel: string;
}
interface Service {
  id?: string;
  title: string;
  image_url?: string;
  emoji?: string;
  desc?: string;
  description?: string;
  features?: string[];
}
interface FaqItem {
  id?: string;
  question?: string;
  answer?: string;
  sort_order?: number;
}

export default function Home() {
  const [site, setSite] = useState<SiteConfig>({});
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [pricing, setPricing] = useState<PricingTier[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [homepageStats, setHomepageStats] = useState<StatItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, w, p, r, stats, svcs, faq] = await Promise.all([
          getSiteConfig(),
          getWorkflowSteps(),
          getPricingTiers(),
          getApprovedReviews(),
          getHomepageStats(),
          getServices(),
          getFaqItems(),
        ]);
        setSite(s);
        setWorkflow(w);
        setPricing(p);
        setReviews(r);
        setHomepageStats(stats);
        setServices(svcs);
        setFaqItems(faq);
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

  const discordUrl = site.discord_url || site.discord
    ? site.discord_url?.startsWith("http")
      ? site.discord_url
      : `https://discord.com/users/${encodeURIComponent(site.discord ?? "")}`
    : "";
  const minPrice = pricing.filter((t) => !t.is_nsfw).sort((a, b) => {
    const na = Number(String(a.price || "").replace(/[^0-9.]/g, ""));
    const nb = Number(String(b.price || "").replace(/[^0-9.]/g, ""));
    return na - nb;
  })[0]?.price;
  const turnaround = site.stat_delivery || site.queue_wait_time || "";

  return (
    <div className="relative">
      <Hero />

      <div className="relative z-10">
        {/* Portfolio showcase */}
        <section className="section" id="portfolio">
          <div className="container">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
              <div>
                <span className="section-label">Portfolio</span>
                <h2 className="display-lg text-white">Recent Work</h2>
                <p className="mt-3 max-w-xl text-[var(--text-secondary)]">VRChat avatar edits, FBX mashups, custom clothing, and texture work.</p>
              </div>
              <a href="/portfolio" className="btn-secondary inline-flex items-center gap-2">
                View All Work
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <FeaturedWork />
          </div>
        </section>

        {/* Why Choose Bluey */}
        <section className="section" id="why">
          <div className="container">
            <div className="mb-12 text-center">
              <span className="section-label">Why Bluey</span>
              <h2 className="display-lg text-white">Why Choose Bluey Commissions</h2>
              <p className="lead mx-auto mt-4 max-w-2xl">
                Professional VRChat avatar services built on quality, trust, and performance.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "🎨", title: "VRChat Specialised", desc: "Built specifically for VRChat creators. I understand the platform, the limits, and the workflow." },
                { icon: "⚡", title: "Performance First", desc: "Every avatar is optimised for smooth performance in VRChat. No lag, no crashes." },
                { icon: "🔒", title: "Asset Safe", desc: "Full proof of ownership required for all avatar bases. No stolen assets, no exceptions." },
                { icon: "🚀", title: "Fast Turnaround", desc: "Most commissions completed within 2-3 weeks. Rush orders available on request." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 80}>
                  <div className="group h-full rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-7 shadow-lg shadow-black/20 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/50">
                    <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">{item.icon}</div>
                    <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        {services.length > 0 && (
          <section className="section section-alt" id="services">
            <div className="container">
              <SectionHeading
                eyebrow="Services"
                title="What I provide"
                subtitle="Specialised VRChat avatar services — from subtle edits to complete FBX mashups."
              />

              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {services.map((svc, i) => (
                  <ServiceShowcaseCard key={svc.title || i} service={svc} delay={i * 80} />
                ))}
              </div>

              <div className="mt-12 text-center">
                <ButtonLink href="/services" variant="secondary">
                  View All Services
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
          </section>
        )}

        {/* Stats band */}
        {homepageStats.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="mb-12 text-center">
                <span className="section-label">Statistics</span>
                <h2 className="display-lg text-white">Numbers Speak Louder</h2>
                <p className="lead mx-auto mt-4 max-w-2xl">
                  Built with care, delivered with pride — here’s what the numbers look like.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {homepageStats.map((stat, i) => (
                  <StatCard
                    key={stat.id || i}
                    icon={<StatIcon label={stat.label} />}
                    label={stat.label}
                    value={stat.value}
                    suffix={stat.suffix}
                    sublabel={stat.sublabel}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {reviews.length > 0 && (
          <section className="section section-alt">
            <div className="container">
              <div className="mb-12 text-center">
                <span className="section-label">Client Feedback</span>
                <h2 className="display-lg text-white">What Clients Say</h2>
                <p className="lead mx-auto mt-4 max-w-2xl">
                  Don’t just take my word for it — here’s what clients have to say about their commissioned avatars.
                </p>
              </div>

              <ClientTestimonials
                testimonials={reviews.slice(0, 6).map((review) => ({
                  id: review.id ?? "",
                  name: review.display_name ?? "",
                  avatar: review.image_url || "",
                  rating: review.rating ?? 5,
                  text: review.review_text ?? "",
                  commissioned: review.created_at
                    ? new Date(review.created_at).toLocaleDateString()
                    : "",
                }))}
              />
            </div>
          </section>
        )}

        {/* Process timeline */}
        {workflow.length > 0 && (
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
        )}

        {/* FAQ */}
        {faqItems.length > 0 && (
          <section className="section section-alt">
            <div className="container max-w-3xl">
              <SectionHeading
                align="center"
                eyebrow="Common questions"
                title="FAQ"
                subtitle="Quick answers to the things people ask most."
              />
              <div className="space-y-3">
                {faqItems.map((item, i) => {
                  const open = openFaq === i;
                  return (
                    <div
                      key={item.id || i}
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
        )}

        {/* Pricing */}
        {pricing.filter((t) => !t.is_nsfw).length > 0 && (
          <section className="section">
            <div className="container">
              <SectionHeading
                align="center"
                eyebrow="Rates"
                title="Pricing"
                subtitle="Clear, per-avatar pricing that scales with complexity. A 50% deposit starts the work; the balance is due on delivery."
              />
              <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
                {pricing.filter((t) => !t.is_nsfw).map((tier, i) => (
                  <Reveal key={tier.id || i} delay={i * 80}>
                    <PricingCard tier={tier} />
                  </Reveal>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
                {minPrice && (
                  <p className="text-xs text-[var(--text-dim)]">
                    Starting from <span className="font-semibold text-[var(--text-secondary)]">{minPrice}</span>
                    {turnaround && <span> · typical turnaround <span className="font-semibold text-[var(--text-secondary)]">{turnaround}</span></span>}
                  </p>
                )}
                <Link href="/nsfw" className="text-sm text-[var(--accent)] transition-colors hover:text-white">
                  View NSFW Pricing &rarr;
                </Link>
              </div>
            </div>
          </section>
        )}

        <CommissionAvailability />

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
                Send me a message on Discord
                {site.discord ? (
                  <strong className="font-semibold text-white"> {site.discord}</strong>
                ) : null}
                , or submit a request and I’ll get back to you.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <ButtonLink href="/contact">
                  <Zap className="h-4 w-4" />
                  Start a Commission
                </ButtonLink>
                <ButtonLink href="/queue" variant="secondary">
                  View Commission Queue
                  <Users className="h-4 w-4" />
                </ButtonLink>
                {discordUrl && (
                  <ButtonLink href={discordUrl} variant="secondary" external>
                    Open Discord
                  </ButtonLink>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const STAT_ICONS: Record<string, React.ReactNode> = {
  Commissions: <span className="text-2xl">🎨</span>,
  Clients: <span className="text-2xl">👥</span>,
  Rating: <span className="text-2xl">⭐</span>,
  Reviews: <span className="text-2xl">💬</span>,
  Blender: <span className="text-2xl">🔧</span>,
  Unity: <span className="text-2xl">⚙️</span>,
  Response: <span className="text-2xl">⏱</span>,
  Delivery: <span className="text-2xl">🚚</span>,
};

function StatIcon({ label }: { label: string }) {
  return STAT_ICONS[label] || <Star className="h-5 w-5 text-[var(--accent)]" />;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  sublabel,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  sublabel: string;
}) {
  return (
    <Reveal>
      <div className="group relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center shadow-lg transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/50">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[80px] transition-opacity duration-500 group-hover:opacity-[0.08]" />
        <div className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-500 group-hover:scale-110 group-hover:bg-[var(--accent-glow)]/20">
          {icon}
        </div>
        <div className="relative">
          <p className="text-2xl font-bold text-white">
            {value}
            {suffix}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">{label}</p>
          <p className="mt-1 text-xs text-[var(--text-dim)]">{sublabel}</p>
        </div>
      </div>
    </Reveal>
  );
}

function ServiceShowcaseCard({ service, delay }: { service: Service; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="group relative h-full overflow-hidden rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg shadow-black/30 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/50">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[var(--accent)] opacity-[0.03] blur-[80px] transition-opacity duration-500 group-hover:opacity-[0.06]" />

        <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)]">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-3xl opacity-30">{service.emoji || "✨"}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-50" />
          <div className="absolute bottom-3 left-3 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-xl backdrop-blur">
            {service.emoji || "✨"}
          </div>
        </div>

        <div className="relative">
          <span className="section-label mb-2">Service</span>
          <h3 className="heading-md text-white">{service.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{service.desc || service.description}</p>

          <ul className="mt-4 grid grid-cols-1 gap-2 text-xs text-[var(--text-secondary)]">
            {(service.features || []).map((f) => (
              <li key={f} className="flex items-center gap-1.5">
                <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

function ProcessTimeline({ steps }: { steps: WorkflowStep[] }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="relative">
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
            <p className="mt-1.5 px-1 text-xs leading-relaxed text-[var(--text-dim)]">{step.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
