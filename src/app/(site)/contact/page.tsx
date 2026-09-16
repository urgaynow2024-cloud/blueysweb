"use client";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactCommissionForm from "@/components/ContactCommissionForm";
import { siteConfig } from "@/config/site";
import { MessageSquare, Clock, CheckCircle2, Mail, ArrowRight, Sparkles } from "lucide-react";

const CHANNELS = [
  { icon: MessageSquare, label: "Discord", value: siteConfig.discord, note: "Fastest way to reach me" },
  { icon: Clock, label: "Response time", value: "24–48 hours", note: "Usually quicker" },
  { icon: Mail, label: "Email", value: "Via Discord", note: "I'll respond on Discord" },
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
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Contact"
            title="Get in Touch"
            subtitle="Ready to commission something? Reach out and let&rsquo;s talk through your idea."
          />

          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-8">
              <Reveal delay={0}>
                <div className="space-y-4">
                  {CHANNELS.map((c, i) => (
                    <Reveal key={c.label} delay={i * 60}>
                      <div className="flex items-center gap-4 py-2">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                          <c.icon className="h-5 w-5" />
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
              </Reveal>

              <Reveal delay={120}>
                <div className="border-b border-[var(--border)] pb-8">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                    <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
                    Quick Checklist
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

              <Reveal delay={180}>
                <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <Sparkles className="h-5 w-5 text-[var(--accent)] mb-3" />
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    I read every message personally. If you don't hear back within 48 hours, feel free to nudge me on Discord — sometimes messages get buried.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-2">
              <Reveal>
                <ContactCommissionForm />
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}