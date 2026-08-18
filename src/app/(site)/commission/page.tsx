"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { PremiumCard } from "@/components/ui/Card";
import { ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import ContactCommissionForm from "@/components/ContactCommissionForm";

export default function CommissionPage() {
  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px] orb-slow" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-[350px] rounded-full bg-[var(--accent-cosmic)] opacity-[0.04] blur-[100px] orb-med" />

        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Commission"
            title="Commission Request"
            subtitle="Tell me about the avatar work you need and I'll get back to you with a quote."
          />

          <PremiumCard variant="elevated" className="mx-auto max-w-2xl p-1">
            <ContactCommissionForm />
          </PremiumCard>

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
