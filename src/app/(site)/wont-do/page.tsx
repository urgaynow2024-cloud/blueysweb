"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Ban, RefreshCw, ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { WontDoCategoryView } from "@/lib/wont-do/types";

/**
 * Public "What I Won't Do" page.
 *
 * The content is read from the database through `GET /api/wont-do`, which only
 * ever returns published items, so anything the owner unpublishes disappears
 * from this page without being deleted.
 */
export default function WontDoPage() {
  const [categories, setCategories] = useState<WontDoCategoryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wont-do", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("This page could not be loaded right now.");
      }
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "This page could not be loaded right now."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />

      <section className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent-2)] opacity-[0.05] blur-[130px] orb-slow" />

        <div className="container max-w-3xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">
              <Ban className="h-3.5 w-3.5 text-[var(--accent-2)]" />
              Scope &amp; Limits
            </span>
            <h1 className="display-xl mt-5 text-white">What I Won&rsquo;t Do</h1>
            <p className="lead mx-auto mt-4">
              A clear list of the commissions, requests and content I do not take
              on. Checking this first saves us both time.
            </p>
          </div>
        </div>
      </section>

      <section className="!pt-8">
        <div className="container max-w-3xl">
          {loading ? (
            <div className="space-y-4" aria-busy="true" aria-label="Loading content">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
                >
                  <div className="h-5 w-48 animate-pulse rounded bg-white/5" />
                  <div className="mt-4 space-y-3">
                    <div className="h-3 w-full animate-pulse rounded bg-white/5" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="empty-state-title">This page could not be loaded</h3>
              <p className="empty-state-desc">{error}</p>
              <button
                type="button"
                onClick={load}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Ban className="h-6 w-6" />
              </div>
              <h3 className="empty-state-title">Nothing listed yet</h3>
              <p className="empty-state-desc">
                There is no list of restrictions here at the moment. If you are
                unsure whether a request fits, just ask before sending a
                commission request.
              </p>
              <ButtonLink href="/commission" variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start a commission
              </ButtonLink>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {categories
                .filter((c) => (c.items?.length ?? 0) > 0 || !!c.description)
                .map((category) => (
                  <article
                    key={category.id}
                    className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] glass p-5"
                  >
                    <h2 className="text-lg font-semibold tracking-tight text-white">
                      {category.title}
                    </h2>
                    {category.description ? (
                      <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {category.description}
                      </p>
                    ) : null}

                    {category.items?.length ? (
                      <ul className="mt-3 divide-y divide-[var(--border)]">
                        {category.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-start gap-2 py-2"
                          >
                            <span
                              className="mt-0.5 shrink-0 text-red-400"
                              aria-hidden="true"
                            >
                              🚫
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white">
                                {item.title}
                              </p>
                              {item.description ? (
                                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                                  {item.description}
                                </p>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
            </div>
          )}

          <div className="mt-14 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7 text-center">
            <p className="text-sm font-semibold text-white">
              Something on this list still sounds like a good fit?
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">
              Rules are not deal breakers if the request is reasonable. Send a
              commission request and I will tell you honestly whether it is
              something I can take on.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/commission" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start a commission
              </ButtonLink>
              <Link
                href="/tos"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-white"
              >
                Read the Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
