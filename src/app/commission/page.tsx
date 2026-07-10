"use client";

import SectionTitle from "@/components/SectionTitle";
import ContactCommissionForm from "@/components/ContactCommissionForm";

export default function CommissionPage() {
  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[var(--accent)] opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 page-head">
            <span className="section-label justify-center">Commission</span>
            <h2 className="display-lg text-white mb-3">Commission Request</h2>
            <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
              Tell me about the avatar work you need and I&rsquo;ll get back to you with a quote.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ContactCommissionForm />
          </div>
        </div>
      </section>
    </div>
  );
}
