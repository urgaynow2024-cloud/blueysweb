"use client";

import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ExternalLink, Link2 } from "lucide-react";

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/social-links");
        if (res.ok) {
          const data = await res.json();
          setLinks(data || []);
        }
      } catch (e) {
        console.error("Failed to load links:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Links"
            title="Find me elsewhere"
            subtitle="Socials, commission platforms, stores, and more — all in one place."
          />

          {loading ? (
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <div className="mb-3 h-5 w-1/3 rounded bg-[var(--bg)]" />
                  <div className="h-4 w-1/2 rounded bg-[var(--bg)]" />
                </div>
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
              <p className="text-[var(--text-dim)]">No links have been added yet.</p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
              {links.map((link, i) => (
                <Reveal key={link.id || i} delay={(i % 4) * 60}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex h-full items-start justify-between gap-4 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)]"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white transition-colors group-hover:text-[var(--accent)]">{link.name}</h3>
                      {link.description && <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{link.description}</p>}
                      <p className="mt-3 break-all text-xs text-[var(--text-dim)]">{link.url}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 text-xs text-[var(--text-dim)] transition-colors group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)]">
                      Visit
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <a href="/contact" className="btn-secondary inline-flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Or just message me
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
