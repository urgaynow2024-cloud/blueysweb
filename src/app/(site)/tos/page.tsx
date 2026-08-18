"use client";

import { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getSiteConfig } from "@/lib/db";
import { tosSections } from "@/data/site";
import { FileText, ShieldCheck, Clock } from "lucide-react";

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
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [version, setVersion] = useState<string>("");
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

  return (
    <div className="relative" ref={contentRef}>
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px] orb-slow" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-56 w-[400px] rounded-full bg-[var(--accent-cosmic)] opacity-[0.03] blur-[100px] orb-med" />

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              <FileText className="h-3.5 w-3.5 text-[var(--accent)]" />
              Terms of Service
            </span>
            <h1 className="display-xl mt-5 text-white">Terms of Service</h1>
            <p className="lead mx-auto mt-4">
              These Terms govern commissions, services, and interactions with Bluey Commissions. Please read them carefully before engaging our services.
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

      <section className="!pt-0">
        <div className="container max-w-3xl">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-[var(--bg-elevated)]" />
              ))}
            </div>
          ) : sections.length > 0 ? (
            <div>
              {sections.map((section, i) => (
                <div
                  key={section.id || i}
                  id={section.id || ""}
                  className={i > 0 ? "mt-10 md:mt-12 pt-10 md:pt-12 border-t border-[var(--border)]" : ""}
                >
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="text-sm font-bold text-[var(--accent)] tabular-nums">
                      {section.number || String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-white">{section.title}</h2>
                  </div>
                  {section.description && (
                    <p className="text-sm text-[var(--text-dim)] mb-5 max-w-2xl">{section.description}</p>
                  )}
                  <div>
                    {section.highlight_box && (
                      <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                        <p className="text-sm text-[var(--text-secondary)]">{section.highlight_box}</p>
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
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                Terms of Service sections will appear here once configured.
              </p>
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
          </div>
        </div>
      </section>
    </div>
  );
}
