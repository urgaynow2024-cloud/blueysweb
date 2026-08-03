"use client";

import { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUp, Search, FileText, ShieldCheck, Clock, AlertCircle, CheckCircle2, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="h-8 w-3/4 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-full rounded bg-[var(--bg)] animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-[var(--bg)] animate-pulse" />
        <div className="h-4 w-full rounded bg-[var(--bg)] animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-[var(--bg)] animate-pulse" />
      </div>
    </div>
  );
}

export default function ToSPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (!isSupabaseConfigured || !supabase) {
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("tos_sections")
          .select("*")
          .eq("visible", true)
          .order("sort_order", { ascending: true });
        if (error) throw error;
        setSections(data || []);
      } catch (e) {
        console.error("Failed to load TOS:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredSections = sections.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.items?.some((item: string) => item.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative" ref={contentRef}>
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px]" />

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              <FileText className="h-3.5 w-3.5 text-[var(--accent)]" />
              Terms of Service
            </span>
            <h1 className="display-xl mt-5 text-white">Terms of Service</h1>
            <p className="lead mx-auto mt-4">
              Please read these terms carefully before commissioning. By working with me, you agree to the rules outlined below.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--text-dim)]">
              <Clock className="h-4 w-4" />
              Last Updated: July 2026
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="section !pt-0">
        <div className="container">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-dim)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms..."
              className="field w-full pl-12 pr-4 py-3 text-sm"
              aria-label="Search Terms of Service"
            />
          </div>
        </div>
      </section>

      {/* Sticky Table of Contents */}
      {sections.length > 0 && (
        <section className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
          <div className="container py-4">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="shrink-0 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider">Contents</span>
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id || "")}
                    className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-4 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--accent)] hover:text-white"
                  >
                    {section.icon} {section.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TOS Sections */}
      <section className="section">
        <div className="container max-w-4xl">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredSections.length > 0 ? (
            <div className="space-y-6" id="toc-content">
              {filteredSections.map((section, i) => (
                <Reveal key={section.id || i} delay={(i % 4) * 60}>
                  <div
                    id={section.id || ""}
                    className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-all duration-500 hover:border-[var(--border-hover)]"
                  >
                    {/* Section Header */}
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                      aria-expanded={expandedSection === section.id}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl">
                          {section.icon}
                        </span>
                        <h2 className="text-lg font-bold text-white">{section.title}</h2>
                      </div>
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--accent)] transition-all duration-300 ${
                        expandedSection === section.id ? "rotate-180 bg-[var(--accent-soft)]" : ""
                      }`}>
                        {expandedSection === section.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </span>
                    </button>

                    {/* Section Content */}
                    <div
                      className="grid transition-all duration-500 ease-out"
                      style={{ gridTemplateRows: expandedSection === section.id ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden px-6 pb-6">
                        {section.highlight_box && (
                          <div className="mb-5 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 shrink-0 text-[var(--accent)] mt-0.5" />
                              <p className="text-sm text-[var(--accent)]">{section.highlight_box}</p>
                            </div>
                          </div>
                        )}

                        <ul className="space-y-3">
                          {section.items.map((item: string, j: number) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                              <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs">
                                {j + 1}
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <FileText className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                {searchQuery ? "No matching sections found." : "Terms of Service sections will appear here once configured."}
              </p>
            </div>
          )}

          {/* Back to Top */}
          <div className="mt-16 text-center">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--accent)] hover:text-white hover:shadow-lg"
            >
              <ArrowUp className="h-4 w-4" />
              Back to Top
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}