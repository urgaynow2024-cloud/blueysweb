"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { getCredits } from "@/lib/db";
import { creditsData, mockCredits } from "@/config/site";
import { ExternalLink, Globe, Heart, Code, Palette, Type, Package, Users, Sparkles } from "lucide-react";

const CREDIT_ICONS: Record<string, React.ElementType> = {
  "Website & Development": Code,
  Icons: Palette,
  Fonts: Type,
  "Visual Assets": Package,
  "Special Thanks": Users,
};

const SECTION_ORDER = ["websiteDev", "icons", "fonts", "visualAssets", "specialThanks"] as const;

export default function CreditsPage() {
  const [dbCredits, setDbCredits] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const credits = await getCredits();
      if (credits && credits.length > 0) {
        setDbCredits(credits);
      }
    }
    load();
  }, []);

  const configCredits = dbCredits.length > 0 ? dbCredits : mockCredits;

  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px] orb-slow" />

        <div className="container max-w-3xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              Acknowledgements
            </span>
            <h1 className="display-xl mt-5 text-white">
              Credits &amp; Thanks
            </h1>
            <p className="lead mx-auto mt-4">
              This website is built with the help of many wonderful tools, libraries, and
              resources. Every contributor is listed below — thank you for making this
              possible.
            </p>
          </div>
        </div>
      </section>

      <section className="!pt-12">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            {SECTION_ORDER.map((key) => {
              const section = creditsData[key];
              const Icon = CREDIT_ICONS[section.title] || Globe;
              if (!section.items.length) return null;

              return (
                <Reveal key={key} delay={0}>
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h2 className="heading-sm text-white">{section.title}</h2>
                    </div>
                    <ul className="space-y-3">
                      {section.items.map((item: any) => (
                        <li
                          key={item.name}
                          className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                              {item.description}
                            </p>
                          </div>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 shrink-0 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-2)] transition-colors"
                              aria-label={`Visit ${item.name}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Visit
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}

            {configCredits.length > 0 && (
              <Reveal delay={0}>
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Heart className="h-5 w-5" />
                    </span>
                    <h2 className="heading-sm text-white">Community Credits</h2>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Folks who have contributed feedback, testing, or community support.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {configCredits.map((credit) => (
                      <div
                        key={credit.id}
                        className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
                      >
                        {credit.avatar_url ? (
                          <img
                            src={credit.avatar_url}
                            alt={credit.name}
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-sm font-bold">
                            {credit.name?.[0]?.toUpperCase() || "★"}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{credit.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {credit.description}
                          </p>
                          {credit.categories && (
                            <p className="mt-1 text-[10px] text-[var(--text-dim)]">
                              {credit.categories.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={120}>
            <div className="mt-16 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Want to be listed here? Get in touch through{" "}
                <Link href="/contact" className="text-[var(--accent)] hover:underline underline-offset-4">
                  the contact page
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
