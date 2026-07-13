"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Plus, Minus, HelpCircle } from "lucide-react";

const FAQS = [
  { q: "What do I need to provide?", a: "What you want done, avatar base name, reference images, and any required assets provided." },
  { q: "How long does a commission take?", a: "Depends on the tier and complexity. Light work is faster, full overhauls take longer." },
  { q: "Do you work on Quest?", a: "Quest compatibility depends on the tier. Overhauls include Quest optimisation." },
  { q: "What payment methods?", a: "PayPal and Payhip only. 50% deposit before work begins." },
  { q: "Can I request NSFW work?", a: "Limited NSFW commissions are accepted case-by-case for 18+ clients." },
  { q: "What files do I get?", a: "Unity-ready VRChat avatar files. Blender source files on request." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="container max-w-3xl">
          <SectionHeading
            align="center"
            eyebrow="FAQ"
            icon={<HelpCircle className="h-4 w-4 text-[var(--accent)]" />}
            title="Common questions"
            subtitle="Quick answers to the things people ask most."
          />

          <div className="space-y-3">
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={item.q}
                  className={`overflow-hidden rounded-[var(--r-md)] border transition-all duration-300 ${
                    isOpen
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[var(--shadow-glow)]"
                      : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className={`font-semibold transition-colors ${isOpen ? "text-white" : "text-[var(--text)]"}`}>
                      {item.q}
                    </span>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[var(--accent)] transition-all duration-300 ${
                        isOpen
                          ? "rotate-180 bg-[var(--accent)] border-[var(--accent)] text-[#04060a]"
                          : "border-[var(--border)]"
                      }`}
                    >
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-500 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <ButtonLink href="/contact" variant="secondary">
              Still have questions? Get in touch
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
