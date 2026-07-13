"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import ContactCommissionForm from "@/components/ContactCommissionForm";

export default function CommissionPage() {
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

          <div className="mx-auto max-w-2xl rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)]/60 p-1">
            <ContactCommissionForm />
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
