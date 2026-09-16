"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactCommissionForm from "@/components/ContactCommissionForm";
import { siteConfig } from "@/config/site";
import { pricingTiers, additionalServices, faqItems } from "@/config/site";
import { Zap, ArrowRight, ShieldCheck, Check, Sparkles, MessageCircle, DollarSign, Clock, Send, HelpCircle } from "lucide-react";

function ServiceCard({ service }: { service: typeof pricingTiers[0] }) {
  return (
    <Reveal>
      <div className="group relative p-6 border border-[var(--border)] bg-[var(--bg-card)] rounded-[var(--r-lg)] transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)]">
        <div className="flex items-center gap-3 mb-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl transition-transform duration-300 group-hover:scale-110">
            {service.emoji}
          </span>
          <div>
            <h3 className="text-base font-semibold text-white">{service.name}</h3>
            {service.badge && (
              <span className="text-xs font-medium text-[var(--accent)]">{service.badge}</span>
            )}
          </div>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{service.price}</p>
        <ul className="space-y-2 mb-6">
          {service.features?.slice(0, 4).map((feat) => (
            <li key={feat} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Check className="h-2.5 w-2.5" />
              </span>
              {feat}
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => document.getElementById("commission-form")?.scrollIntoView({ behavior: "smooth" })} className="btn-secondary w-full inline-flex items-center justify-center gap-2 cursor-pointer">
          Request Quote
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </Reveal>
  );
}

export default function CommissionPage() {
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
            {pricingTiers.map((tier) => (
              <ServiceCard key={tier.id} service={tier} />
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
          <div className="mt-10 text-center">
            <a href="/contact" className="btn-secondary inline-flex items-center gap-2">
              Still have questions? Get in touch
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section section-alt">
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
