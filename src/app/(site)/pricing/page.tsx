"use client";

import { getPricingTiers, getTosSections } from "@/lib/db";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PricingCard from "@/components/ui/PricingCard";
import { ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

export default function PricingPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [tosSections, setTosSections] = useState<any[]>([]);
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
            subtitle="Prices vary depending on the work needed. I&rsquo;ll always give you a quote before starting."
          />

          {tiers.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {tiers.map((tier, i) => (
                <Reveal key={tier.id || i} delay={i * 80}>
                  <PricingCard tier={tier} />
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