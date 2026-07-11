"use client";

import { useState } from "react";
import Link from "next/link";
import AgeVerifier from "@/components/AgeVerifier";
import { nsfwPricingTiers, nsfwRules } from "@/data/site";

export default function NsfwPage() {
  const [isVerified, setIsVerified] = useState(false);

  if (!isVerified) {
    return <AgeVerifier onVerified={() => setIsVerified(true)} />;
  }

  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 page-head">
            <span className="section-label justify-center">18+ Only</span>
            <h2 className="display-lg text-white mb-3">NSFW Commissions</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Mature avatar customisation for verified adults. All work is delivered privately and discreetly.
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 md:p-8 mb-12">
            <h3 className="text-lg font-bold text-white mb-4">⚠️ Age Verification & Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2">Requirements</h4>
                <ul className="space-y-1.5">
                  {nsfwRules.requirements.map((req, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2">What&rsquo;s Not Allowed</h4>
                <ul className="space-y-1.5">
                  {nsfwRules.notAllowed.map((rule, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm text-[var(--text-dim)] mt-4 italic">
              {nsfwRules.note}
            </p>
          </div>

          <div className="mb-10">
            <span className="section-label justify-center">NSFW Rates</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight text-center">Pricing</h2>
            <p className="text-[var(--text-secondary)] text-center max-w-lg mx-auto">
              Adult content commissions are priced separately from SFW work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-16">
            {nsfwPricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative p-6 md:p-8 h-full flex flex-col border rounded-xl transition-all duration-500 ${
                  tier.popular
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-xl shadow-[var(--accent)]/5"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]"
                }`}
              >
                {tier.badge && (
                  <div className="text-[10px] font-bold tracking-wider uppercase text-[var(--accent)] mb-4">
                    {tier.badge}
                  </div>
                )}
                <h3 className="text-base font-semibold text-white mb-2">
                  {tier.emoji} {tier.name}
                </h3>
                <p className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                  {tier.price}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${
                    tier.popular
                      ? "bg-white text-black hover:bg-gray-100"
                      : "border border-[var(--border)] text-white hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  Request
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-[var(--text-dim)] mb-4">
              All NSFW work requires age verification and is delivered privately.
            </p>
            <Link href="/contact" className="btn-primary inline-flex">
              Contact for NSFW Commissions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
