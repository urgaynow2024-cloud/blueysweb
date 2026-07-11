"use client";

import { useState, useEffect } from "react";
import SectionTitle from "@/components/SectionTitle";
import { ExternalLink } from "lucide-react";

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
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 page-head">
            <span className="section-label justify-center">Links</span>
            <h2 className="display-lg text-white mb-3">Find me elsewhere</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">Socials, commission platforms, stores, and more.</p>
          </div>

          {loading ? (
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 animate-pulse">
                  <div className="h-5 bg-[var(--bg)] rounded w-1/3 mb-3" />
                  <div className="h-4 bg-[var(--bg)] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--text-dim)]">No links have been added yet.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {links.map((link, i) => (
                <a
                  key={link.id || i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)] transition-all duration-300"
                  style={{ animation: `fadeInUp 0.7s ${0.4 + i * 0.1}s ease both` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-white font-semibold group-hover:text-[var(--accent)] transition-colors">{link.name}</h3>
                      {link.description && <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">{link.description}</p>}
                    </div>
                    <span className="text-xs text-[var(--text-dim)] bg-[var(--bg)] px-2.5 py-1 rounded-lg border border-[var(--border)] inline-flex items-center gap-1.5">
                      Visit
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-[var(--text-dim)] break-all">{link.url}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
