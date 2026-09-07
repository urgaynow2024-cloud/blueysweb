"use client";

import { useState, useEffect } from "react";
import { pricingTiers, additionalServices, tosSections } from "@/data/site";
import { getPricingTiers } from "@/lib/db";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PricingCard from "@/components/ui/PricingCard";
import { PremiumCard } from "@/components/ui/Card";
import { Sparkles, Info } from "lucide-react";

const ALLOWED_PRICING_TIERS = ["Light Blender Work", "Standard Avatar Work", "Advanced Avatar Work"];

export default function PricingPage() {
  const [pricing, setPricing] = useState(pricingTiers);
  const [services, setServices] = useState(additionalServices);

  useEffect(() => {
    async function load() {
      const dbPricing = await getPricingTiers();
      if (dbPricing && dbPricing.length > 0) {
        const filtered = dbPricing.filter((t: any) => ALLOWED_PRICING_TIERS.includes(t.name));
        setPricing(filtered.length > 0 ? filtered : pricingTiers);
      }
    }
    load();
  }, []);

  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-20" />
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[var(--accent-cosmic)] opacity-[0.06] blur-[120px] orb-slow" />

        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Rates"
            title="Pricing"
            subtitle="Prices vary depending on the work needed. I&apos;ll always give you a quote before starting."
          />

          <Reveal delay={0}>
            <div className="mx-auto mb-12 max-w-2xl rounded-2xl border border-[var(--border-strong)] bg-white/[0.03] px-6 py-5 text-center backdrop-blur-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                <Sparkles className="h-3.5 w-3.5" />
                Flexible, workload-based pricing
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Prices are ranges, not fixed packages. The final cost depends on complexity, scope, and time required.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {pricing.map((tier, i) => (
              <Reveal key={tier.id || i} delay={i * 80}>
                <PricingCard tier={tier} />
              </Reveal>
            ))}
          </div>

          <div className="mt-24">
            <SectionHeading
              align="center"
              eyebrow="Additional Services"
              title="Services Priced on Request"
              subtitle="For work outside the standard tiers below."
            />

            <div className="mx-auto max-w-3xl space-y-6">
              {services.map((service, i) => (
                <Reveal key={service.title || i} delay={i * 80}>
                  <div className="group flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-white/[0.02] p-7 transition-all duration-500 hover:border-[var(--border-hover)] hover:bg-white/[0.04]">
                    <div className="flex items-center gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent-soft)] text-2xl">
                        {service.emoji}
                      </span>
                      <h3 className="font-display text-2xl font-bold text-white">{service.title}</h3>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{service.description}</p>
                    <ul className="grid grid-cols-1 gap-2.5 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
                      {service.examples.map((example) => (
                        <li key={example} className="flex items-start gap-2.5">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-start gap-3 rounded-xl bg-[var(--bg)]/50 p-4">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                      <p className="text-sm text-[var(--text-secondary)]">
                        <strong>Pricing:</strong> {service.note}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <SectionHeading
              align="center"
              eyebrow="Terms"
              title="Terms of Service"
              subtitle="By commissioning me, you agree to the rules below. Please read carefully before ordering."
            />
            <div className="mx-auto max-w-3xl grid grid-cols-1 gap-5 md:grid-cols-2">
              {tosSections.map((section, i) => (
                <Reveal key={section.title} delay={(i % 4) * 60}>
                  <div className="h-full rounded-2xl border border-[var(--border)] bg-white/[0.02] p-7 transition-all duration-500 hover:border-[var(--border-hover)] hover:bg-white/[0.04]">
                    <h2 className="mb-4 flex items-center gap-3 text-base font-bold text-white">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-lg">{section.icon}</span>
                      {section.title}
                    </h2>
                    <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                      {section.items.map((item: string) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--text-secondary)]">
              <Info className="h-4 w-4 text-[var(--accent)]" />
              Every commission is handled with care and clear communication before work begins.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
