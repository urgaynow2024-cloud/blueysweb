"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { faqItems } from "@/config/site";
import { ArrowRight, HelpCircle, DollarSign, Clock, ShieldCheck, Send } from "lucide-react";

function FAQItem({ item, index }: { item: typeof faqItems[0]; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const faqIcon = item.question?.toLowerCase().includes("price") || item.question?.toLowerCase().includes("cost") || item.question?.toLowerCase().includes("payment")
    ? DollarSign
    : item.question?.toLowerCase().includes("time") || item.question?.toLowerCase().includes("long") || item.question?.toLowerCase().includes("fast")
    ? Clock
    : item.question?.toLowerCase().includes("quest") || item.question?.toLowerCase().includes("pc") || item.question?.toLowerCase().includes("performance")
    ? ShieldCheck
    : item.question?.toLowerCase().includes("file") || item.question?.toLowerCase().includes("get")
    ? Send
    : HelpCircle;
  const Icon = faqIcon;

  return (
    <div key={index} className="border-b border-[var(--border)] transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-0 py-5 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className={`font-semibold transition-colors ${open ? "text-white" : "text-[var(--text)]"}`}>
            {item.question}
          </span>
        </span>
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[var(--accent)] transition-all duration-300 ${open ? "rotate-180 bg-[var(--accent-soft)]" : ""}`}>
          {open ? <span className="h-3 w-3">−</span> : <span className="h-3 w-3">+</span>}
        </span>
      </button>
      <div className="grid transition-all duration-500 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="relative">
      <section className="section">
        <div className="container max-w-3xl">
          <SectionHeading
            align="center"
            eyebrow="FAQ"
            title="Common Questions"
            subtitle="Quick answers to the things people ask most."
          />

          <div className="mt-10 space-y-0">
            {faqItems.map((item, i) => (
              <FAQItem key={item.question} item={item} index={i} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <ButtonLink href="/commission" variant="secondary">
              Still have questions? Get in touch
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}