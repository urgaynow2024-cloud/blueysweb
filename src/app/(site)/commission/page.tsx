"use client";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import ContactCommissionForm from "@/components/ContactCommissionForm";
import { siteConfig } from "@/config/site";
import { pricingTiers, additionalServices, workflowSteps, faqItems } from "@/config/site";
import Link from "next/link";
import { Zap, ArrowRight, ShieldCheck, Layers, PenTool, Send, Sparkles, Check, Clock, HelpCircle, DollarSign } from "lucide-react";

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
          {service.features?.map((feat) => (
            <li key={feat} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Check className="h-2.5 w-2.5" />
              </span>
              {feat}
            </li>
          ))}
        </ul>
        <Link href="/commission" className="btn-secondary w-full inline-flex items-center justify-center gap-2">
          Request Quote
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Reveal>
  );
}

function ProcessStep({ step, index }: { step: typeof workflowSteps[0]; index: number }) {
  return (
    <Reveal delay={index * 80}>
      <div className="group relative text-center">
        <div className="relative z-10 mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-2xl transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-[var(--accent)]/50 group-hover:bg-[var(--accent-soft)]">
          {step.emoji}
          <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[10px] font-bold text-[#04060a]">
            {index + 1}
          </span>
        </div>
        <h3 className="text-sm font-bold text-white">{step.title}</h3>
        <p className="mt-1.5 px-1 text-xs leading-relaxed text-[var(--text-dim)]">{step.desc}</p>
      </div>
    </Reveal>
  );
}

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

import { useState } from "react";

export default function CommissionPage() {
  return (
    <div className="relative">
      <section className="section">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Commissions"
            title="Commission Your Avatar"
            subtitle="From subtle edits to complete overhauls — tell me what you need and I'll give you a clear quote."
          />

          {/* Service Types */}
          <div className="mt-12">
            <SectionHeading
              eyebrow="Services"
              title="What I Offer"
              subtitle="Three tiers covering everything from quick tweaks to full avatar overhauls."
            />
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {pricingTiers.map((tier) => (
                <ServiceCard key={tier.id} service={tier} />
              ))}
            </div>
          </div>

          {/* Additional Services */}
          <div className="mt-16">
            <SectionHeading
              eyebrow="Extras"
              title="Additional Services"
              subtitle="Specialised work that can be added to any commission or requested separately."
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

          {/* Process */}

          {/* Requirements */}
          <div className="mt-16 section-alt rounded-[var(--r-xl)] p-8">
            <SectionHeading
              align="center"
              eyebrow="Requirements"
              title="What You'll Need"
              subtitle="Have these ready for the smoothest commission experience."
            />
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Reveal delay={0}>
                <div className="p-5 border border-[var(--border)] bg-[var(--bg-card)] rounded-[var(--r-lg)] text-center">
                  <div className="grid h-12 w-12 mx-auto mb-3 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Send className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-white">Clear Brief</h4>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">What you want done, reference images, specific ideas</p>
                </div>
              </Reveal>
              <Reveal delay={60}>
                <div className="p-5 border border-[var(--border)] bg-[var(--bg-card)] rounded-[var(--r-lg)] text-center">
                  <div className="grid h-12 w-12 mx-auto mb-3 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-white">Avatar Base</h4>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Base name, version, and proof of ownership</p>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="p-5 border border-[var(--border)] bg-[var(--bg-card)] rounded-[var(--r-lg)] text-center">
                  <div className="grid h-12 w-12 mx-auto mb-3 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <PenTool className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-white">Assets Ready</h4>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Clothing, accessories, textures you want included</p>
                </div>
              </Reveal>
              <Reveal delay={180}>
                <div className="p-5 border border-[var(--border)] bg-[var(--bg-card)] rounded-[var(--r-lg)] text-center">
                  <div className="grid h-12 w-12 mx-auto mb-3 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-white">Quest/PC Target</h4>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Let me know your platform for proper optimisation</p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
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
              <Link href="/faq" className="btn-secondary inline-flex items-center gap-2">
                View All FAQs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <span className="eyebrow justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              Ready to start?
            </span>
            <h2 className="display-lg mt-5 text-white">Let&rsquo;s build something great together</h2>
            <p className="lead mx-auto mt-4 max-w-xl">
              Fill out the form below or message me directly on Discord at <strong className="text-white">{siteConfig.discord}</strong>.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/commission" className="btn-primary btn-md">
                <Zap className="h-4 w-4" />
                Start a Commission
              </Link>
              <Link href="https://discord.gg/zt48MZm5kD" className="btn-secondary btn-md" target="_blank" rel="noopener noreferrer">
                Open Discord
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}