"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ContactCommissionForm from "@/components/ContactCommissionForm";
import { MessageSquare, Clock, CheckCircle2 } from "lucide-react";

const CHANNELS = [
  { icon: <MessageSquare className="h-5 w-5" />, label: "Discord", value: "BlueyBarks", note: "Fastest way to reach me" },
  { icon: <Clock className="h-5 w-5" />, label: "Response time", value: "24–48 hours", note: "Usually quicker" },
];

const CHECKLIST = [
  "What you want done",
  "Avatar base name",
  "Reference images",
  "All required assets provided",
];

export default function ContactPage() {
  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px]" />

        <div className="container">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
            {/* Info */}
            <div className="space-y-5">
              <SectionHeading eyebrow="Contact" title="Get in touch" subtitle="Ready to commission something? Reach out and let's talk through your idea." />

              <div className="space-y-3">
                {CHANNELS.map((c, i) => (
                  <Reveal key={c.label} delay={i * 60}>
                    <div className="group flex items-center gap-4 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--border-hover)]">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                        {c.icon}
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">{c.label}</div>
                        <div className="text-sm font-semibold text-white">{c.value}</div>
                        <div className="text-xs text-[var(--text-dim)]">{c.note}</div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={120}>
                <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                    <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
                    Quick checklist
                  </h3>
                  <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
                    {CHECKLIST.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Reveal>
                <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)]/60 p-1">
                  <ContactCommissionForm />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
