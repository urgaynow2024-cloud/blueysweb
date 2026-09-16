"use client";

import { useState, useEffect } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ExternalLink, Link2, Globe, Sparkles } from "lucide-react";
import { getSocialLinks } from "@/lib/db";

const MOCK_LINKS = [
  { id: "mock-link-1", name: "Discord", url: "https://discord.gg/zt48MZm5kD", description: "Chat with me directly on Discord" },
  { id: "mock-link-2", name: "Booth", url: "https://booth.pm/en", description: "Buy avatar bases and assets" },
  { id: "mock-link-3", name: "Gumroad", url: "https://gumroad.com", description: "Commission marketplace" },
  { id: "mock-link-4", name: "VRChat", url: "https://vrchat.com", description: "The platform I build for" },
];

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string): string {
  const domain = getDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [faviconErrors, setFaviconErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getSocialLinks();
        if (data && data.length > 0) {
          setLinks(data);
        } else {
          setLinks(MOCK_LINKS);
        }
      } catch {
        setLinks(MOCK_LINKS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="relative">
      <section className="section">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Links"
            title="Find Me Elsewhere"
            subtitle="Socials, commission platforms, stores, and more — all in one place."
          />

          {loading ? (
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Reveal key={i} delay={i * 60}>
                  <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-6 skeleton" />
                </Reveal>
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="mt-12 empty-state">
              <div className="empty-state-icon">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="empty-state-title">No links yet</h3>
              <p className="empty-state-desc">Links will appear here when added.</p>
            </div>
          ) : (
            <div className="mt-10 mx-auto max-w-3xl space-y-4">
              {links.map((link, i) => (
                <Reveal key={link.id || i} delay={(i % 4) * 60}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center gap-5 overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)]"
                  >
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-2 transition-all duration-300 group-hover:border-[var(--accent)]/30">
                      {!faviconErrors.has(link.url) ? (
                        <img
                          src={getFaviconUrl(link.url)}
                          alt=""
                          className="h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-110"
                          onError={() => {
                            setFaviconErrors((prev) => new Set(prev).add(link.url));
                          }}
                        />
                      ) : (
                        <Globe className="h-6 w-6 text-[var(--text-dim)] transition-colors duration-300 group-hover:text-[var(--accent)]" />
                      )}
                    </div>

                    <div className="relative min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white transition-colors duration-300 group-hover:text-[var(--accent)]">
                        {link.name}
                      </h3>
                      {link.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)] transition-colors duration-300 group-hover:text-white/80">
                          {link.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs font-medium text-[var(--text-dim)] transition-colors duration-300 group-hover:text-[var(--accent-muted)]">
                        {getDomain(link.url)}
                      </p>
                    </div>

                    <span className="relative flex shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-2 text-[var(--text-dim)] transition-all duration-300 group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)] group-hover:translate-x-0.5">
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <a href="/commission" className="btn-secondary inline-flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Or just message me
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}