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
              Premade avatar adopts ready to use in VRChat.
              Each adoptable is a unique, handcrafted design available at a fixed price —
              pick one you love and make it yours.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="#projects">
                <Layers className="h-4 w-4" />
                Browse Adoptables
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
            subtitle="An adoptable is a premade avatar design you can purchase and use immediately — no custom work needed."
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

      {/* How to adopt */}
      <section className="section section-alt relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-star)] opacity-[0.05] blur-[140px]" />
        </div>
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Process"
            title="How to adopt"
            subtitle="Pick a design, purchase, and receive your files — it's that simple."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <StepCard icon={Layers} title="1. Browse" desc="Pick an adoptable you love from the featured designs below." delay={0} />
            <StepCard icon={DollarSign} title="2. Purchase" desc="Pay the fixed price via PayPal or Payhip. No quotes, no waiting." delay={80} />
            <StepCard icon={CheckCircle2} title="3. Confirm" desc="I confirm your payment and prepare your files for delivery." delay={160} />
            <StepCard icon={Rocket} title="4. Receive" desc="Get your Unity-ready VRChat avatar files delivered straight to you." delay={240} />
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
            subtitle="Premade avatars available now at fixed prices."
          />
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredAdoptables.map((adoptable, i) => (
                <Reveal key={adoptable.id || i} delay={i * 80}>
                  <PremiumCard variant="marketplace" className="h-full p-0 overflow-hidden group" hoverGlow>
                    <div className="relative h-48 w-full overflow-hidden bg-[var(--bg)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cosmic)]/20 to-[var(--accent-nebula)]/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Palette className="h-12 w-12 text-[var(--accent)] opacity-40" />
                        <span className="absolute text-3xl opacity-20">🦴</span>
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
            title="Why choose Adoptables?"
            subtitle="Premade avatars at cheap, fixed prices — no custom work, no waiting, no hassle."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
             {[
                { icon: Zap, title: "Instant Availability", desc: "Adoptables are premade and ready now — no waiting for custom work." },
                { icon: DollarSign, title: "Cheap Fixed Prices", desc: "No quotes, no surprises. Every adoptable has a clear, affordable price." },
                { icon: ThumbsUp, title: "Proven Quality", desc: "Every adoptable is tested for performance, compatibility, and visual quality before listing." },
                { icon: ShieldCheck, title: "VRChat-Ready", desc: "All adoptables come as Unity-ready VRChat avatars. Just import and play." },
                { icon: Rocket, title: "Fast Delivery", desc: "Receive your files immediately after purchase. No lengthy creation process." },
                { icon: Heart, title: "Unique Designs", desc: "Each adoptable is a one-of-a-kind design. Stand out from the crowd." },
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
            title="What you need"
            subtitle="Almost nothing — just a VRChat account and Discord."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                { icon: CheckCircle2, title: "VRChat Account", desc: "You need a VRChat account to use the avatar files." },
                { icon: MessageCircle, title: "Discord", desc: "Message me on Discord to purchase and receive your adoptable." },
                { icon: DollarSign, title: "Payment", desc: "Pay via PayPal or Payhip. Fixed price, no quotes needed." },
                { icon: Rocket, title: "Unity", desc: "Basic Unity knowledge helps, but the files are ready to import straight into VRChat." },
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

      {/* Licence */}
      <section className="section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.04] blur-[100px]" />
        </div>
        <div className="container max-w-3xl">
          <SectionHeading
            align="center"
            eyebrow="Licence"
            title="Usage Rights"
            subtitle="What you can and can't do with your adoptable."
          />
          <PremiumCard variant="elevated" className="p-8">
            <div className="space-y-5 text-sm leading-relaxed text-[var(--text-secondary)]">
              <p>
                <strong className="text-white">Personal use only.</strong> Adoptables are sold for personal, non-commercial use in VRChat.
              </p>
              <p>
                <strong className="text-white">No redistribution.</strong> You may not resell, share, or redistribute the avatar files.
              </p>
              <p>
                <strong className="text-white">Modification allowed.</strong> You can tweak textures, accessories, and materials to make the avatar yours.
              </p>
              <p>
                <strong className="text-white">Refunds.</strong> Due to the digital nature of adoptables, refunds are not provided after file delivery.
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
            title="Pricing"
            subtitle="Fixed, cheap prices for premade avatars. No quotes, no surprises."
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
                        ...(adoptable.category ? [`${adoptable.category} design`] : []),
                        ...(adoptable.availability ? [`${adoptable.availability}`] : []),
                        "Unity-ready delivery",
                        "Instant download",
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
              All prices are fixed. No deposits required — pay and receive your files instantly.
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
              { q: "What is an adoptable?", a: "An adoptable is a premade avatar design you can purchase and use right away in VRChat. No custom work needed — just pick, pay, and play.", icon: HelpCircle },
              { q: "How much does an adoptable cost?", a: "Adoptables have fixed, cheap prices. No quotes, no hidden fees. Prices range from around £15 to £75 depending on complexity.", icon: DollarSign },
              { q: "How do I receive my adoptable?", a: "After purchase, you'll receive a Unity-ready VRChat avatar file (.unitypackage or .prefab). Blender source files available on request.", icon: Rocket },
              { q: "Are adoptables Quest compatible?", a: "Quest compatibility depends on the adoptable. I optimize for Quest where possible, but some features may be PC-only.", icon: ShieldCheck },
              { q: "Can I modify my adoptable?", a: "Yes! Adoptables come with source files so you can tweak textures, accessories, and more to make them truly yours.", icon: Wand2 },
              { q: "Do I own the adoptable?", a: "You receive a personal licence to use the adoptable in VRChat. Redistribution or resale is not permitted.", icon: FileText },
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
            <h2 className="display-lg mt-5 text-white">Ready to <span className="text-gradient-strong">Adopt</span>?</h2>
            <p className="lead mx-auto mt-4">
              Browse the featured adoptables below, pick one you love, and send me a message on Discord to purchase.
              Instant delivery, cheap prices, no waiting.
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
