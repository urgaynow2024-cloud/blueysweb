"use client";

import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { getTosSections, getSiteConfig } from "@/lib/db";

export default function ToSPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [site, setSite] = useState<any>({});
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="relative">
        <section className="page">
          <div className="container max-w-4xl">
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

  const lastUpdated = site.tos_last_updated || "";
  const intro = site.tos_intro || [];

  return (
    <div className="relative">
      <section className="page">
        <div className="container max-w-4xl">
            <SectionHeading
              align="center"
              eyebrow="Terms"
              title="Terms of Service"
              subtitle="By commissioning me, you agree to the rules below. Please read carefully before ordering."
            />

            {lastUpdated && (
              <div className="mb-8 text-center">
                <p className="text-sm text-[var(--text-dim)]">Last Updated: {lastUpdated}</p>
              </div>
            )}

            {intro.length > 0 && (
              <div className="mx-auto mb-10 max-w-2xl space-y-4 text-center text-[var(--text-secondary)]">
                {intro.map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            {sections.length > 0 ? (
              <div className="space-y-3">
                {sections.map((section, i) => (
                  <Reveal key={section.title || i} delay={(i % 4) * 50}>
                    <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-500 hover:border-[var(--border-hover)]">
                      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                        <span className="text-lg">{section.icon}</span>
                        {section.title}
                      </h2>
                      <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                        {(section.items || []).map((item: string, j: number) => (
                          <li key={`${i}-${j}`} className="flex items-start gap-3">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-12 text-center">
                <p className="text-[var(--text-dim)]">No terms of service content has been added yet.</p>
              </div>
            )}

          <div className="mt-12 text-center">
            <ButtonLink href="/contact">Have questions?</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}