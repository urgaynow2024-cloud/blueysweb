"use client";

import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Check, ArrowRight, MessageCircle, FileText, DollarSign, Pencil, Rocket, Clock, Sparkles, Settings2 } from "lucide-react";

const SERVICES = [
  {
    icon: <Pencil className="h-5 w-5" />,
    title: "Avatar Edits",
    desc: "Texture recolours, accessory additions, clothing fitting, hair combinations, and minor geometry tweaks to existing bases.",
    features: ["Texture recolours", "Accessory additions", "Clothing fitting", "Hair combinations", "Minor fixes"],
  },
  {
    icon: <Rocket className="h-5 w-5" />,
    title: "Blender Work",
    desc: "Asset creation, retopology, UV work, material setup, and mesh adjustments for clean avatar bases.",
    features: ["Asset creation", "Retopology", "UV & material work", "Mesh adjustments", "Clean topology"],
  },
  {
    icon: <Settings2 className="h-5 w-5" />,
    title: "Unity Setup",
    desc: "Material configuration, toggles, optimisation, viseme setup, and VRChat-ready packaging.",
    features: ["Material config", "Toggle systems", "Performance tuning", "Viseme setup", "VRChat packaging"],
  },
];

const WORKFLOW = [
  { icon: MessageCircle, title: "Enquiry", desc: "Message me on Discord with what you're looking for, your avatar base, and any references." },
  { icon: FileText, title: "Quote", desc: "I'll let you know the price and how long it'll take." },
  { icon: DollarSign, title: "Deposit", desc: "50% deposit before I start work." },
  { icon: Pencil, title: "Work", desc: "I'll send progress updates and previews as I go." },
  { icon: Rocket, title: "Delivery", desc: "Final files sent once the remaining payment is done." },
];

export default function ServicesPage() {
  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[130px] orb-slow" />

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              Services
            </span>
            <h1 className="display-xl mt-5 text-white">
              ✦ What I <span className="text-gradient-animated">provide</span>
            </h1>
            <p className="lead mx-auto mt-4 max-w-xl">
              I work on VRChat avatars in a few different ways. Here&rsquo;s what I can help with.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-3xl">
            {SERVICES.map((svc, i) => (
              <Reveal key={svc.title} delay={i * 80}>
                <div className="group py-8 md:py-10">
                  <div className="flex items-start gap-5">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                      {svc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white">{svc.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{svc.desc}</p>
                      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                        {svc.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {i < SERVICES.length - 1 && (
                    <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mx-auto mt-20 max-w-3xl text-center">
            <span className="section-eyebrow justify-center">
              <Clock className="h-4 w-4 text-[var(--accent)]" />
              Process
            </span>
            <h2 className="display-lg mt-4 text-white">How it Works</h2>
            <p className="lead mx-auto mt-3 max-w-xl">From enquiry to delivery in five simple steps.</p>
          </div>

          <div className="relative mt-12 grid grid-cols-2 gap-6 md:grid-cols-5">
            {WORKFLOW.map((step, i) => (
              <Reveal key={step.title} delay={(i % 5) * 60}>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-muted)]">
                    Step {i + 1}
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold text-white">{step.title}</h3>
                  <p className="px-2 text-xs leading-relaxed text-[var(--text-secondary)]">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 text-center">
            <ButtonLink href="/pricing" variant="secondary">
              View Pricing
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <p className="mt-5 text-sm text-[var(--text-dim)]">
              Interested? DM me on Discord at <span className="font-medium text-white">BlueyBarks</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
