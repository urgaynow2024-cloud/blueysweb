"use client";

import { useState, useEffect } from "react";
import Reveal from "@/components/ui/Reveal";
import { ExternalLink, Heart, Sparkles } from "lucide-react";

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
          setCredits(data || []);
        }
      } catch (e) {
        console.error("Failed to load credits:", e);
      } finally {
        setLoading(false);
      }
    }
    loadCredits();
  }, []);

  const grouped = credits.reduce<Record<string, Credit[]>>((acc, c) => {
    const cats = c.categories && c.categories.length > 0 ? c.categories : ["supporters"];
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
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px] orb-slow" />

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <Heart className="h-3.5 w-3.5 text-[var(--accent)]" />
              Credits
            </span>
            <h1 className="display-xl mt-5 text-white">
              ✦ People Behind the <span className="text-gradient-animated">Stars</span>
            </h1>
            <p className="lead mx-auto mt-4 max-w-2xl">
              A huge thank you to everyone who has helped, supported, tested, created, or contributed to this project. I genuinely appreciate every bit of support. 💜
            </p>
          </div>

          {loading ? (
            <div className="mx-auto max-w-3xl space-y-6">
              {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
            </div>
          ) : credits.length > 0 ? (
            <div className="mx-auto max-w-3xl">
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
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Heart className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                Credits will appear here as contributors are added.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
