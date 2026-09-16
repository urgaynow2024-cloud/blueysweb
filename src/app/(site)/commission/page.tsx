"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import CommissionTierCard from "@/components/ui/CommissionTierCard";
import ContactCommissionForm from "@/components/ContactCommissionForm";
import { siteConfig, pricingTiers, additionalServices, faqItems, tosSections } from "@/config/site";
import { getPricingTiers } from "@/lib/db";
import { Zap, ArrowRight, ShieldCheck, Check, Sparkles, MessageCircle, Clock, FileText, DollarSign, Send, HelpCircle } from "lucide-react";

const ALLOWED_TIERS = ["Light Blender Work", "Standard Avatar Work", "Advanced Avatar Work"];

export default function CommissionPage() {
  const [pricing, setPricing] = useState(pricingTiers);

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
      {/* Hero — form-first */}
      <section className="section section-alt">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
              Commissions
            </span>
            <h1 className="display-xl mt-5 text-white">Commission Your Avatar</h1>
            <p className="lead mx-auto mt-4 max-w-xl">
              From subtle edits to complete overhauls — tell me what you need and I&rsquo;ll give you a clear quote.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Discord: <strong className="font-semibold text-white">{siteConfig.discord}</strong>
              </span>
              <span className="mx-1 text-[var(--border)]">|</span>
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5 text-[var(--accent)]" />
                24–48h response time
              </span>
            </div>
          </div>

          <div className="mt-12 mx-auto max-w-3xl" id="commission-form">
            <Reveal>
              <ContactCommissionForm />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Service Types */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Services"
            title="What I Offer"
            subtitle="Three tiers covering everything from quick tweaks to full avatar overhauls."
            align="center"
          />
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {pricing.map((tier) => (
              <CommissionTierCard key={tier.id} tier={tier} ctaLabel="Request Quote" />
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            eyebrow="Extras"
            title="Additional Services"
            subtitle="Specialised work that can be added to any commission or requested separately."
            align="center"
          />
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {additionalServices.map((svc, i) => (
              <Reveal key={svc.title} delay={i * 80}>
                <div className="p-6 border border-[var(--border)] bg-[var(--bg-card)] rounded-[var(--r-lg)]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl">{svc.emoji}</span>
                    <h3 className="font-semibold text-white">{svc.title}</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">{svc.description}</p>
                  <ul className="space-y-1.5 mb-4">
                    {svc.examples?.map((ex) => (
                      <li key={ex} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Check className="h-2 w-2" />
                        </span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                  {svc.note && (
                    <p className="text-xs italic text-[var(--text-dim)]">{svc.note}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="FAQ"
            title="Common Questions"
            subtitle="Quick answers to the things people ask most."
          />
          <div className="mt-8 mx-auto max-w-3xl space-y-0">
            {faqItems.map((item, i) => (
              <FAQItem key={item.question} item={item} index={i} />
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--text-secondary)]">
            <Link href="/contact" className="btn-secondary inline-flex items-center gap-2">
              Still have questions? Get in touch
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tos" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <FileText className="h-3.5 w-3.5" />
              Terms of Service
            </Link>
          </div>
        </div>
      </section>

      {/* TOS Summary */}
      <section className="section section-alt">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              align="center"
              eyebrow="Legal"
              title="Terms of Service"
              subtitle="Key rules before commissioning."
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {tosSections.slice(0, 6).map((section, i) => (
                <Reveal key={section.title} delay={i * 60}>
                  <div className="group py-3 flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-sm">{section.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{section.title}</h4>
                      {section.items?.[0] && (
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{section.items[0]}</p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/tos" className="btn-secondary inline-flex items-center gap-2">
                Read Full Terms
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              Ready when you are
            </span>
            <h2 className="display-lg mt-5 text-white">Ready to commission?</h2>
            <p className="lead mx-auto mt-4">
              Send me a message on Discord at <strong className="font-semibold text-white">{siteConfig.discord}</strong>, or use the form above and I&rsquo;ll get back to you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href={`https://discord.gg/${siteConfig.discordUrl.replace('https://discord.gg/', '')}`} className="btn-primary btn-md" target="_blank" rel="noopener noreferrer">
                <Zap className="h-4 w-4" />
                Open Discord
              </a>
            </div>
            <p className="mt-4 text-xs text-[var(--text-dim)]">
              By proceeding, you confirm you have read and agree to the{" "}
              <Link href="/tos" className="text-[var(--accent)] hover:underline underline-offset-4">Terms of Service</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FAQItem({ item, index }: { item: typeof faqItems[0]; index: number }) {
  const [open, setOpen] = useState(index === 0);
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
    <div key={index} className="border-b border-[var(--border)] transition-all duration-300">
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
