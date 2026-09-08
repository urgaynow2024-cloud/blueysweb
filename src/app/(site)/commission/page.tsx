"use client";

import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import ContactCommissionForm from "@/components/ContactCommissionForm";
import { ShieldAlert, ArrowRight, Sparkles, Send } from "lucide-react";

export default function CommissionPage() {
  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px] orb-slow" />

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <Send className="h-3.5 w-3.5 text-[var(--accent)]" />
              Commission
            </span>
            <h1 className="display-xl mt-5 text-white">
              ✦ Commission <span className="text-gradient-animated">Request</span>
            </h1>
            <p className="lead mx-auto mt-4 max-w-xl">
              Tell me about the avatar work you need and I&rsquo;ll get back to you with a quote.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <Reveal>
              <ContactCommissionForm />
            </Reveal>

            <div className="mt-8 flex justify-center">
              <ButtonLink href="/pricing" variant="secondary">
                See pricing first
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
