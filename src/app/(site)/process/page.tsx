"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getWorkflowSteps } from "@/lib/db";

export default function CommissionProcessPage() {
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getWorkflowSteps();
        setSteps(data);
      } catch (e) {
        console.error("Failed to load process steps:", e);
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
          <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[130px]" />

          <div className="container">
            <div className="mb-8">
              <Link
                href="/before-ordering"
                className="inline-flex items-center gap-2 text-sm text-[var(--text-dim)] hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Before Ordering
              </Link>
            </div>

            <SectionHeading
              align="center"
              eyebrow="Process"
              title="Commission Process"
              subtitle="A straightforward 5-step process from request to final delivery."
            />

            <div className="relative mb-16">
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--border)] -translate-x-1/2" />

              <div className="space-y-12">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="relative flex items-start gap-8 lg:even:flex-row-reverse">
                    <div className="flex-shrink-0">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] text-2xl shadow-md animate-pulse" />
                    </div>

                    <div className="flex-1 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                      <div className="h-5 w-1/3 rounded bg-[var(--bg)] mb-3" />
                      <div className="h-3 w-full rounded bg-[var(--bg)]" />
                    </div>
                  </div>
                ))}
              </div>
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
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[130px]" />

        <div className="container">
          <div className="mb-8">
            <Link
              href="/before-ordering"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-dim)] hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Before Ordering
            </Link>
          </div>

          <SectionHeading
            align="center"
            eyebrow="Process"
            title="Commission Process"
            subtitle="A straightforward process from request to final delivery."
          />

          {steps.length > 0 ? (
            <div className="relative mb-16">
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--border)] -translate-x-1/2" />

              <div className="space-y-12">
                {steps.map((step, index) => (
                  <div
                    key={step.id || index}
                    className={`relative flex items-start gap-8 lg:even:flex-row-reverse`}
                  >
                    <div className="flex-shrink-0">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] text-2xl shadow-md">
                        {step.emoji}
                        <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-4)] text-[10px] font-bold text-[#04060a]">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    <Reveal>
                      <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-500 hover:border-[var(--border-hover)]">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                          {step.title}
                        </h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                          {step.description || step.desc}
                        </p>
                      </div>
                    </Reveal>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
              <p className="text-[var(--text-dim)]">No process steps have been added yet.</p>
            </div>
          )}

          <Reveal>
            <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)]/60 p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Start?</h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
                Before placing your request, review the{" "}
                <Link
                  href="/before-ordering"
                  className="text-[var(--accent)] hover:text-white transition-colors"
                >
                  Before Ordering
                </Link>{" "}
                guide and the{" "}
                <Link
                  href="/tos"
                  className="text-[var(--accent)] hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                .
              </p>
              <Link href="/before-ordering" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                Start Commission
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
