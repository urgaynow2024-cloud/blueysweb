"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Check, ArrowRight, Pencil, Wrench, Settings2 } from "lucide-react";

const SERVICES = [
  {
    icon: <Pencil className="h-5 w-5" />,
    title: "Avatar Edits",
    desc: "Texture recolours, accessory additions, clothing fitting, hair combinations, and minor geometry tweaks to existing bases.",
    features: ["Texture recolours", "Accessory additions", "Clothing fitting", "Hair combinations", "Minor fixes"],
  },
  {
    icon: <Wrench className="h-5 w-5" />,
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
  { emoji: "💬", title: "Enquiry", desc: "Message me on Discord with what you're looking for, your avatar base, and any references." },
  { emoji: "📋", title: "Quote", desc: "I'll let you know the price and how long it'll take." },
  { emoji: "💳", title: "Deposit", desc: "50% deposit before I start work." },
  { emoji: "🎨", title: "Work", desc: "I'll send progress updates and previews as I go." },
  { emoji: "📦", title: "Delivery", desc: "Final files sent once the remaining payment is done." },
];

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
            subtitle="I work on VRChat avatars in a few different ways. Here's what I can help with."
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SERVICES.map((svc, i) => (
              <Reveal key={svc.title} delay={i * 80}>
                <div className="group h-full rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--border-hover)]">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                    {svc.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white">{svc.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">{svc.desc}</p>
                  <ul className="space-y-2.5">
                    {svc.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Check className="h-3 w-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="my-16">
            <div className="divider" />
          </div>

          <SectionHeading eyebrow="Process" title="How it Works" subtitle="From enquiry to delivery in five simple steps." />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {WORKFLOW.map((step, i) => (
              <Reveal key={step.title} delay={(i % 5) * 60}>
                <div className="group h-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)]">
                  <div className="mb-3 text-2xl transition-transform duration-300 group-hover:scale-110">{step.emoji}</div>
                  <h3 className="mb-1.5 text-sm font-bold text-white">{step.title}</h3>
                  <p className="text-xs leading-relaxed text-[var(--text-dim)]">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 text-center">
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
