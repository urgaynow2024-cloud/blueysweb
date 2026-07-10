"use client";

import { pricingTiers, tosSections } from "@/data/site";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-[var(--accent-2)] opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14 page-head">
            <span className="section-label justify-center">Rates</span>
            <h2 className="display-lg text-white mb-3">Pricing</h2>
            <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
              Prices vary depending on the work needed. I&rsquo;ll always give you a quote before starting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative p-6 md:p-7 h-full flex flex-col border transition-all duration-500 rounded-xl ${
                  tier.popular
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]"
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)] rounded-t-xl" />
                )}
                {tier.badge && (
                  <div className="text-[10px] font-bold tracking-wider uppercase text-[var(--accent)] mb-3">
                    {tier.badge}
                  </div>
                )}
                <h3 className="text-base font-semibold text-white mb-1">
                  {tier.emoji} {tier.name}
                </h3>
                <p className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
                  {tier.price}
                </p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block text-center py-2.5 rounded-xl text-sm font-bold transition-all ${
                    tier.popular
                      ? "bg-white text-black hover:shadow-lg hover:shadow-black/30"
                      : "border border-[var(--border)] text-white hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  Request
                </Link>
              </div>
            ))}
          </div>

          <div className="divider mb-20" />

          <div className="text-center mb-14">
            <span className="section-label justify-center">Terms</span>
            <h2 className="display-lg text-white">Terms of Service</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto mt-3">
              By commissioning me, you agree to the rules below. Please read carefully before ordering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tosSections.map((section) => (
              <div
                key={section.title}
                className="glass rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-500 group"
              >
                <h2 className="text-sm font-bold text-white mb-4">{section.icon} {section.title}</h2>
                <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
