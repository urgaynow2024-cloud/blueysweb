"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { pricingTiers, additionalServices, tosSections } from "@/data/site";
import { getPricingTiers } from "@/lib/db";
import Reveal from "@/components/ui/Reveal";
import { Check, ArrowRight, Info, Sparkles, DollarSign } from "lucide-react";

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
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <DollarSign className="h-3.5 w-3.5 text-[var(--accent)]" />
              Rates
            </span>
            <h1 className="display-xl mt-5 text-white">
              ✦ <span className="text-gradient-animated">Pricing</span>
            </h1>
            <p className="lead mx-auto mt-4 max-w-2xl">
              Prices vary depending on the work needed. I&rsquo;ll always give you a quote before starting.
            </p>
          </div>

          <Reveal delay={0}>
            <div className="mx-auto my-12 max-w-2xl rounded-2xl border border-[var(--border-strong)] bg-white/[0.03] px-6 py-5 text-center backdrop-blur-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                <Sparkles className="h-3.5 w-3.5" />
                Flexible, workload-based pricing
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Prices are ranges, not fixed packages. The final cost depends on complexity, scope, and time required.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto max-w-3xl">
            {pricing.map((tier, i) => (
              <Reveal key={tier.id || i} delay={i * 80}>
                <div className={`group py-6 md:py-8 ${i < pricing.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {tier.emoji && (
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl transition-transform duration-300 group-hover:scale-110">
                            {tier.emoji}
                          </span>
                        )}
                        <div>
                          <h3 className="text-base font-semibold text-white md:text-lg">{tier.name}</h3>
                          {tier.badge && (
                            <span className="text-xs font-medium text-[var(--accent-muted)]">{tier.badge}</span>
                          )}
                        </div>
                      </div>
                      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[var(--text-secondary)]">
                        {tier.features?.map((feat) => (
                          <li key={feat} className="flex items-center gap-2">
                            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-4 md:text-right">
                      <div>
                        <p className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">{tier.price}</p>
                        <p className="text-xs text-[var(--text-dim)]">Per avatar</p>
                      </div>
                      <Link href="/contact" className="btn-primary btn-sm">
                        Request
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className="section-eyebrow justify-center">
                <Info className="h-4 w-4 text-[var(--accent)]" />
                Additional Services
              </span>
              <h2 className="display-lg mt-4 text-white">Services Priced on Request</h2>
              <p className="lead mx-auto mt-3 max-w-xl">For work outside the standard tiers above.</p>
            </div>

            <div className="mx-auto max-w-3xl space-y-6 mt-12">
              {services.map((service, i) => (
                <Reveal key={service.title || i} delay={i * 80}>
                  <div className="group py-6">
                    <div className="flex items-start gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-2xl">
                        {service.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-xl font-bold text-white">{service.title}</h3>
                        <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">{service.description}</p>
                        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[var(--text-secondary)]">
                          {service.examples.map((example) => (
                            <li key={example} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                              {example}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--bg)]/50 p-4">
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                          <p className="text-sm text-[var(--text-secondary)]">
                            <strong>Pricing:</strong> {service.note}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className="section-eyebrow justify-center">
                <Info className="h-4 w-4 text-[var(--accent)]" />
                Terms of Service
              </span>
              <h2 className="display-lg mt-4 text-white">Terms of Service</h2>
              <p className="lead mx-auto mt-3 max-w-xl">
                By commissioning me, you agree to the rules below. Please read carefully before ordering.
              </p>
            </div>

            <div className="mx-auto max-w-3xl grid grid-cols-1 gap-4 md:grid-cols-2 mt-12">
              {tosSections.map((section, i) => (
                <Reveal key={section.title} delay={(i % 4) * 60}>
                  <div className="group py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent-soft)] text-sm">{section.icon}</span>
                      <h2 className="text-sm font-bold text-white">{section.title}</h2>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
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

          <div className="mt-16 text-center">
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Start a Commission
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
