"use client";

import { pricingTiers, tosSections } from "@/data/site";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";

function PricingCard({ tier, index }: { tier: any; index: number }) {
  const popular = tier.popular;
  return (
    <Reveal delay={index * 80}>
      <div
        className={`relative flex h-full flex-col rounded-[var(--r-lg)] border p-7 transition-all duration-500 md:p-8 ${
          popular
            ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[var(--shadow-glow)]"
            : "border-[var(--border)] bg-[var(--bg-card)] hover:-translate-y-1.5 hover:border-[var(--border-hover)]"
        }`}
      >
        {tier.badge && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-4)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#04060a] shadow-lg shadow-[var(--accent)]/20">
            {tier.badge}
          </span>
        )}
        <h3 className="text-lg font-semibold text-white">
          <span className="mr-2">{tier.emoji}</span>
          {tier.name}
        </h3>
        <p className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">{tier.price}</p>
        <p className="mt-1.5 text-xs text-[var(--text-dim)]">Per avatar</p>
        <ul className="mb-8 mt-6 flex-1 space-y-3.5">
          {tier.features.map((feat: string) => (
            <li key={feat} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Check className="h-3 w-3" />
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
        <ButtonLink
          href="/contact"
          variant={popular ? "primary" : "outline"}
          className="w-full"
        >
          Request
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    </Reveal>
  );
}

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
              <PricingCard key={tier.id} tier={tier} index={i} />
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
