"use client";

import { getPricingTiers, getTosSections } from "@/lib/db";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { useState, useEffect } from "react";

interface PricingTier {
  id?: string;
  name: string;
  emoji?: string;
  price: string;
  badge?: string | null;
  popular?: boolean;
  features?: string[];
}

interface TosSection {
  title?: string;
  icon?: string;
  items?: string[];
}

export default function PricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [tosSections, setTosSections] = useState<TosSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [t, tos] = await Promise.all([getPricingTiers(), getTosSections()]);
        setTiers(t);
        setTosSections(tos);
      } catch (e) {
        console.error("Failed to load pricing data:", e);
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-7">
                  <div className="h-6 w-1/2 rounded bg-[var(--bg)]" />
                  <div className="mt-4 h-8 w-1/3 rounded bg-[var(--bg)]" />
                  <div className="mt-6 space-y-2">
                    <div className="h-3 w-full rounded bg-[var(--bg)]" />
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
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[var(--accent-2)] opacity-[0.05] blur-[120px]" />

        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Rates"
            title="Pricing"
            subtitle="Prices can vary depending on avatar complexity, optimisation requirements, and assets used."
          />

          {tiers.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {tiers.map((tier, i) => (
                <Reveal key={tier.id || i} delay={i * 80}>
                  <div className="group flex h-full flex-col rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-7 shadow-lg shadow-black/20 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/50">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl transition-transform duration-300 group-hover:scale-110">
                        {tier.emoji}
                      </span>
                      <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <p className="font-display text-3xl font-bold tracking-tight text-white">{tier.price}</p>
                    </div>
                    <p className="mt-1.5 text-xs uppercase tracking-wider text-[var(--text-dim)]">Per avatar</p>
                    <div className="my-5 h-px w-full bg-gradient-to-r from-[var(--border-strong)] to-transparent" />
                    <ul className="mb-8 flex-1 space-y-3">
                      {(tier.features || []).map((feat: string) => (
                        <li key={feat} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <ButtonLink href="/contact" variant="primary" className="w-full justify-center">
                      Request Commission
                      <ArrowRight className="h-4 w-4" />
                    </ButtonLink>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] py-12 text-center">
              <p className="text-[var(--text-dim)]">No pricing tiers have been added yet.</p>
            </div>
          )}

          {tosSections.length > 0 && (
            <div className="mt-20">
              <SectionHeading
                align="center"
                eyebrow="Terms"
                title="Terms of Service"
                subtitle="By commissioning me, you agree to the rules below. Please read carefully before ordering."
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {tosSections.map((section, i) => (
                  <Reveal key={section.title || i} delay={(i % 4) * 60}>
                    <div className="group h-full rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)]">
                      <h2 className="mb-4 flex items-center gap-3 text-base font-bold text-white">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-lg">{section.icon}</span>
                        {section.title}
                      </h2>
                      <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                        {(section.items || []).map((item: string, j: number) => (
                          <li key={`${i}-${j}`} className="flex items-start gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--text-secondary)]">
                <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                Every commission is handled with care and clear communication.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}