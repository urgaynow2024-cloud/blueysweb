"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { pricingTiers, additionalServices, faqItems, tosSections } from "@/config/site";
import { getPricingTiers } from "@/lib/db";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import CommissionTierCard from "@/components/ui/CommissionTierCard";
import { ArrowRight, Info, Sparkles, HelpCircle, MessageCircle, DollarSign, Clock, ShieldCheck, FileText, Send } from "lucide-react";

const ALLOWED_TIERS = ["Light Blender Work", "Standard Avatar Work", "Advanced Avatar Work"];

function FAQItem({ item, index }: { item: typeof faqItems[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const faqIcon = item.question?.toLowerCase().includes("price") || item.question?.toLowerCase().includes("cost") || item.question?.toLowerCase().includes("payment")
    ? DollarSign
    : item.question?.toLowerCase().includes("time") || item.question?.toLowerCase().includes("long") || item.question?.toLowerCase().includes("fast")
    ? Clock
    : item.question?.toLowerCase().includes("quest") || item.question?.toLowerCase().includes("pc") || item.question?.toLowerCase().includes("performance")
    ? ShieldCheck
    : item.question?.toLowerCase().includes("file") || item.question?.toLowerCase().includes("get")
    ? Send
    : HelpCircle;
  const Icon = faqIcon;

  return (
    <div className="border-b border-[var(--border)] transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-0 py-5 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className={`font-semibold transition-colors ${open ? "text-white" : "text-[var(--text)]"}`}>
            {item.question}
          </span>
        </span>
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[var(--accent)] transition-all duration-300 ${open ? "rotate-180 bg-[var(--accent-soft)]" : ""}`}>
          {open ? <span className="h-3 w-3">−</span> : <span className="h-3 w-3">+</span>}
        </span>
      </button>
      <div className="grid transition-all duration-500 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [pricing, setPricing] = useState(pricingTiers);
  const [services, setServices] = useState(additionalServices);
  const [showFaq, setShowFaq] = useState(false);

  useEffect(() => {
    async function load() {
      const dbPricing = await getPricingTiers();
      if (dbPricing && dbPricing.length > 0) {
        const filtered = dbPricing.filter((t: any) => ALLOWED_TIERS.includes(t.name));
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
          <Reveal delay={0}>
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow justify-center">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                Commissions
              </span>
              <h1 className="display-xl mt-5 text-white">
                ✦ <span className="text-gradient-animated">Commission Catalogue</span>
              </h1>
              <p className="lead mx-auto mt-4 max-w-2xl">
                Three tiers covering everything from quick edits to full avatar overhauls. Every commission is built around your vision.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0}>
            <div className="mx-auto my-12 max-w-2xl rounded-2xl border border-[var(--border-strong)] bg-white/[0.03] px-6 py-5 text-center backdrop-blur-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                <Info className="h-3.5 w-3.5" />
                Flexible, workload-based pricing
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Prices are ranges, not fixed packages. The final cost depends on complexity, scope, and time required.
              </p>
            </div>
          </Reveal>

          <SectionHeading
            align="center"
            eyebrow="Tiers"
            title="Commission Tiers"
            subtitle="Choose the tier that fits your project scope."
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {pricing.map((tier, i) => (
              <Reveal key={tier.id || i} delay={i * 80}>
                <CommissionTierCard tier={tier} />
              </Reveal>
            ))}
          </div>

          <div className="mt-20">
            <Reveal delay={0}>
              <div className="mx-auto max-w-3xl text-center">
                <span className="section-eyebrow justify-center">
                  <Info className="h-4 w-4 text-[var(--accent)]" />
                  Additional Services
                </span>
                <h2 className="display-lg mt-4 text-white">Services Priced on Request</h2>
                <p className="lead mx-auto mt-3 max-w-xl">For work outside the standard tiers above.</p>
              </div>
            </Reveal>

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
                          {service.examples?.map((example) => (
                            <li key={example} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                              {example}
                            </li>
                          ))}
                        </ul>
                        {service.note && (
                          <div className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--bg)]/50 p-4">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                            <p className="text-sm text-[var(--text-secondary)]">
                              <strong>Pricing:</strong> {service.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <Reveal delay={0}>
              <div className="mx-auto max-w-3xl text-center">
                <span className="section-eyebrow justify-center">
                  <FileText className="h-4 w-4 text-[var(--accent)]" />
                  Terms of Service
                </span>
                <h2 className="display-lg mt-4 text-white">Terms of Service</h2>
                <p className="lead mx-auto mt-3 max-w-xl">
                  By commissioning me, you agree to the rules below. Please read carefully before ordering.
                </p>
              </div>
            </Reveal>

            <div className="mx-auto max-w-3xl grid grid-cols-1 gap-4 md:grid-cols-2 mt-12">
              {tosSections.map((section, i) => (
                <Reveal key={section.title} delay={(i % 4) * 60}>
                  <div className="group py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent-soft)] text-sm">{section.icon}</span>
                      <h2 className="text-sm font-bold text-white">{section.title}</h2>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                      {section.items?.map((item: string) => (
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

          {showFaq && (
            <div className="mt-20">
              <SectionHeading
                align="center"
                eyebrow="FAQ Preview"
                title="Frequently Asked Questions"
                subtitle="Quick answers to common questions."
              />
              <div className="mx-auto max-w-3xl space-y-0">
                {faqItems.slice(0, 4).map((item, i) => (
                  <FAQItem key={item.question} item={item} index={i} />
                ))}
              </div>
            </div>
          )}

          <Reveal delay={0}>
            <div className="mt-20 text-center">
              <button
                onClick={() => setShowFaq((v) => !v)}
                className="btn-secondary inline-flex items-center gap-2"
                aria-expanded={showFaq}
              >
                <HelpCircle className="h-4 w-4" />
                {showFaq ? "Hide FAQ" : "Show FAQ Preview"}
              </button>
            </div>
          </Reveal>

          <div className="mt-16 text-center">
            <Reveal delay={0}>
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Start a Commission
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--text-secondary)]">
              <Link href="/tos" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                <FileText className="h-3.5 w-3.5" />
                Terms of Service
              </Link>
              <Link href="/faq" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                <HelpCircle className="h-3.5 w-3.5" />
                FAQ
              </Link>
              <a href={`https://discord.gg/${"zt48MZm5kD"}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                <MessageCircle className="h-3.5 w-3.5" />
                Discord
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
