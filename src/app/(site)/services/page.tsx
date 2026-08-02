"use client";

import { servicesDetailed, workflowSteps } from "@/data/site";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Check, ArrowRight, Wrench, Settings2, Box, Shirt, Palette, Zap } from "lucide-react";
import Link from "next/link";

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "VRChat Avatar Editing": <Wrench className="h-5 w-5" />,
  "FBX Mashups & Custom Edits": <Box className="h-5 w-5" />,
  "Clothing & Outfit Creation": <Shirt className="h-5 w-5" />,
  "Texture Work & Materials": <Palette className="h-5 w-5" />,
  "Avatar Optimisation": <Zap className="h-5 w-5" />,
};

export default function ServicesPage() {
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
            subtitle="I work on VRChat avatars in a few different ways — from subtle edits to complete overhauls, including FBX mashups and optimisation."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {servicesDetailed.map((svc, i) => (
              <Reveal key={svc.title} delay={i * 60}>
                <div className="group h-full rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--border-hover)]">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                    {SERVICE_ICONS[svc.title] || <Check className="h-5 w-5" />}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white">{svc.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">{svc.desc}</p>
                  <ul className="space-y-2.5">
                    {svc.features.map((f) => (
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

          <div className="my-16">
            <div className="divider" />
          </div>

          {/* Commission Process section */}
          <SectionHeading
            align="center"
            eyebrow="Process"
            title="How it Works"
            subtitle="From enquiry to delivery in five simple steps."
          />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {workflowSteps.map((step, i) => (
              <Reveal key={step.title} delay={(i % 5) * 60}>
                <div className="group h-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)]">
                  <div className="mb-3 text-2xl transition-transform duration-300 group-hover:scale-110">{step.emoji}</div>
                  <h3 className="mb-1.5 text-sm font-bold text-white">{step.title}</h3>
                  <p className="px-1 text-xs leading-relaxed text-[var(--text-dim)]">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

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
