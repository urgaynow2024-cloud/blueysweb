"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { AlertTriangle, CheckCircle2, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getBeforeOrderingItems } from "@/lib/db";

export default function BeforeOrderingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getBeforeOrderingItems();
        setItems(data);
      } catch (e) {
        console.error("Failed to load before ordering data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <section className="page relative overflow-hidden">
          <div className="container max-w-3xl">
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[var(--bg)]" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-4 w-36 rounded bg-[var(--bg)]" />
                      <div className="h-3 w-full rounded bg-[var(--bg)]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px]" />

        <div className="container max-w-3xl">
          <SectionHeading
            align="center"
            eyebrow="Before Ordering"
            icon={<CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />}
            title="Before You Order"
            subtitle="Please review the checklist below to ensure a smooth commission experience. This helps avoid delays and scope misunderstandings."
          />

          <div className="space-y-6 mb-12">
            {items.map((item, i) => (
              <Reveal key={item.title || i} delay={i * 60}>
                <div className="group flex gap-4 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--border-hover)]">
                  <div className="flex-shrink-0">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-2xl">
                      {item.emoji}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">{item.title}</h2>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mb-12 rounded-[var(--r-lg)] border border-amber-500/30 bg-amber-500/10 p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h2 className="text-amber-400 font-bold mb-2">Important Notice</h2>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    If you cannot confirm that you have valid permissions for the assets you intend to
                    use, please do not proceed with ordering. Purchasing assets from legitimate sources
                    (BOOTH, Gumroad, Sketchfab, etc.) is required. Bluey Commissions cannot be held
                    responsible for copyright claims resulting from client-supplied files.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink href="/process" variant="secondary">
              <FileText className="h-4 w-4" />
              View Commission Process
            </ButtonLink>
            <Link href="/tos" className="btn-ghost inline-flex items-center justify-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Read Full Terms
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}