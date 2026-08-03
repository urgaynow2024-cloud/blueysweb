"use client";

import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, ShieldCheck, Layers, Settings, HelpCircle, Star, ShoppingCart, ExternalLink } from "lucide-react";
import { getFaqItems, getFbxMashups } from "@/lib/db";

interface FbxMashup {
  id: string;
  title: string;
  model_a: string;
  model_b: string;
  price: string;
  description: string;
  image_url: string;
  how_to_get: string;
  tags: string[];
  featured: boolean;
}

export default function FbxMashupsPage() {
  const [mashups, setMashups] = useState<FbxMashup[]>([]);
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [mashupsData, faq] = await Promise.all([
          getFbxMashups(),
          getFaqItems(),
        ]);
        setMashups(mashupsData as FbxMashup[]);
        setFaqItems(faq);
      } catch (e) {
        console.error("Failed to load FBX mashups:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const tags = Array.from(new Set(mashups.flatMap((m) => m.tags || [])));
  const filtered = filter === "All" ? mashups : mashups.filter((m) => (m.tags || []).includes(filter));
  const featured = mashups.filter((m) => m.featured);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[130px]" />

        <div className="container">
          <div className="lg:flex lg:items-center lg:gap-14">
            <div className="lg:w-1/2">
              <span className="eyebrow">
                <span className="pill-dot" />
                FBX Mashups
              </span>
              <h1 className="display-xl mt-5 max-w-2xl text-white">Pre-Made FBX Mashups</h1>
              <p className="lead mt-6 max-w-md">
                Ready-to-use avatar mashups. Each one combines two licensed avatar bases into a unique character — available now.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <ButtonLink href="#listings">
                  Browse Mashups
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="secondary">
                  Custom Order
                </ButtonLink>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative mx-auto mt-10 lg:mt-0">
                <div className="aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/50">
                  <div className="grid h-full w-full place-items-center text-6xl opacity-20">
                    <Layers className="h-20 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is an FBX Mashup */}
      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="About FBX Mashups"
            title="What is an FBX Mashup?"
            subtitle="An FBX mashup combines parts from two avatar bases into one cohesive avatar."
          />
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { title: "Two avatar bases", desc: "Each mashup combines exactly two licensed avatar bases into one unified character." },
                { title: "Full rigging", desc: "All parts are properly rigged and weighted to work together seamlessly in VRChat." },
                { title: "Texture bake", desc: "Textures are baked and optimised for performance while maintaining visual quality." },
                { title: "Unity setup", desc: "Final avatar is fully set up in Unity with VRChat SDK, ready for upload." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 80}>
                  <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                    <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mashup Listings */}
      <section className="section" id="listings">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Available Mashups"
            title="Pre-Made FBX Mashups"
            subtitle="Browse available mashups. Each listing shows the two base models, price, and how to purchase."
          />

          {tags.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              {["All", ...tags].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    filter === t
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30"
                      : "border border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
                  <div className="h-[220px] w-full rounded-t-2xl bg-[var(--bg)]" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-[var(--bg)]" />
                    <div className="h-4 w-1/2 rounded bg-[var(--bg)]" />
                    <div className="h-10 w-full rounded bg-[var(--bg)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((mashup, i) => (
                <Reveal key={mashup.id} delay={(i % 3) * 80}>
                  <div className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/40">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-[var(--bg-elevated)]">
                      {mashup.image_url ? (
                        <img
                          src={mashup.image_url}
                          alt={mashup.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-4xl opacity-30">
                          <Layers className="h-12 w-12" />
                        </div>
                      )}
                      {mashup.featured && (
                        <span className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs font-bold text-white shadow-lg">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-1 text-lg font-bold text-white">{mashup.title}</h3>
                      <p className="mb-3 text-xs text-[var(--text-dim)]">
                        {mashup.model_a} + {mashup.model_b}
                      </p>
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {mashup.description}
                      </p>
                      <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">How to get</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{mashup.how_to_get}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">{mashup.price}</span>
                        <ButtonLink href={mashup.how_to_get.startsWith("http") ? mashup.how_to_get : "/contact"} variant="primary" size="sm" external={mashup.how_to_get.startsWith("http")}>
                          <ShoppingCart className="h-3.5 w-3.5" />
                          {mashup.how_to_get.startsWith("http") ? "Purchase" : "Enquire"}
                        </ButtonLink>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Layers className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                No FBX mashups listed yet. Check back soon or contact me for custom work.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="section section-alt">
          <div className="container max-w-3xl">
            <SectionHeading
              align="center"
              eyebrow="FAQ"
              title="Frequently Asked Questions"
              subtitle="Common questions about FBX mashups."
            />
            <div className="mt-12 space-y-3">
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
                        {open ? <HelpCircle className="h-3.5 w-3.5" /> : <HelpCircle className="h-3.5 w-3.5" />}
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
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px]" />
        </div>
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <Star className="h-3.5 w-3.5 text-[var(--accent)]" />
              Want something custom?
            </span>
            <h2 className="display-lg mt-5 text-white">Custom FBX Mashup Commission</h2>
            <p className="lead mx-auto mt-4">
              Don&apos;t see what you&apos;re looking for? I take custom mashup commissions too.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/contact">
                Start a Commission
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                View All Services
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
