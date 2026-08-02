"use client";

import Link from "next/link";
import { getFbxMashups } from "@/lib/db";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowLeft, Box, Workflow, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Send Assets",
    desc: "Share your base FBX, part assets, and reference images.",
  },
  {
    step: 2,
    title: "Combine & Edit",
    desc: "I merge parts, clean up geometry, fix weights, and set up blendshapes.",
  },
  {
    step: 3,
    title: "Unity Setup",
    desc: "Export, configure in Unity, test in VRChat, and deliver final files.",
  },
];

export default function FbxMashupsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getFbxMashups();
        setItems(data);
      } catch (e) {
        console.error("Failed to load FBX mashups:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <section className="page relative overflow-hidden">
          <div className="container">
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
                  <div className="h-64 bg-[var(--bg)]" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-1/2 rounded bg-[var(--bg)]" />
                    <div className="h-3 w-full rounded bg-[var(--bg)]" />
                    <div className="h-3 w-2/3 rounded bg-[var(--bg)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[130px]" />

        <div className="container">
          <div className="mb-8">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-dim)] hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>
          </div>

          <SectionHeading
            align="center"
            eyebrow="FBX Mashups"
            icon={<Box className="h-4 w-4 text-[var(--accent)]" />}
            title="Custom FBX Edits & Mashups"
            subtitle="I create custom avatar edits by combining, modifying, and adjusting existing FBX assets to create unique characters."
          />

          <Reveal>
            <div className="mx-auto max-w-3xl rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)]/60 p-8 mb-12">
              <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
                This can include mesh editing, combining parts from different models,
                cleanup, weighting adjustments, and preparing assets for VRChat. All work
                is performed in Blender and Unity, following VRChat&rsquo;s technical requirements
                for both PC and Quest platforms.
              </p>
            </div>
          </Reveal>

          {/* How it works */}
          <div className="mb-16">
            <Reveal>
              <div className="mb-10 flex items-center gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Workflow className="h-5 w-5" />
                </div>
                <h2 className="heading-md text-white">How It Works</h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((step, i) => (
                <Reveal key={step.step} delay={i * 80}>
                  <div className="group h-full rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)]">
                    <div className="mb-4 flex items-center justify-center">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)] text-xs font-bold text-[#04060a]">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Portfolio showcase */}
          {items.length > 0 && (
            <div className="mb-16">
              <Reveal>
                <div className="mb-10 flex items-center gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Box className="h-5 w-5" />
                  </div>
                  <h2 className="heading-md text-white">FBX Mashup Portfolio</h2>
                </div>
              </Reveal>

              <div className="space-y-8">
                {items.map((item, i) => (
                  <Reveal key={item.id || i} delay={(i % 4) * 50}>
                    <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-all duration-500 hover:border-[var(--border-hover)]">
                      <div className="grid lg:grid-cols-2 gap-0">
                        <div className="aspect-[4/3] relative">
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-5xl opacity-20 bg-[var(--bg-elevated)]">
                              &#x1F5FA;
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                          <p className="text-sm text-[var(--text-dim)] mb-4">Base: {item.base_avatar}</p>

                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-2">
                                Parts Used
                              </h4>
                              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                                {(item.parts_used || []).map((part: string) => (
                                  <li key={part} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                                    <span>{part}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-2">
                                Changes Made
                              </h4>
                              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                                {(item.changes_made || []).map((change: string) => (
                                  <li key={change} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                                    <span>{change}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-2">
                                Software Used
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {(item.software_used || []).map((soft: string) => (
                                  <span
                                    key={soft}
                                    className="px-2.5 py-1 bg-[var(--bg)] rounded text-xs text-[var(--text-secondary)]"
                                  >
                                    {soft}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <ButtonLink href="/before-ordering" variant="secondary">
              Request an FBX Mashup
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}