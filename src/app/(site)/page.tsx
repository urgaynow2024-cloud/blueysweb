"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import PricingCard from "@/components/ui/PricingCard";
import ShowcaseCarousel from "@/components/ShowcaseCarousel";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ScrollShowcase from "@/components/ScrollShowcase";
import ClientTestimonials from "@/components/ClientTestimonials";
import { getWorkflowSteps, getPricingTiers, getApprovedReviews, getSiteImages, getSiteConfig, getHeroContent, getHomepageStats, getServices, getFbxMashups, getBeforeOrderingItems, getTosSections, getPortfolioImages, getFaqItems } from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Link from "next/link";
import { Star, Zap, ArrowRight, Check, Plus, Minus, Sparkles, Users, Box } from "lucide-react";
import CommissionAvailability from "@/components/CommissionAvailability";

export default function Home() {
  const [site, setSite] = useState<any>({});
  const [workflow, setWorkflow] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [siteImages, setSiteImages] = useState<Record<string, { url: string }>>({});
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [heroContent, setHeroContent] = useState<any[]>([]);
  const [homepageStats, setHomepageStats] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [fbxMashups, setFbxMashups] = useState<any[]>([]);
  const [beforeOrdering, setBeforeOrdering] = useState<any[]>([]);
  const [tosSections, setTosSections] = useState<any[]>([]);
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [returningClients, setReturningClients] = useState<number>(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, w, p, r, images, hero, stats, svcs, fbx, bo, tos, faq] = await Promise.all([
          getSiteConfig(),
          getWorkflowSteps(),
          getPricingTiers(),
          getApprovedReviews(),
          getSiteImages(),
          getHeroContent(),
          getHomepageStats(),
          getServices(),
          getFbxMashups(),
          getBeforeOrderingItems(),
          getTosSections(),
          getFaqItems(),
        ]);
        setSite(s);
        setWorkflow(w);
        setPricing(p);
        setReviews(r);
        setSiteImages(images);
        setHeroContent(hero);
        setHomepageStats(stats);
        setServices(svcs);
        setFbxMashups(fbx);
        setBeforeOrdering(bo);
        setTosSections(tos);
        setFaqItems(faq);

        const statsRes = await fetch("/api/stats").then((res) => res.json()).catch(() => ({ returningClients: 0 }));
        setReturningClients(Number(statsRes.returningClients) || 0);

        if (isSupabaseConfigured && supabase) {
          const { data: portData } = await supabase
            .from("portfolio_images")
            .select("url")
            .order("sort_order", { ascending: true })
            .limit(15);
          if (portData) setPortfolioImages(portData.map((img) => img.url));
        }
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

  const displayHero = heroContent.length > 0 ? heroContent[0] : null;
  const displayStats = homepageStats.length > 0 ? homepageStats : [];
  const displayServices = services.length > 0 ? services : [];
  const displayFbx = fbxMashups.length > 0 ? fbxMashups : [];
  const displayBeforeOrdering = beforeOrdering.length > 0 ? beforeOrdering : [];
  const displayTos = tosSections.length > 0 ? tosSections : [];

  return (
    <div className="relative">
      <Hero />

      <div className="relative z-10">
        {/* Featured Projects carousel */}
        <section className="section section-alt" id="work">
          <div className="container">
            <ShowcaseCarousel
              projects={fbxMashups.map((fbx: any) => ({
                id: fbx.id,
                title: fbx.title,
                category: fbx.base_avatar || "FBX Mashup",
                image: fbx.thumbnail_url || "",
                beforeImage: fbx.before_image_url,
                afterImage: fbx.after_image_url,
              }))}
            />
          </div>
        </section>

        {/* Scroll showcase marquee */}
        <section className="section">
          <div className="container">
            <div className="mb-12 text-center">
              <span className="section-label">Recent Work</span>
              <h2 className="display-lg text-white">Recent Showcase</h2>
              <p className="lead mx-auto mt-4 max-w-2xl">
                A continuous scroll of recent avatar commissions and FBX mashups. Each piece is crafted with attention to detail and performance.
              </p>
            </div>
            <ScrollShowcase images={portfolioImages} title="" />
          </div>
        </section>

        {/* Stats band */}
        {displayStats.length > 0 && (
          <section className="section section-alt">
            <div className="container">
              <div className="mb-12 text-center">
                <span className="section-label">Statistics</span>
                <h2 className="display-lg text-white">Numbers Speak Louder</h2>
<p className="lead mx-auto mt-4 max-w-2xl">
              Built with care, delivered with pride - here&rsquo;s what the numbers look like.
            </p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {displayStats.map((stat, i) => (
                  <StatCard
                    key={stat.id || i}
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

        {/* Services with images */}
        {displayServices.length > 0 && (
          <section className="section">
            <div className="container">
              <SectionHeading
                eyebrow="Services"
                title="What I provide"
                subtitle="I work on VRChat avatars in a few different ways - from subtle edits to complete overhauls."
              />

              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {displayServices.map((svc, i) => (
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

        {/* FBX Mashups spotlight */}
        {displayFbx.length > 0 && (
          <section className="section section-alt">
            <div className="container">
              <div className="relative overflow-hidden rounded-[var(--r-xl)] border border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/5 via-[var(--accent)]/3 to-[var(--accent)]/5 p-8 md:p-14">
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[120px]" />
                <div className="absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-[var(--accent-2)] opacity-[0.04] blur-[140px]" />
                <div className="relative flex flex-col items-center gap-8 md:flex-row">
                  <div className="flex-1">
                    <span className="eyebrow mb-2">
                      <span className="pill-dot animate-pulse" />
                      Specialty Service
                    </span>
                    <h2 className="display-lg text-white">FBX Mashups &amp; Hybrid Avatars</h2>
                    <p className="lead mt-4 max-w-xl">
                      Combining multiple FBX models into one cohesive avatar â€" blending bodies, outfits,
                      accessories, and props from different sources into a single VRChat-ready character.
                    </p>
                    <ul className="mt-6 grid grid-cols-1 gap-2.5 text-sm text-[var(--text-secondary)]">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[var(--accent)]" /> Merge body parts from different models
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[var(--accent)]" /> Clothing and accessory swaps
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[var(--accent)]" /> Weight painting and cleanup
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[var(--accent)]" /> Full VRChat SDK integration
                      </li>
                    </ul>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <ButtonLink href="/fbx-mashups">
                        <Box className="h-4 w-4" />
                        See FBX Examples
                      </ButtonLink>
                      <ButtonLink href="/contact" variant="secondary">
                        Request a Mashup
                        <ArrowRight className="h-4 w-4" />
                      </ButtonLink>
                    </div>
                  </div>
                  <div className="relative mx-auto w-full max-w-sm flex-shrink-0">
                    <div className="relative overflow-hidden rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/50">
                      {displayFbx[0]?.thumbnail_url ? (
                        <img
                          src={displayFbx[0].thumbnail_url}
                          alt="FBX mashup example"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[var(--text-dim)]">
                          <Sparkles className="h-10 w-10 animate-pulse opacity-40" />
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-sm font-medium text-white">{displayFbx[0]?.title || "Hybrid character"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Before/After comparisons */}
        {displayFbx.length > 0 && (
          <section className="section">
            <div className="container">
              <SectionHeading
                align="center"
                eyebrow="Transformations"
                title="Before &amp; After"
                subtitle="See the transformation from concept to completed avatar."
              />

              <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
                {displayFbx.map((project, i) => (
                  <div key={project.id || i}>
                    <BeforeAfterSlider
                      beforeImage={project.before_image_url || project.thumbnail_url}
                      afterImage={project.after_image_url || project.thumbnail_url}
                      title={project.title}
                      category={project.base_avatar}
                    />
                  </div>
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
                Don&rsquo;t just take my word for it — here&rsquo;s what clients have to say about their commissioned avatars.
              </p>
            </div>

            <ClientTestimonials
              testimonials={reviews.slice(0, 6).map((review: any) => ({
                id: review.id,
                name: review.display_name,
                avatar: review.image_url || "",
                rating: review.rating || 5,
                text: review.review_text,
                commissioned: new Date(review.created_at).toLocaleDateString(),
              }))}
            />
          </div>
        </section>
        )}

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

        {/* FAQ */}
        <section className="section section-alt">
          <div className="container max-w-3xl">
            <SectionHeading
              align="center"
              eyebrow="Common questions"
              title="FAQ"
              subtitle="Quick answers to the things people ask most."
            />
            <div className="space-y-3">
              {(faqItems.length > 0 ? faqItems : []).map((item: any, i: number) => {
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

        {/* Pricing */}
        <section className="section">
          <div className="container">
            <SectionHeading
              align="center"
              eyebrow="Rates"
              title="Pricing"
              subtitle="Clear, per-avatar pricing that scales with complexity. A 50% deposit starts the work; the balance is due on delivery."
            />
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {pricing.map((tier, i) => (
                <Reveal key={tier.id || i} delay={i * 80}>
                  <PricingCard tier={tier} />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
              <p className="text-xs text-[var(--text-dim)]">
                Starting from <span className="font-semibold text-[var(--text-secondary)]">Â£15</span> Â· typical turnaround{" "}
                <span className="font-semibold text-[var(--text-secondary)]">{site.stat_delivery || "5â€“10 days"}</span>
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
                <strong className="font-semibold text-white">{site.discord || "BlueyBarks"}</strong>, or submit a request and
                I&rsquo;ll get back to you.
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
            {value}{suffix}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">{label}</p>
          <p className="mt-1 text-xs text-[var(--text-dim)]">{sublabel}</p>
        </div>
      </div>
    </Reveal>
  );
}

function ServiceShowcaseCard({ service, delay }: { service: any; delay?: number }) {
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
            <div className="grid h-full w-full place-items-center text-4xl opacity-30">{service.emoji}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-50" />
          <div className="absolute bottom-3 left-3 flex items-center justify-center rounded-xl border border-white/10 bg-white/10 text-2xl backdrop-blur">
            {service.emoji}
          </div>
        </div>

        <div className="relative">
          <span className="section-label mb-2">Service</span>
          <h3 className="heading-md text-white">{service.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{service.desc}</p>

          <ul className="mt-4 grid grid-cols-1 gap-2 text-xs text-[var(--text-secondary)]">
            {(service.features || []).map((f: string) => (
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

function ProcessTimeline({ steps }: { steps: any[] }) {
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
            <p className="mt-1.5 px-1 text-xs leading-relaxed text-[var(--text-dim)]">{step.desc}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
