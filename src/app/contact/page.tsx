"use client";

import SectionTitle from "@/components/SectionTitle";
import ContactCommissionForm from "@/components/ContactCommissionForm";

export default function ContactPage() {
  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--accent)] opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact info sidebar */}
            <div className="space-y-4">
              <div>
                <span className="section-label">Contact</span>
                <div className="heading-md text-white mb-3">Get in touch</div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Ready to commission something?
                </p>
              </div>

              <div className="space-y-3">
                <div className="glass rounded-2xl p-4 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-500 group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💬</span>
                    <div>
                      <div className="text-[10px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">
                        Discord
                      </div>
                      <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors">
                        BlueyBarks
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-4 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-500 group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⏰</span>
                    <div>
                      <div className="text-[10px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">
                        Response
                      </div>
                      <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors">
                        Within 24-48 hours
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-5 border border-[var(--border)]">
                <h3 className="text-sm font-bold text-white mb-3">Quick Checklist</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-3">Please include:</p>
                <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                  {[
                    "What you want done",
                    "Avatar base name",
                    "Reference images",
                    "All required assets provided",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <ContactCommissionForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
