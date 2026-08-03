"use client";

import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, ShieldAlert, Clock, FileText, CheckCircle2 } from "lucide-react";
import ContactCommissionForm from "@/components/ContactCommissionForm";
import { getPricingTiers, getQueueConfig, getServices, getTosSections } from "@/lib/db";
import CommissionAvailability from "@/components/CommissionAvailability";

interface PricingTier {
  id?: string;
  name: string;
  price: string;
  badge?: string;
  features: string[];
  is_nsfw?: boolean;
}

interface Service {
  id?: string;
  title: string;
  desc?: string;
  description?: string;
}

interface TosSection {
  id?: string;
  title: string;
}

interface QueueConfig {
  id?: string;
  slots_used?: number;
  [key: string]: unknown;
}

export default function CommissionPage() {
  const [pricing, setPricing] = useState<PricingTier[]>([]);
  const [queue, setQueue] = useState<QueueConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [tosSections, setTosSections] = useState<TosSection[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [pricingData, queueData, servicesData, tosData] = await Promise.all([
          getPricingTiers(),
          getQueueConfig(),
          getServices(),
          getTosSections(),
        ]);
        setPricing(pricingData || []);
        setQueue(queueData);
        setServices(servicesData || []);
        setTosSections(tosData || []);
      } catch (e) {
        console.error("Failed to load commission data:", e);
      }
    }
    load();
  }, []);

  const visiblePricing = pricing.filter((t) => !t.is_nsfw).slice(0, 3);

  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px]" />

        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Commission"
            title="Commission Request"
            subtitle="Tell me about the avatar work you need and I'll get back to you with a quote."
          />

          {/* Queue Status */}
          {queue && (
            <div className="mx-auto mt-8 max-w-2xl">
              <CommissionAvailability />
            </div>
          )}

          {/* Pricing Summary */}
          {visiblePricing.length > 0 && (
            <div className="mx-auto mt-12 max-w-4xl">
              <div className="mb-8 text-center">
                <span className="section-label">Pricing</span>
                <h2 className="display-lg text-white">Simple, Transparent Pricing</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {visiblePricing.map((tier, i) => (
                  <Reveal key={tier.id || i} delay={i * 80}>
                    <div className="flex h-full flex-col rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)]">
                      {tier.badge && (
                        <span className="mb-4 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
                          {tier.badge}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                      <div className="mt-2 text-3xl font-bold text-white">{tier.price}</div>
                      <ul className="mt-4 flex-1 space-y-2">
                        {(tier.features || []).map((feature: string, j: number) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="mt-8 text-center">
                <ButtonLink href="/pricing" variant="secondary">
                  View all pricing
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
          )}

          {/* Requirements */}
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                <ShieldAlert className="h-4 w-4 text-[var(--accent)]" />
                Requirements
              </h3>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  You must own all avatar bases used in the commission
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  Proof of ownership may be requested
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  Provide clear reference images
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  Payment required before work begins
                </li>
              </ul>
            </div>
          </div>

          {/* Process */}
          {services.length > 0 && (
            <div className="mx-auto mt-12 max-w-2xl">
              <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                  <Clock className="h-4 w-4 text-[var(--accent)]" />
                  Commission Process
                </h3>
                <div className="space-y-4">
                  {services.slice(0, 4).map((svc, i) => (
                    <div key={svc.id || i} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{svc.title}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{svc.desc || svc.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TOS Summary */}
          {tosSections.length > 0 && (
            <div className="mx-auto mt-12 max-w-2xl">
              <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                  <FileText className="h-4 w-4 text-[var(--accent)]" />
                  Terms of Service Summary
                </h3>
                <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                  {tosSections.slice(0, 5).map((section, i) => (
                    <li key={section.id || i} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>{section.title}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <ButtonLink href="/tos" variant="secondary" className="text-xs">
                    Read full Terms of Service
                  </ButtonLink>
                </div>
              </div>
            </div>
          )}

          {/* Commission Form */}
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)]/60 p-1">
              <ContactCommissionForm />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <ButtonLink href="/pricing" variant="secondary">
              See pricing first
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
