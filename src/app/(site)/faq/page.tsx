"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Plus, Minus, HelpCircle, ArrowRight } from "lucide-react";

const FAQS = [
  { q: "What do I need to provide?", a: "What you want done, avatar base name, reference images, and any required assets provided." },
  { q: "How long does a commission take?", a: "Depends on the tier and complexity. Light work is faster, full overhauls take longer." },
  { q: "Do you work on Quest?", a: "Quest compatibility depends on the tier. Overhauls include Quest optimisation." },
  { q: "What payment methods?", a: "PayPal and Payhip only. 50% deposit before work begins." },
  { q: "Can I request NSFW work?", a: "Limited NSFW commissions are accepted case-by-case for 18+ clients. See NSFW page for details." },
  { q: "What files do I get?", a: "Unity-ready VRChat avatar files. Blender source files on request." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.05] blur-[130px] orb-slow" />

        <div className="container max-w-3xl">
          <div className="text-center">
            <span className="eyebrow justify-center">
              <HelpCircle className="h-3.5 w-3.5 text-[var(--accent)]" />
              FAQ
            </span>
            <h1 className="display-xl mt-5 text-white">
              ✦ Common <span className="text-gradient-animated">Questions</span>
            </h1>
            <p className="lead mx-auto mt-4 max-w-xl">
              Quick answers to the things people ask most.
            </p>
          </div>

          <div className="mt-12 space-y-0">
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={item.q}
                  className={`border-b border-[var(--border)] transition-all duration-300 ${isOpen ? "bg-[rgba(255,255,255,0.015)]" : ""}`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-0 py-5 text-left"
                  >
                    <span className={`text-sm font-semibold transition-colors ${isOpen ? "text-white" : "text-[var(--text)]"}`}>
                      {item.q}
                    </span>
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[var(--accent)] transition-all duration-300 ${
                        isOpen ? "rotate-180 bg-[var(--accent-soft)]" : ""
                      }`}
                    >
                      {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-500 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <ButtonLink href="/contact" variant="secondary">
              Still have questions? Get in touch
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
