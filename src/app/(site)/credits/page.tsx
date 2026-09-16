"use client";

import { useState, useEffect } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ExternalLink, Heart, Sparkles } from "lucide-react";
import { mockCredits } from "@/config/site";

interface Credit {
  id: string;
  name: string;
  description: string;
  categories: string[];
  avatar_url: string | null;
  website_url: string | null;
  discord_url: string | null;
  social_links: Record<string, string>;
  note: string;
  featured: boolean;
}

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  supporters: { emoji: "💜", label: "Supporters" },
  artists: { emoji: "🎨", label: "Artists" },
  developers: { emoji: "💻", label: "Developers" },
  testers: { emoji: "🧪", label: "Testers" },
  helpers: { emoji: "🛠️", label: "Helpers" },
  collaborators: { emoji: "🤝", label: "Collaborators" },
  "assets-resources": { emoji: "📦", label: "Assets / Resources" },
  "special-thanks": { emoji: "🌟", label: "Special Thanks" },
};

function SkeletonRow() {
  return (
    <div className="animate-pulse space-y-3 py-4">
      <div className="h-4 w-32 rounded bg-[var(--border)]" />
      <div className="h-3 w-full rounded bg-[var(--border)]" />
      <div className="h-3 w-5/6 rounded bg-[var(--border)]" />
    </div>
  );
}

export default function CreditsPage() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCredits() {
      setLoading(true);
      try {
        const res = await fetch("/api/credits");
        if (res.ok) {
          const data = await res.json();
          // Deduplicate by id to prevent the same person appearing multiple times
          const seen = new Set<string>();
          const unique = (data || []).filter((c: Credit) => {
            if (!c.id || seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
          });
          setCredits(unique);
        } else {
          setCredits(mockCredits as unknown as Credit[]);
        }
      } catch (e) {
        console.error("Failed to load credits:", e);
        setCredits(mockCredits as unknown as Credit[]);
      } finally {
        setLoading(false);
      }
    }
    loadCredits();
  }, []);

  const grouped = credits.reduce<Record<string, Credit[]>>((acc, c) => {
    // Each person appears under only their first category to avoid duplicates
    const cats = c.categories && c.categories.length > 0 ? [c.categories[0]] : ["supporters"];
    cats.forEach((cat) => {
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(c);
    });
    return acc;
  }, {});

  const categoryOrder = Object.keys(CATEGORY_META);
  const sortedCategories = categoryOrder.filter((c) => grouped[c] && grouped[c].length > 0);

  return (
    <div className="relative">
      <section className="section">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Credits"
            title="People Behind the Stars"
            subtitle="A huge thank you to everyone who has helped, supported, tested, created, or contributed. I genuinely appreciate every bit of support."
          />

          {loading ? (
            <div className="mx-auto mt-10 max-w-3xl space-y-6">
              {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
            </div>
          ) : credits.length > 0 ? (
            <div className="mt-10 mx-auto max-w-3xl">
              {sortedCategories.map((cat, catIdx) => {
                const meta = CATEGORY_META[cat] || { emoji: "✨", label: cat };
                const items = grouped[cat];
                return (
                  <Reveal key={cat} delay={catIdx * 100}>
                    <div className="mt-16 first:mt-0">
                      <div className="section-eyebrow">
                        <span>{meta.emoji}</span>
                        <span>{meta.label}</span>
                      </div>
                      <div className="mt-8 space-y-8">
                        {items.map((credit) => (
                          <div key={credit.id} className="flex gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                {credit.avatar_url ? (
                                  <img
                                    src={credit.avatar_url}
                                    alt={credit.name}
                                    className="h-10 w-10 rounded-xl object-cover border border-[var(--border)]"
                                  />
                                ) : (
                                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-sm font-bold text-white border border-[var(--border)]">
                                    {credit.name?.[0]?.toUpperCase() || "?"}
                                  </div>
                                )}
                                <div>
                                  <h3 className="text-sm font-bold text-white">{credit.name}</h3>
                                  {credit.note && (
                                    <p className="text-xs text-[var(--text-dim)] italic">&ldquo;{credit.note}&rdquo;</p>
                                  )}
                                </div>
                              </div>
                              {credit.description && (
                                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                                  {credit.description}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap items-center gap-3">
                                {credit.website_url && (
                                  <a
                                    href={credit.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-muted)] hover:text-[var(--accent)] transition-colors"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Website
                                  </a>
                                )}
                                {credit.discord_url && (
                                  <a
                                    href={credit.discord_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-muted)] hover:text-[var(--accent)] transition-colors"
                                  >
                                    Discord
                                  </a>
                                )}
                                {Object.entries(credit.social_links || {}).map(([key, url]) => (
                                  <a
                                    key={key}
                                    href={url as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-muted)] hover:text-[var(--accent)] transition-colors"
                                  >
                                    {key}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 empty-state">
              <div className="empty-state-icon">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="empty-state-title">No credits yet</h3>
              <p className="empty-state-desc">Credits will appear here as contributors are added.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}