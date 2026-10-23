"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { faqItems, faqCategories } from "@/config/site";
import { Search, HelpCircle, ArrowRight, DollarSign, Clock, ShieldCheck, Send, FileText } from "lucide-react";

const FAQ_ICONS: Record<string, React.ElementType> = {
  DollarSign,
  Clock,
  ShieldCheck,
  Send,
  HelpCircle,
};

function FAQItem({ item, index }: { item: typeof faqItems[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const faqIcon = item.question?.toLowerCase().includes("price") || item.question?.toLowerCase().includes("cost") || item.question?.toLowerCase().includes("payment")
    ? FAQ_ICONS.DollarSign
    : item.question?.toLowerCase().includes("time") || item.question?.toLowerCase().includes("long") || item.question?.toLowerCase().includes("fast")
    ? FAQ_ICONS.Clock
    : item.question?.toLowerCase().includes("quest") || item.question?.toLowerCase().includes("pc") || item.question?.toLowerCase().includes("performance")
    ? FAQ_ICONS.ShieldCheck
    : item.question?.toLowerCase().includes("file") || item.question?.toLowerCase().includes("get")
    ? FAQ_ICONS.Send
    : FAQ_ICONS.HelpCircle;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesSearch = !searchQuery ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px] orb-slow" />

        <div className="container max-w-3xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">
              <HelpCircle className="h-3.5 w-3.5 text-[var(--accent)]" />
              FAQ
            </span>
            <h1 className="display-xl mt-5 text-white">Questions? Answered.</h1>
            <p className="lead mx-auto mt-4">
              Browse by category or search for what you need to know.
            </p>
          </div>

          <div className="mt-8 mx-auto max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-dim)]" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="field w-full pl-10"
                aria-label="Search FAQ"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-300 ${
                activeCategory === "all"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-white"
              }`}
            >
              All
            </button>
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="!pt-8">
        <div className="container max-w-3xl">
          {searchQuery && filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[var(--text-dim)]">No questions found. Try another search or contact Bluey.</p>
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2 mt-4">
                Contact Bluey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-0">
              {filtered.map((item, i) => (
                <FAQItem key={item.question} item={item} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-[var(--text-dim)]">No questions found. Try another search or contact Bluey.</p>
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2 mt-4">
                Contact Bluey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="mt-16 text-center">
            <div className="mx-auto max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
              <p className="text-sm font-semibold text-white mb-2">Can&apos;t find what you&apos;re looking for?</p>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Still have questions? Reach out and I&rsquo;ll get back to you.
              </p>
              <ButtonLink href="/contact" variant="primary">
                Contact Bluey
              </ButtonLink>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--text-dim)]">
                <Link href="/tos" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                  <FileText className="h-3.5 w-3.5" />
                  Terms of Service
                </Link>
                <span className="text-[var(--border)]">|</span>
                <Link href="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
