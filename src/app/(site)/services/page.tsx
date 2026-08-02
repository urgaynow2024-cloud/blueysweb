"use client";

import { getServices, getWorkflowSteps } from "@/lib/db";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [workflow, setWorkflow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, w] = await Promise.all([getServices(), getWorkflowSteps()]);
        setServices(s);
        setWorkflow(w);
      } catch (e) {
        console.error("Failed to load services data:", e);
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
          <div className="container">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-7">
                  <div className="mb-5 aspect-[16/9] rounded-[var(--r-lg)] bg-[var(--bg)]" />
                  <div className="h-4 w-1/2 rounded bg-[var(--bg)]" />
                  <div className="mt-3 h-3 w-full rounded bg-[var(--bg)]" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-[var(--bg)]" />
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
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[130px]" />

        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Services"
            title="What I provide"
            subtitle="I work on VRChat avatars in a few different ways - from subtle edits to complete overhauls, including FBX mashups and optimisation."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((svc, i) => (
              <Reveal key={svc.title || i} delay={i * 60}>
                <div className="group h-full rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-7 shadow-lg shadow-black/20 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/50">
                  <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)]">
                    {svc.image_url ? (
                      <img
                        src={svc.image_url}
                        alt={svc.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-3xl opacity-30">{svc.emoji}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-50" />
                    <div className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-xl backdrop-blur">
                      {svc.emoji}
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white">{svc.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">{svc.desc}</p>
                  <ul className="space-y-2.5">
                    {(svc.features || []).map((f: string) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Check className="h-3 w-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {svc.title === "FBX Mashups & Custom Edits" && (
                    <Link
                      href="/fbx-mashups"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:text-white transition-colors"
                    >
                      View FBX Mashups
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          {workflow.length > 0 && (
            <>
              <div className="my-16">
                <div className="divider" />
              </div>

              <SectionHeading
                align="center"
                eyebrow="Process"
                title="How it Works"
                subtitle="From enquiry to delivery in five simple steps."
              />

              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {workflow.map((step, i) => (
                  <Reveal key={step.title || i} delay={(i % 5) * 60}>
                    <div className="group h-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)]">
                      <div className="mb-3 text-2xl transition-transform duration-300 group-hover:scale-110">{step.emoji}</div>
                      <h3 className="mb-1.5 text-sm font-bold text-white">{step.title}</h3>
                      <p className="px-1 text-xs leading-relaxed text-[var(--text-dim)]">{step.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </>
          )}

          <div className="mt-12 text-center">
            <ButtonLink href="/process" variant="secondary">
              View Full Process
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}