"use client";

import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { PremiumCard } from "@/components/ui/Card";
import PricingCard from "@/components/ui/PricingCard";
import { getAdoptables, getAdoptableGallery, getAdoptableBeforeAfters } from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  ArrowRight,
  ArrowUpRight,
  Layers,
  GitCompare,
  Shield,
  Zap,
  FileText,
  AlertTriangle,
  Check,
  Star,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Palette,
  Wand2,
  Rocket,
  Clock,
  DollarSign,
  Users,
  Heart,
  Sparkles,
  Box,
  Smile,
  ThumbsUp,
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="h-[220px] w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
    </div>
  );
}

function AvailabilityBadge({ status }: { status?: string }) {
  const config: Record<string, { icon: any; label: string; className: string }> = {
    available: { icon: CheckCircle2, label: "Available", className: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
    sold: { icon: XCircle, label: "Sold", className: "text-red-400 border-red-500/40 bg-red-500/10" },
    reserved: { icon: MinusCircle, label: "Reserved", className: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  };
  const c = config[status || "available"] || config.available;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${c.className}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

function CategoryIcon({ category }: { category?: string }) {
  switch (category) {
    case "avatar": return <Smile className="h-4 w-4" />;
    case "accessory": return <Box className="h-4 w-4" />;
    case "clothing": return <Shield className="h-4 w-4" />;
    case "texture": return <Palette className="h-4 w-4" />;
    default: return <Layers className="h-4 w-4" />;
  }
}

function StepCard({ icon, title, desc, delay }: { icon: any; title: string; desc: string; delay: number }) {
  const Icon = icon;
  return (
    <Reveal delay={delay}>
      <div className="relative group">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[var(--accent-cosmic)] to-[var(--accent-nebula)] opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
        <PremiumCard variant="elevated" className="h-full p-6 relative">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="mb-1.5 text-sm font-bold text-white">{title}</h3>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{desc}</p>
        </PremiumCard>
      </div>
    </Reveal>
  );
}

/* FAQ Item component — extracted to avoid hooks-in-loop violation */
function FaqItem({ question, answer, icon: Icon }: { question: string; answer: string; icon: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-card)] transition-colors duration-300 hover:border-[var(--border-hover)]">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon className="h-4 w-4" />
          </span>
          <span className={`font-semibold transition-colors ${open ? "text-white" : "text-[var(--text)]"}`}>
            {question}
          </span>
        </span>
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--accent)] transition-all duration-300 ${
            open ? "rotate-180 bg-[var(--accent-soft)]" : ""
          }`}
        >
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>
      <div
        className="grid transition-all duration-500 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdoptablesPage() {
  const [adoptables, setAdoptables] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [beforeAfters, setBeforeAfters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [adoptablesData, galleryData, baData] = await Promise.all([
          getAdoptables(),
          getAdoptableGallery(),
          getAdoptableBeforeAfters(),
        ]);
        setAdoptables(adoptablesData);
        setGallery(galleryData);
        setBeforeAfters(baData);
      } catch (e) {
        console.error("Failed to load adoptables:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featuredAdoptables = adoptables.filter((m) => m.featured);
  const visibleAdoptables = adoptables.filter((m) => m.visible);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.12] blur-[130px]" />
        <div className="pointer-events-none absolute top-20 left-1/4 h-60 w-[500px] -translate-x-1/2 rounded-full bg-[var(--accent-nebula)] opacity-[0.08] blur-[120px]" />
        <div className="pointer-events-none absolute bottom-10 right-1/4 h-48 w-[400px] rounded-full bg-[var(--accent-star)] opacity-[0.06] blur-[100px]" />

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                Adoptables
              </span>
            <h1 className="display-xl mt-5 text-white">
              Adoptable <span className="text-gradient-strong">Services</span>
            </h1>
            <p className="lead mx-auto mt-4">
              Custom avatar adoptables designed and crafted by Bluey.
              From unique character designs to full avatar customisations, I create
              performance-ready adoptables tailored to your vision.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="#projects">
                <Layers className="h-4 w-4" />
                View Projects
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Commission One
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Clock, label: "Turnaround", value: "3–7 days" },
              { icon: ThumbsUp, label: "Satisfaction", value: "100%" },
              { icon: ShieldCheck, label: "Quality", value: "VRChat-ready" },
              { icon: MessageCircle, label: "Support", value: "24/7 Discord" },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 60}>
                <PremiumCard variant="elevated" className="p-5 text-center">
                  <stat.icon className="mx-auto mb-2 h-6 w-6 text-[var(--accent)]" />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-[var(--text-dim)]">{stat.label}</p>
                </PremiumCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What is an Adoptable? */}
      <section className="section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.06] blur-[120px]" />
          <div className="absolute right-0 bottom-0 h-[300px] w-[500px] rounded-full bg-[var(--accent-nebula)] opacity-[0.05] blur-[100px]" />
        </div>
        <div className="container">
          <SectionHeading
            eyebrow="What is it?"
            title="What is an Adoptable?"
            subtitle="An adoptable is a custom avatar design or edit created for you — a unique character or style you can use in VRChat."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
           {[
               {
                 icon: <Wand2 className="h-6 w-6" />,
                 title: "Custom Design",
                 desc: "A unique avatar design created from scratch or based on your references, tailored to your preferences.",
               },
               {
                 icon: <GitCompare className="h-6 w-6" />,
                 title: "Avatar Integration",
                 desc: "Combine elements from multiple avatars into a single cohesive, optimised character ready for VRChat.",
               },
               {
                 icon: <Shield className="h-6 w-6" />,
                 title: "Optimization",
                 desc: "Reduce polygon count, fix rigging issues, and ensure the adoptable runs smoothly in VRChat across PC and Quest.",
               },
             ].map((item, i) => (
               <Reveal key={item.title} delay={i * 80}>
                 <PremiumCard variant="elevated" className="h-full p-7" hoverGlow>
                   <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                     {item.icon}
                   </div>
                   <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
                   <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                 </PremiumCard>
               </Reveal>
             ))}
           </div>
         </div>
       </section>

      {/* How it works */}
      <section className="section section-alt relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-star)] opacity-[0.05] blur-[140px]" />
        </div>
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Process"
            title="How it works"
            subtitle="From idea to delivery in four simple steps."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <StepCard icon={MessageCircle} title="1. Enquire" desc="Send me a message on Discord with your idea, references, and avatar base." delay={0} />
            <StepCard icon={DollarSign} title="2. Quote & Deposit" desc="I review your request and send a detailed quote. A 50% deposit secures your slot." delay={80} />
            <StepCard icon={Wand2} title="3. Creation" desc="I work on your adoptable, sharing progress updates along the way." delay={160} />
            <StepCard icon={Rocket} title="4. Delivery" desc="You receive a Unity-ready VRChat avatar. Revisions included to make it perfect." delay={240} />
          </div>
        </div>
      </section>

      {/* Featured adoptables */}
      {featuredAdoptables.length > 0 && (
        <section id="projects" className="section relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/3 top-0 h-[350px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.06] blur-[120px]" />
          </div>
          <div className="container">
            <SectionHeading
              align="center"
              eyebrow="Featured"
              title="Featured Adoptables"
              subtitle="Some of my latest adoptable work. Click a card to see details."
            />
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredAdoptables.map((adoptable, i) => (
                <Reveal key={adoptable.id || i} delay={i * 80}>
                  <PremiumCard variant="marketplace" className="h-full p-0 overflow-hidden group" hoverGlow>
                    <div className="relative h-48 w-full overflow-hidden bg-[var(--bg)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cosmic)]/20 to-[var(--accent-nebula)]/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Palette className="h-12 w-12 text-[var(--accent)] opacity-40" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <AvailabilityBadge status={adoptable.availability} />
                      </div>
                      {adoptable.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-cosmic)]/40 bg-[var(--accent-cosmic)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-nebula)]">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center gap-2 text-[var(--accent)]">
                        <CategoryIcon category={adoptable.category} />
                        <span className="text-[11px] uppercase tracking-wider font-semibold">{adoptable.category || "avatar"}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-[var(--accent)] transition-colors">{adoptable.title || `Adoptable ${i + 1}`}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-2">{adoptable.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{adoptable.price || "Custom"}</span>
                        <ButtonLink href="/contact" variant="ghost" className="!py-1.5 !px-3 !text-xs">
                          Enquire
                          <ArrowRight className="h-3 w-3" />
                        </ButtonLink>
                      </div>
                    </div>
                  </PremiumCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why choose an Adoptable? */}
      <section className="section section-alt relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-star)] opacity-[0.05] blur-[140px]" />
        </div>
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Why choose us"
            title="Why choose an Adoptable?"
            subtitle="Professional adoptables save you time, money, and headaches compared to building an avatar from scratch."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
             {[
                { icon: Zap, title: "Faster Turnaround", desc: "Get a unique adoptable design without starting from zero. Most adoptables are completed in 3–7 days." },
                { icon: DollarSign, title: "Cost Effective", desc: "Adoptables are more affordable than full custom avatars because the design foundation is already established." },
                { icon: ThumbsUp, title: "Proven Results", desc: "Every adoptable is tested for performance, compatibility, and visual quality before delivery." },
                { icon: ShieldCheck, title: "Full Support", desc: "Revisions and troubleshooting included. If something breaks, I fix it." },
                { icon: Rocket, title: "Ready to Use", desc: "You receive a Unity-ready VRChat avatar file. No extra setup required on your end." },
                { icon: FileText, title: "Proof of Ownership", desc: "You provide all source assets. I only work with assets you own or have rights to use." },
             ].map((item, i) => (
               <Reveal key={item.title} delay={i * 60}>
                 <PremiumCard variant="marketplace" className="h-full p-6" hoverGlow>
                   <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                     <item.icon className="h-5 w-5" />
                   </div>
                   <h3 className="mb-1.5 text-sm font-bold text-white">{item.title}</h3>
                   <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                 </PremiumCard>
               </Reveal>
             ))}
           </div>
         </div>
       </section>

      {/* Example Showcase / Gallery */}
      <section className="section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/3 top-0 h-[350px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.05] blur-[110px]" />
        </div>
        <div className="container">
          <SectionHeading
            eyebrow="Gallery"
            title="Example Showcase"
            subtitle="A selection of adoptable work — click any image to view full size."
          />
          {loading ? (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : gallery.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((img, i) => (
                <Reveal key={img.id || i} delay={(i % 3) * 60}>
                  <div
                    onClick={() => {
                      setLightboxImages(gallery.map((g: any) => g.url));
                      setLightboxIndex(i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLightboxImages(gallery.map((g: any) => g.url));
                        setLightboxIndex(i);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View gallery image ${i + 1}`}
                    className="sheen group relative mb-4 block aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-all duration-500 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/40"
                  >
                    <img
                      src={img.url}
                       alt={`Adoptable ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                        <ImageIcon className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <PremiumCard variant="elevated" className="py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ImageIcon className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                Gallery images will appear here once available.
              </p>
            </PremiumCard>
          )}
        </div>
      </section>

      {/* Before & After Comparisons */}
      <section className="section section-alt relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-1/4 bottom-0 h-[300px] w-[400px] rounded-full bg-[var(--accent-nebula)] opacity-[0.05] blur-[100px]" />
        </div>
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Before & After"
            title="See the transformation"
            subtitle="Before and after comparisons showing the impact of adoptable work."
          />
          {loading ? (
            <div className="mt-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-[var(--bg)] animate-pulse" />
              ))}
            </div>
          ) : beforeAfters.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {beforeAfters.map((ba, i) => (
                <Reveal key={ba.id || i} delay={(i % 2) * 60}>
                  <div className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={ba.before_url} alt="Before" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <span className="absolute left-3 top-3 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">Before</span>
                      </div>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={ba.after_url} alt="After" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <span className="absolute left-3 top-3 rounded-full bg-[var(--accent)]/20 px-3 py-1 text-xs font-bold text-white">After</span>
                      </div>
                    </div>
                    {ba.label && (
                      <p className="p-4 text-center text-sm text-[var(--text-secondary)]">{ba.label}</p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <PremiumCard variant="elevated" className="py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <GitCompare className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                Before &amp; after comparisons will appear here once available.
              </p>
            </PremiumCard>
          )}
        </div>
      </section>

      {/* Supported Avatar Bases */}
      <section className="section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.04] blur-[120px]" />
        </div>
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Compatible Bases"
            title="Supported Avatar Bases"
            subtitle="I work with most VRChat avatar bases. If you are not sure, just ask."
          />
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {["VRChat Base", "Unity Avatars", "VRoid Studio", "Custom Avatar", "Quest Compatible", "PC Only"].map((base) => (
              <span key={base} className="chip">{base}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="section section-alt relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 bottom-0 h-[350px] w-[450px] -translate-x-1/2 rounded-full bg-[var(--accent-nebula)] opacity-[0.05] blur-[100px]" />
        </div>
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Requirements"
            title="What you need to provide"
            subtitle="To get started, make sure you have the following ready."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                { icon: MessageCircle, title: "Clear Description", desc: "Describe what you want in the adoptable design. Be as specific as possible." },
                { icon: ImageIcon, title: "Reference Images", desc: "Screenshots or renders of the adoptable design you want. More references = better results." },
                { icon: Box, title: "Avatar Base", desc: "The avatar base you want to use for the adoptable. Must be your own or licensed for modification." },
                { icon: ShieldCheck, title: "Ownership Proof", desc: "You must own or have the rights to all provided assets. This is required before work begins." },
              ].map((item, i) => (
               <Reveal key={item.title} delay={i * 60}>
                 <PremiumCard variant="elevated" className="flex gap-4 p-6" hoverGlow>
                   <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                     <item.icon className="h-5 w-5" />
                   </div>
                   <div>
                     <h3 className="mb-1 text-sm font-bold text-white">{item.title}</h3>
                     <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                   </div>
                 </PremiumCard>
               </Reveal>
             ))}
           </div>
         </div>
       </section>

      {/* Proof of Ownership Policy */}
      <section className="section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.04] blur-[100px]" />
        </div>
        <div className="container max-w-3xl">
          <SectionHeading
            align="center"
            eyebrow="Policy"
            title="Proof of Ownership"
            subtitle="I take intellectual property seriously. Here is how it works."
          />
          <PremiumCard variant="elevated" className="p-8">
            <div className="space-y-5 text-sm leading-relaxed text-[var(--text-secondary)]">
            <p>
                <strong className="text-white">You must own or have the rights to</strong> all assets you provide,
                including the avatar base, textures, and any other materials.
              </p>
              <p>
                Before I begin work, I may request proof of ownership. This can be a purchase receipt,
                license agreement, or written confirmation from the original creator.
              </p>
              <p>
                If I cannot verify ownership, I will not proceed with the commission. This policy protects
                both you and me from legal issues.
              </p>
              <p className="text-[var(--accent)]">
                No stolen or unlicensed content is accepted. Period.
              </p>
            </div>
            </PremiumCard>
          </div>
      </section>

      {/* Pricing Overview */}
      <section className="section section-alt relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[350px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--accent-nebula)] opacity-[0.05] blur-[110px]" />
        </div>
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Rates"
            title="Pricing Overview"
            subtitle="Prices vary depending on complexity. I will always give you a detailed quote before starting."
          />
          {visibleAdoptables.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {visibleAdoptables.map((adoptable, i) => (
                <Reveal key={adoptable.id || i} delay={i * 80}>
                  <PricingCard
                    tier={{
                      id: adoptable.id || String(i),
                      name: adoptable.title,
                      emoji: "🦴",
                      price: adoptable.price || "Custom",
                      badge: adoptable.featured ? "Popular" : null,
                      popular: adoptable.featured,
                      features: [
                        ...(adoptable.category ? [`Category: ${adoptable.category}`] : []),
                        ...(adoptable.availability ? [`Status: ${adoptable.availability}`] : []),
                        "Revisions included",
                        "VRChat-ready delivery",
                      ],
                    }}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <PremiumCard variant="elevated" className="py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Layers className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                No adoptables have been added yet.
              </p>
            </PremiumCard>
          )}
          <div className="mt-10 text-center">
            <p className="text-xs text-[var(--text-dim)]">
              All prices are per avatar. A 50% deposit is required before work begins.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/3 bottom-0 h-[300px] w-[400px] -translate-x-1/2 rounded-full bg-[var(--accent-star)] opacity-[0.04] blur-[100px]" />
        </div>
        <div className="container max-w-3xl">
          <SectionHeading
            align="center"
            eyebrow="Common questions"
            title="FAQ"
            subtitle="Quick answers to the things people ask most about adoptables."
          />
          <div className="mt-8 space-y-3">
            {[
              { q: "What is an adoptable?", a: "An adoptable is a custom avatar design or edit created for you — a unique character or style you can use in VRChat. This can include full designs, partial edits, or custom integrations.", icon: HelpCircle },
              { q: "How long does an adoptable take?", a: "Most adoptables take 3–7 days depending on complexity. Simple edits are faster; full custom designs take longer.", icon: Clock },
              { q: "Do you work with my existing avatar base?", a: "Yes. Provide the avatar base you want to use, and I will work with it. Make sure you own or have the rights to the base.", icon: Box },
              { q: "Is Quest compatible?", a: "Quest compatibility depends on the complexity of the adoptable. I optimize for Quest where possible, but some features may be PC-only.", icon: ShieldCheck },
              { q: "What payment methods do you accept?", a: "PayPal and Payhip only. A 50% deposit is required before I start work.", icon: DollarSign },
              { q: "What files do I get?", a: "A Unity-ready VRChat avatar file (.unitypackage or .prefab). Blender source files available on request.", icon: Rocket },
              { q: "Do you provide proof of ownership verification?", a: "Yes. I require proof that you own or have the rights to all provided assets before starting work.", icon: FileText },
            ].map((item, i) => (
              <Reveal key={item.q} delay={(i % 4) * 60}>
                <FaqItem question={item.q} answer={item.a} icon={item.icon} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.1] blur-[120px]" />
          <div className="absolute left-1/3 top-1/3 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-nebula)] opacity-[0.07] blur-[100px]" />
        </div>
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <Heart className="h-3.5 w-3.5 text-[var(--accent)]" />
              Ready to adopt?
            </span>
            <h2 className="display-lg mt-5 text-white">Start your <span className="text-gradient-strong">Adoptable</span></h2>
            <p className="lead mx-auto mt-4">
              Send me a message on Discord with your avatar base and what you want to achieve.
              I will review your request and provide a detailed quote.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/contact">
                <Heart className="h-4 w-4" />
                Commission an Adoptable
              </ButtonLink>
              <ButtonLink href="/pricing" variant="secondary">
                View Full Pricing
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
