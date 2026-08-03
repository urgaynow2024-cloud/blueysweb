"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Menu, X, ArrowUp, FileText, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { getTosSections, getSiteConfig } from "@/lib/db";

const TYPE_CONFIG: Record<string, { icon: typeof Info; color: string; bg: string; border: string; label: string }> = {
  section: { icon: FileText, color: "text-[var(--accent)]", bg: "bg-[var(--accent-soft)]", border: "border-[var(--accent)]/20", label: "Section" },
  warning: { icon: AlertTriangle, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", border: "border-[var(--warning)]/30", label: "Important" },
  important: { icon: AlertTriangle, color: "text-[var(--danger)]", bg: "bg-[var(--danger)]/10", border: "border-[var(--danger)]/30", label: "Critical" },
  info: { icon: Info, color: "text-[var(--accent-3)]", bg: "bg-[var(--accent-3)]/10", border: "border-[var(--accent-3)]/30", label: "Information" },
  note: { icon: CheckCircle2, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10", border: "border-[var(--success)]/30", label: "Good to know" },
};

const COLOUR_ACCENT: Record<string, string> = {
  accent: "var(--accent)",
  "accent-2": "var(--accent-2)",
  "accent-3": "var(--accent-3)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  success: "var(--success)",
};

interface TosSection {
  id?: string;
  title: string;
  icon: string;
  description: string;
  items: string[];
  type: string;
  is_visible: boolean;
  colour: string;
  card_style: string;
  sort_order: number;
}

interface SiteConfig {
  name?: string;
  tagline?: string;
  description?: string;
  discord?: string;
  tos_last_updated?: string;
  tos_intro?: string[];
}

export default function ToSPage() {
  const [sections, setSections] = useState<TosSection[]>([]);
  const [site, setSite] = useState<SiteConfig>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});

  const contentRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, t] = await Promise.all([getSiteConfig(), getTosSections()]);
        setSite(s);
        setSections(t);
      } catch (e) {
        console.error("Failed to load TOS data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visibleSections = useMemo(() => {
    return sections.filter((s) => s.is_visible !== false);
  }, [sections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return visibleSections;
    const q = searchQuery.toLowerCase().trim();
    return visibleSections.filter((section) => {
      const titleMatch = section.title?.toLowerCase().includes(q);
      const descMatch = section.description?.toLowerCase().includes(q);
      const itemsMatch = (section.items || []).some((item: string) => item.toLowerCase().includes(q));
      return titleMatch || descMatch || itemsMatch;
    });
  }, [visibleSections, searchQuery]);

  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll("[data-tos-section]");
    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute("data-tos-section") || "");
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => observerRef.current?.observe(h));
    return () => observerRef.current?.disconnect();
  }, [filteredSections, loading]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setShowMobileToc(false);
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const allAgreed = Object.values(agreed).length >= 4 && Object.values(agreed).every(Boolean);

  const lastUpdated = site.tos_last_updated || "";
  const intro = site.tos_intro || [];

  function highlightText(text: string, query: string) {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="rounded bg-[var(--accent)]/20 px-0.5 text-[var(--accent)]">{part}</mark>
      ) : (
        part
      )
    );
  }

  if (loading) {
    return (
      <div className="relative">
        <section className="page">
          <div className="container max-w-5xl">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <div className="h-4 w-1/3 rounded bg-[var(--bg)]" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-[var(--bg)]" />
                    <div className="h-3 w-full rounded bg-[var(--bg)]" />
                    <div className="h-3 w-2/3 rounded bg-[var(--bg)]" />
                  </div>
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
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[120px]" />
        <div className="container relative max-w-5xl pt-10 md:pt-16">
          <SectionHeading
            align="center"
            eyebrow="Terms"
            title="Terms of Service"
            subtitle="By commissioning me, you agree to the rules below. Please read carefully before ordering."
          />
          {lastUpdated && (
            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-4 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                </span>
                Last Updated: {lastUpdated}
              </span>
            </div>
          )}
          {intro.length > 0 && (
            <div className="mx-auto mt-8 max-w-2xl space-y-4 text-center text-[var(--text-secondary)]">
              {intro.map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terms..."
                className="field w-full pl-11 pr-4"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--text-dim)] hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-center text-xs text-[var(--text-dim)]">
                {filteredSections.length === 0
                  ? "No sections match your search."
                  : `${filteredSections.length} section${filteredSections.length !== 1 ? "s" : ""} found`}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="page">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">Table of Contents</h3>
                <nav ref={tocRef} className="space-y-1">
                  {filteredSections.map((section) => {
                    const id = `tos-${section.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
                    const isActive = activeSection === id;
                    const typeConf = TYPE_CONFIG[section.type] || TYPE_CONFIG.section;
                    return (
                      <button
                        key={section.id || section.title}
                        onClick={() => scrollToSection(id)}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-300 ${
                          isActive
                            ? "bg-[var(--accent-soft)] text-white shadow-sm"
                            : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs transition-colors ${isActive ? "bg-[var(--accent)]/15" : "bg-white/5 group-hover:bg-white/10"}`}>
                          {typeof section.icon === 'string' && section.icon ? (
                            <span>{section.icon}</span>
                          ) : (
                            <typeConf.icon className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span className="truncate text-xs font-medium">{section.title}</span>
                        {isActive && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />}
                      </button>
                    );
                  })}
                </nav>
                <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">Need help?</h4>
                  <ButtonLink href="/contact" variant="secondary" className="w-full justify-center text-xs">
                    Contact Support
                  </ButtonLink>
                </div>
              </div>
            </aside>

            <div ref={contentRef} className="space-y-6">
              {filteredSections.length > 0 ? (
                filteredSections.map((section, i) => {
                  const id = `tos-${section.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
                  const typeConf = TYPE_CONFIG[section.type] || TYPE_CONFIG.section;
                  const Icon = typeConf.icon;
                  const accentColor = COLOUR_ACCENT[section.colour] || COLOUR_ACCENT.accent;
                  const isHighlight = section.card_style === "highlight";
                  const isGlass = section.card_style === "glass";

                  return (
                    <div
                      key={section.id || section.title || i}
                      id={id}
                      data-tos-section={id}
                      className={`scroll-mt-24 rounded-[var(--r-lg)] border transition-all duration-500 hover:translate-y-[-2px] ${
                        isHighlight
                          ? "border-[var(--border-strong)] bg-[var(--bg-card)] shadow-lg"
                          : isGlass
                          ? "glass border-[var(--border)]"
                          : "border-[var(--border)] bg-[var(--bg-card)]"
                      }`}
                      style={isHighlight ? { borderLeftWidth: "3px", borderLeftColor: accentColor } : undefined}
                    >
                      <div className="p-6 md:p-8">
                        <div className="mb-4 flex items-start gap-4">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
                            style={{ background: `${accentColor}15`, color: accentColor }}
                          >
                            {section.icon || <Icon className="h-6 w-6" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <h2 className="text-lg font-bold text-white">{section.title}</h2>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeConf.bg} ${typeConf.color} border ${typeConf.border}`}>
                                <Icon className="h-3 w-3" />
                                {typeConf.label}
                              </span>
                            </div>
                            {section.description && (
                              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{section.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="ml-0 md:ml-16">
                          <ul className="space-y-3">
                            {(section.items || []).map((item: string, j: number) => {
                              const isMatch = searchQuery.trim() && item.toLowerCase().includes(searchQuery.toLowerCase().trim());
                              return (
                                <li
                                  key={j}
                                  className={`flex items-start gap-3 rounded-lg p-3 text-sm transition-all duration-300 ${
                                    isMatch ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/30" : "hover:bg-white/[0.02]"
                                  }`}
                                >
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accentColor }} />
                                  <span className="text-[var(--text-secondary)]">{highlightText(item, searchQuery)}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
                  <p className="text-[var(--text-dim)]">
                    {searchQuery ? "No sections match your search." : "No terms of service content has been added yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="page">
        <div className="container max-w-3xl">
          <div className="rounded-[var(--r-lg)] border border-[var(--border-strong)] bg-[var(--bg-card)] p-6 md:p-10">
            <h2 className="text-xl font-bold text-white">Agreement</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              By submitting a commission request, you confirm that you have read and agree to the following:
            </p>
            <div className="mt-6 space-y-4">
              {[
                { key: "understand", label: "I understand these Terms of Service." },
                { key: "refunds", label: "I understand refunds are limited to specific circumstances as outlined above." },
                { key: "ownership", label: "I own all supplied assets and have the legal right to use them in this commission." },
                { key: "proof", label: "I understand proof of purchase may be requested for any assets provided." },
              ].map((item) => (
                <label
                  key={item.key}
                  onClick={() => setAgreed((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all duration-300 ${
                    agreed[item.key]
                      ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-white/[0.01] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <div className="mt-0.5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-300 ${
                        agreed[item.key] ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border-strong)] bg-transparent"
                      }`}
                    >
                      {agreed[item.key] && <CheckCircle2 className="h-3.5 w-3.5 text-[#04060a]" />}
                    </div>
                  </div>
                  <span className={`text-sm transition-colors ${agreed[item.key] ? "text-white" : "text-[var(--text-secondary)]"}`}>{item.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <span className={!allAgreed ? "pointer-events-none opacity-50" : ""}>
                <ButtonLink href="/commission" className="w-full sm:w-auto">
                  Return to Commission Form
                </ButtonLink>
              </span>
              {!allAgreed && (
                <p className="text-xs text-[var(--text-dim)]">Please confirm all statements above to continue.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-float)] text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => setShowMobileToc(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-float)] text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] lg:hidden"
          aria-label="Table of contents"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {showMobileToc && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileToc(false)} />
          <div className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-[var(--bg-elevated)] border-l border-[var(--border)] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Table of Contents</h3>
              <button onClick={() => setShowMobileToc(false)} className="rounded-lg p-1 text-[var(--text-dim)] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {filteredSections.map((section) => {
                const id = `tos-${section.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
                return (
                  <button
                    key={section.id || section.title}
                    onClick={() => scrollToSection(id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--text-secondary)] transition-all hover:bg-white/5 hover:text-white"
                  >
                    <span className="text-base">{section.icon}</span>
                    <span className="truncate">{section.title}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-8">
              <ButtonLink href="/contact" variant="secondary" className="w-full justify-center text-sm">
                Contact Support
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
