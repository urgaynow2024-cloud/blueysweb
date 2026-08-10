"use client";

import { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getSiteConfig } from "@/lib/db";
import { tosSections } from "@/data/site";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUp, Search, FileText, ShieldCheck, Clock, AlertCircle, AlertTriangle, Info } from "lucide-react";

interface TosSection {
  id?: string;
  title: string;
  icon: string;
  description?: string;
  number?: string;
  section_type: "bullets" | "paragraphs";
  content: string;
  items: string[];
  highlight_box: string;
  box_type: "info" | "warning" | "error";
  box_title: string;
  sort_order: number;
  visible: boolean;
}

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

function renderMarkdown(text: string): string {
  if (!text) return "";
  let html = text
    .replace(/<(?!br|hr)\/?>[^<]*/gi, "")
    .replace(/'''/g, "''")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?:\r\n|\r|\n){3,}/g, "\n\n")
    .replace(/^### (.*$)/gm, "<h3 class='text-base font-semibold text-white mb-3 mt-6 first:mt-0'>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2 class='text-lg font-semibold text-white mb-3 mt-6 first:mt-0'>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1 class='text-2xl font-bold text-white mb-4'>$1</h1>")
    .split("\n\n")
    .map((para) => {
      para = para.trim();
      if (!para) return "";
      if (para.startsWith("<h") || para.startsWith("<str")) return para;
      return `<p class='mb-3 last:mb-0 leading-relaxed'>${para.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
  return html;
}

function BoxIcon({ type }: { type: string }) {
  if (type === "warning") return <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />;
  if (type === "error") return <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />;
  return <Info className="h-5 w-5 shrink-0 text-blue-400" />;
}

function getBoxClasses(type: string) {
  switch (type) {
    case "warning":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "error":
      return "border-red-500/30 bg-red-500/10 text-red-200";
    default:
      return "border-blue-500/30 bg-blue-500/10 text-blue-200";
  }
}

function SectionContent({ section }: { section: TosSection }) {
  if (section.section_type === "paragraphs" && section.content) {
    return (
      <div
        className="prose prose-invert max-w-none text-sm text-[var(--text-secondary)]"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
      />
    );
  }
  if (section.items && section.items.length > 0) {
    return (
      <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
        {section.items.map((item: string, j: number) => (
          <li key={j} className="flex items-start gap-3">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

export default function ToSPage() {
  const [sections, setSections] = useState<TosSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          const res = await fetch("/api/tos-sections");
          if (res.ok) {
            const data = await res.json();
            setSections(data);
          } else {
            setSections(tosSections as TosSection[]);
          }
        } else {
          setSections(tosSections as TosSection[]);
        }
        if (!isSupabaseConfigured) {
          const fallbackConfig: any = { tos_last_updated: "August 2025", tos_version: "2.0" };
          setLastUpdated(fallbackConfig.tos_last_updated || "August 2025");
          setVersion(fallbackConfig.tos_version || "2.0");
        } else {
          const config = await getSiteConfig();
          setLastUpdated((config as any).tos_last_updated || "August 2025");
          setVersion((config as any).tos_version || "2.0");
        }
      } catch (e) {
        console.error("Failed to load TOS:", e);
        setSections(tosSections as TosSection[]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredSections = sections.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <section className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28">
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
              These Terms govern all commissions, services, and interactions with Bluey Commissions. Please read them carefully before engaging our services.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-[var(--text-dim)]">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Last Updated: {lastUpdated || "—"}
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Version: {version || "—"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="!pt-0 !pb-4 md:!pb-6">
        <div className="container">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-dim)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms, sections, keywords..."
              className="field w-full !pl-12 pr-4 py-3 text-sm"
              aria-label="Search Terms of Service"
            />
          </div>
        </div>
      </section>

      {sections.length > 0 && (
        <section className="!pt-0 !pb-8 md:!pb-10">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-4">Contents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {sections.map((section, i) => {
                  const num = section.number || String(i + 1).padStart(2, "0");
                  return (
                    <button
                      key={section.id || i}
                      type="button"
                      onClick={() => scrollToSection(section.id || "")}
                      className="group flex items-center gap-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:text-white"
                    >
                      <span className="text-xs font-bold text-[var(--accent)] opacity-60 group-hover:opacity-100 transition-opacity">{num}</span>
                      <span className="border-b border-transparent group-hover:border-[var(--border)] transition-colors">{section.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="!pt-0">
        <div className="container max-w-3xl">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredSections.length > 0 ? (
            <div className="space-y-10 md:space-y-12">
              {filteredSections.map((section, i) => (
                <Reveal key={section.id || i} delay={(i % 4) * 60}>
                  <div
                    id={section.id || ""}
                    className="scroll-mt-24 md:scroll-mt-28"
                  >
                    <div className="flex items-baseline gap-4 mb-3">
                      <span className="text-sm font-bold text-[var(--accent)] tabular-nums">
                        {section.number || String(i + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-white">{section.title}</h2>
                    </div>
                    {section.description && (
                      <p className="text-sm text-[var(--text-dim)] mb-5 max-w-2xl">{section.description}</p>
                    )}
                    <div className="pl-0 md:pl-10">
                      {section.highlight_box && (
                        <div className={`mb-5 rounded-xl border p-4 ${getBoxClasses(section.box_type || "info")}`}>
                          <div className="flex items-start gap-3">
                            {BoxIcon({ type: section.box_type || "info" })}
                            <div>
                              {section.box_title && (
                                <p className="font-semibold mb-1">{section.box_title}</p>
                              )}
                              <p className="text-sm">{section.highlight_box}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {section.section_type === "paragraphs" && section.content ? (
                        <div
                          className="prose prose-invert max-w-none text-sm text-[var(--text-secondary)]"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
                        />
                      ) : (
                        <SectionContent section={section} />
                      )}
                    </div>
                    {i < filteredSections.length - 1 && (
                      <div className="mt-10 md:mt-12 border-b border-[var(--border)]" />
                    )}
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

          {showBackToTop && (
            <div className="fixed bottom-24 lg:bottom-8 right-4 md:right-8 z-40">
              <button
                type="button"
                onClick={scrollToTop}
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] shadow-lg transition-all hover:border-[var(--accent)] hover:text-white"
              >
                <ArrowUp className="h-4 w-4" />
                Back to Top
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section !pt-4 md:!pt-6">
        <div className="container max-w-3xl text-center">
          <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-10">
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-[var(--text-dim)]">
              <Clock className="h-4 w-4" />
              Last Updated: {lastUpdated || "—"}
              <span className="mx-2 text-[var(--border)]">|</span>
              <ShieldCheck className="h-4 w-4" />
              Version: {version || "—"}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              These Terms of Service constitute the entire agreement between you and Bluey Commissions regarding the use of our services. By commissioning work, you acknowledge that you have read, understood, and agreed to these Terms.
            </p>
            <div className="mt-4 flex justify-center">
              <Reveal>
                <ButtonLink href="/commission" variant="secondary" size="sm">
                  <span>Back to Commission Form</span>
                </ButtonLink>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
