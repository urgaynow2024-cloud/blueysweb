"use client";

import { useState, useEffect } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { PremiumCard } from "@/components/ui/Card";
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

const CATEGORY_EMOJI: Record<string, string> = {
  supporters: "💜",
  artists: "🎨",
  developers: "💻",
  testers: "🧪",
  helpers: "🛠️",
  "special-thanks": "🌟",
  "assets-resources": "📦",
  collaborators: "🤝",
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-[var(--bg)]" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-36 rounded bg-[var(--bg)]" />
          <div className="h-3 w-24 rounded bg-[var(--bg)]" />
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="h-3 w-full rounded bg-[var(--bg)]" />
        <div className="h-3 w-5/6 rounded bg-[var(--bg)]" />
      </div>
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

  const featuredCredits = credits.filter((c) => c.featured);
  const regularCredits = credits.filter((c) => !c.featured);

  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-20" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px] orb-slow" />

        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Credits"
            title="People Behind the Stars"
            subtitle="A huge thank you to everyone who has helped, supported, tested, created, or contributed to this project. I genuinely appreciate every bit of support. 💜"
          />

          {loading ? (
            <div className="mx-auto mb-16 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : credits.length > 0 ? (
            <>
              {featuredCredits.length > 0 && (
                <div className="mx-auto mb-16 max-w-5xl">
                  <div className="mb-6 flex items-center gap-2 text-[var(--text-secondary)]">
                    <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                    <h2 className="heading-md text-white">Featured</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {featuredCredits.map((credit, i) => (
                      <Reveal key={credit.id} delay={i * 70}>
                        <CreditCard credit={credit} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}

              {regularCredits.length > 0 && (
                <div className="mx-auto max-w-5xl">
                  {featuredCredits.length > 0 && (
                    <div className="mb-6 flex items-center gap-2 text-[var(--text-secondary)]">
                      <Heart className="h-5 w-5 text-[var(--accent)]" />
                      <h2 className="heading-md text-white">Everyone Else</h2>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {regularCredits.map((credit, i) => (
                      <Reveal key={credit.id} delay={i * 70}>
                        <CreditCard credit={credit} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mx-auto mb-16 max-w-2xl rounded-2xl border border-dashed border-[var(--border)] bg-white/[0.01] py-20 text-center">
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

function CreditCard({ credit }: { credit: Credit }) {
  const categoryEmojis = credit.categories.map((c) => CATEGORY_EMOJI[c] || "✨").join(" ");

  return (
    <div className="group flex h-full flex-col gap-5 rounded-2xl border border-[var(--border)] bg-white/[0.02] p-7 transition-all duration-500 hover:border-[var(--border-hover)] hover:bg-white/[0.04]">
      <div className="flex items-start gap-4">
        {credit.avatar_url ? (
          <img src={credit.avatar_url} alt={credit.name} className="h-12 w-12 rounded-xl object-cover" />
        ) : (
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-lg font-bold text-white">
            {credit.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{credit.name}</h3>
          <div className="mt-1 text-xs text-[var(--text-dim)]">{categoryEmojis}</div>
        </div>
      </div>

      {credit.description && (
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{credit.description}</p>
      )}

      {credit.note && (
        <p className="text-xs italic text-[var(--text-dim)]">&ldquo;{credit.note}&rdquo;</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {credit.website_url && (
          <a
            href={credit.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-muted)] hover:text-[var(--accent)]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Website
          </a>
        )}
        {credit.discord_url && (
          <a
            href={credit.discord_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-muted)] hover:text-[var(--accent)]"
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
            className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-muted)] hover:text-[var(--accent)]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {key}
          </a>
        ))}
      </div>
    </div>
  );
}
