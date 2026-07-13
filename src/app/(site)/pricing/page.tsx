"use client";

import { pricingTiers, tosSections } from "@/data/site";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PricingCard from "@/components/ui/PricingCard";
import { ShieldCheck } from "lucide-react";

export default function PricingPage() {
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
            subtitle="Prices vary depending on the work needed. I'll always give you a quote before starting."
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {pricingTiers.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 80}>
                <PricingCard tier={tier} />
              </Reveal>
            ))}
          </div>

          <div className="mt-20">
            <SectionHeading
              align="center"
              eyebrow="Terms"
              title="Terms of Service"
              subtitle="By commissioning me, you agree to the rules below. Please read carefully before ordering."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tosSections.map((section, i) => (
                <Reveal key={section.title} delay={(i % 4) * 60}>
                  <div className="group h-full rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)]">
                    <h2 className="mb-4 flex items-center gap-3 text-base font-bold text-white">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-lg">{section.icon}</span>
                      {section.title}
                    </h2>
                    <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                      {section.items.map((item: string) => (
                        <li key={item} className="flex items-start gap-3">
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
        </div>
      </section>
    </div>
  );
}
