"use client";

import Reveal from "@/components/ui/Reveal";
import ContactCommissionForm from "@/components/ContactCommissionForm";
import { MessageSquare, Clock, CheckCircle2, Mail, ArrowRight } from "lucide-react";

const CHANNELS = [
  { icon: <MessageSquare className="h-5 w-5" />, label: "Discord", value: "BlueyBarks", note: "Fastest way to reach me" },
  { icon: <Clock className="h-5 w-5" />, label: "Response time", value: "24–48 hours", note: "Usually quicker" },
  { icon: <Mail className="h-5 w-5" />, label: "Email", value: "Via Discord", note: "I'll respond on Discord" },
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
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px] orb-slow" />

        <div className="container">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-8">
              <div>
                <span className="eyebrow">
                  <MessageSquare className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Contact
                </span>
                <h1 className="display-xl mt-4 text-white">Get in touch</h1>
                <p className="lead mt-3">Ready to commission something? Reach out and let&rsquo;s talk through your idea.</p>
              </div>

              <div className="space-y-4">
                {CHANNELS.map((c, i) => (
                  <Reveal key={c.label} delay={i * 60}>
                    <div className="flex items-center gap-4 py-2">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
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
                <div className="border-b border-[var(--border)] pb-8">
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
