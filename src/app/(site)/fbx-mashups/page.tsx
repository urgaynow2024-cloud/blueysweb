"use client";

import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import PricingCard from "@/components/ui/PricingCard";
import { getFbxMashups, getFbxGallery, getFbxBeforeAfters } from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ArrowRight, ArrowUpRight, Layers, GitCompare, Shield, Zap, FileText, AlertTriangle, Check, Star, Image as ImageIcon, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="h-[220px] w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
    </div>
  );
}

/* FAQ Item component — extracted to avoid hooks-in-loop violation */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-card)] transition-colors duration-300 hover:border-[var(--border-hover)]">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
      >
        <span className={`font-semibold transition-colors ${open ? "text-white" : "text-[var(--text)]"}`}>
          {question}
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

export default function FbxMashupsPage() {
  const [mashups, setMashups] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [beforeAfters, setBeforeAfters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [mashupsData, galleryData, baData] = await Promise.all([
          getFbxMashups(),
          getFbxGallery(),
          getFbxBeforeAfters(),
        ]);
        setMashups(mashupsData);
        setGallery(galleryData);
        setBeforeAfters(baData);
      } catch (e) {
        console.error("Failed to load FBX mashups:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featuredMashups = mashups.filter((m) => m.featured);
  const visibleMashups = mashups.filter((m) => m.visible);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px]" />

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              <Layers className="h-3.5 w-3.5 text-[var(--accent)]" />
              FBX Mashups
            </span>
            <h1 className="display-xl mt-5 text-white">FBX Mashup Services</h1>
            <p className="lead mx-auto mt-4">
              Transform existing VRChat avatars with professional FBX mashup work.
              From base swaps to full mesh integration, I handle the technical heavy
              lifting so you get a clean, performance-ready result.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="#projects">View Projects</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Commission One
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* What is an FBX Mashup? */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="What is it?"
            title="What is an FBX Mashup?"
            subtitle="An FBX mashup is the process of combining, modifying, or integrating existing 3D avatar models (in FBX format) into a new, custom VRChat avatar."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: <Layers className="h-6 w-6" />,
                title: "Base Swaps",
                desc: "Replace the base mesh of an existing avatar with a different one while keeping all the original materials, toggles, and animations intact.",
              },
              {
                icon: <GitCompare className="h-6 w-6" />,
                title: "Mesh Integration",
                desc: "Combine multiple FBX files into a single optimized avatar, merging geometry, materials, and animation controllers.",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Optimization",
                desc: "Reduce polygon count, fix rigging issues, and ensure the mashup runs smoothly in VRChat across PC and Quest.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="group h-full rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--border-hover)]">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose an FBX Mashup? */}
      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Why choose us"
            title="Why choose an FBX Mashup?"
            subtitle="Professional FBX mashups save you time, money, and headaches compared to building an avatar from scratch."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: "⚡", title: "Faster Turnaround", desc: "Build on an existing base instead of starting from zero. Most mashups are completed in 3–7 days." },
              { emoji: "💰", title: "Cost Effective", desc: "Mashups are more affordable than full custom avatars because the heavy lifting is already done." },
              { emoji: "🎯", title: "Proven Results", desc: "Every mashup is tested for performance, compatibility, and visual quality before delivery." },
              { emoji: "🔧", title: "Full Support", desc: "Revisions and troubleshooting included. If something breaks, I fix it." },
              { emoji: "📦", title: "Ready to Use", desc: "You receive a Unity-ready VRChat avatar file. No extra setup required on your end." },
              { emoji: "🛡", title: "Proof of Ownership", desc: "You provide all source assets. I only work with assets you own or have rights to use." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <div className="group h-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)]">
                  <div className="mb-3 text-2xl transition-transform duration-300 group-hover:scale-110">{item.emoji}</div>
                  <h3 className="mb-2 text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Example Showcase / Gallery */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Gallery"
            title="Example Showcase"
            subtitle="A selection of FBX mashup work — click any image to view full size."
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
                      alt={`FBX Mashup ${i + 1}`}
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
            <div className="mt-8 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ImageIcon className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                Gallery images will appear here once available.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Before & After Comparisons */}
      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Before & After"
            title="See the transformation"
            subtitle="Before and after comparisons showing the impact of FBX mashup work."
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
            <div className="mt-8 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <GitCompare className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                Before &amp; after comparisons will appear here once available.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Supported Avatar Bases */}
      <section className="section">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Compatible Bases"
            title="Supported Avatar Bases"
            subtitle="I work with most VRChat avatar bases. If you are not sure, just ask."
          />
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {["VRChat Base", "Unity Avatars", "VRoid Studio", "Custom FBX", "Quest Compatible", "PC Only"].map((base) => (
              <span key={base} className="chip">{base}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Requirements"
            title="What you need to provide"
            subtitle="To get started, make sure you have the following ready."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              { icon: <FileText className="h-5 w-5" />, title: "Source FBX File", desc: "The FBX file of the avatar base you want to use. Must be your own or licensed for modification." },
              { icon: <ImageIcon className="h-5 w-5" />, title: "Reference Images", desc: "Screenshots or renders of the avatar you want to achieve. More references = better results." },
              { icon: <Check className="h-5 w-5" />, title: "Clear Description", desc: "Describe what you want changed, added, or integrated. Be as specific as possible." },
              { icon: <AlertTriangle className="h-5 w-5" />, title: "Ownership Proof", desc: "You must own or have the rights to all provided assets. This is required before work begins." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <div className="flex gap-4 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all duration-500 hover:border-[var(--border-hover)]">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Proof of Ownership Policy */}
      <section className="section">
        <div className="container max-w-3xl">
          <SectionHeading
            align="center"
            eyebrow="Policy"
            title="Proof of Ownership"
            subtitle="I take intellectual property seriously. Here is how it works."
          />
          <div className="mt-8 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-8">
            <div className="space-y-5 text-sm leading-relaxed text-[var(--text-secondary)]">
              <p>
                <strong className="text-white">You must own or have the rights to</strong> all assets you provide,
                including the FBX file, textures, and any other materials.
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
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Rates"
            title="Pricing Overview"
            subtitle="Prices vary depending on complexity. I will always give you a detailed quote before starting."
          />
          {visibleMashups.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {visibleMashups.map((mashup, i) => (
                <Reveal key={mashup.id || i} delay={i * 80}>
                  <PricingCard
                    tier={{
                      id: mashup.id || String(i),
                      name: mashup.title,
                      emoji: "🔄",
                      price: mashup.price || "Custom",
                      badge: mashup.featured ? "Popular" : null,
                      popular: mashup.featured,
                      features: [
                        ...(mashup.avatar_base ? [`Base: ${mashup.avatar_base}`] : []),
                        ...(mashup.software_used || []).map((s: string) => `Uses ${s}`),
                        "Revisions included",
                        "VRChat-ready delivery",
                      ],
                    }}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Layers className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                No FBX Mashups have been added yet.
              </p>
            </div>
          )}
          <div className="mt-10 text-center">
            <p className="text-xs text-[var(--text-dim)]">
              All prices are per avatar. A 50% deposit is required before work begins.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container max-w-3xl">
          <SectionHeading
            align="center"
            eyebrow="Common questions"
            title="FAQ"
            subtitle="Quick answers to the things people ask most about FBX mashups."
          />
          <div className="mt-8 space-y-3">
            {[
              { q: "What is an FBX mashup?", a: "An FBX mashup is the process of combining or modifying existing 3D avatar models (in FBX format) into a new VRChat avatar. This can include base swaps, mesh integration, and optimization." },
              { q: "How long does a mashup take?", a: "Most FBX mashups take 3–7 days depending on complexity. Simple base swaps are faster; full mesh integrations take longer." },
              { q: "Do you work with my existing avatar base?", a: "Yes. Provide the FBX file of the avatar base you want to use, and I will work with it. Make sure you own or have the rights to the base." },
              { q: "Is Quest compatible?", a: "Quest compatibility depends on the complexity of the mashup. I optimize for Quest where possible, but some features may be PC-only." },
              { q: "What payment methods do you accept?", a: "PayPal and Payhip only. A 50% deposit is required before I start work." },
              { q: "What files do I get?", a: "A Unity-ready VRChat avatar file (.unitypackage or .prefab). Blender source files available on request." },
              { q: "Do you provide proof of ownership verification?", a: "Yes. I require proof that you own or have the rights to all provided assets before starting work." },
            ].map((item, i) => (
              <Reveal key={item.q} delay={(i % 4) * 60}>
                <FaqItem question={item.q} answer={item.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px]" />
        </div>
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
              Ready to mash up?
            </span>
            <h2 className="display-lg mt-5 text-white">Start your FBX Mashup</h2>
            <p className="lead mx-auto mt-4">
              Send me a message on Discord with your avatar base and what you want to achieve.
              I will review your request and provide a detailed quote.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/contact">
                <Zap className="h-4 w-4" />
                Commission an FBX Mashup
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

