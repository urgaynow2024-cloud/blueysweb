"use client";

import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { PremiumCard } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ExternalLink, Link2, Globe } from "lucide-react";
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
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.05] blur-[130px] orb-slow" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-[400px] rounded-full bg-[var(--accent-3)] opacity-[0.03] blur-[100px] orb-med" />
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
            <PremiumCard variant="elevated" className="py-16 text-center">
              <p className="text-[var(--text-dim)]">No links have been added yet.</p>
            </PremiumCard>
          ) : (
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
              {links.map((link, i) => (
                <Reveal key={link.id || i} delay={(i % 4) * 60}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex h-full items-center gap-5 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-md)] transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)] hover:shadow-[0_0_40px_rgba(90,176,240,0.08)]"
                  >
                    {/* Favicon */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-2.5 shadow-inner">
                      {!faviconErrors.has(link.url) ? (
                        <img
                          src={getFaviconUrl(link.url)}
                          alt=""
                          className="h-8 w-8 object-contain"
                          onError={() => {
                            setFaviconErrors((prev) => new Set(prev).add(link.url));
                          }}
                        />
                      ) : (
                        <Globe className="h-7 w-7 text-[var(--text-dim)]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white transition-colors group-hover:text-[var(--accent)]">
                        {link.name}
                      </h3>
                      {link.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                          {link.description}
                        </p>
                      )}
                      <p className="mt-2 break-all text-xs text-[var(--text-dim)]">{getDomain(link.url)}</p>
                    </div>

                    {/* Arrow */}
                    <span className="flex shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2.5 text-[var(--text-dim)] transition-all group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)] group-hover:shadow-[0_0_12px_var(--accent-glow)]">
                      <ExternalLink className="h-4 w-4" />
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
