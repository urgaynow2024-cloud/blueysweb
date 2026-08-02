"use client";

import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { getFaqItems } from "@/lib/db";

export default function FAQPage() {
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getFaqItems();
        setFaqItems(data);
      } catch (e) {
        console.error("Failed to load FAQ data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <section className="page relative overflow-hidden">
          <div className="container max-w-3xl">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-5">
                  <div className="h-4 w-3/4 rounded bg-[var(--bg)]" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

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

          {faqItems.length > 0 ? (
            <div className="space-y-3">
              {faqItems.map((item, i) => {
                const isOpen = open === i;
                return (
                  <div
                    key={item.question || i}
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
                        {item.question}
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
                        <p className="px-6 pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-12 text-center">
              <p className="text-[var(--text-dim)]">No FAQ items have been added yet.</p>
            </div>
          )}

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