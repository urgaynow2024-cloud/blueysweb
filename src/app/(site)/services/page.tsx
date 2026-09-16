"use client";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { Check, ArrowRight, MessageCircle, FileText, DollarSign, Pencil, Rocket, Settings2, ShieldCheck, Clock, Sparkles } from "lucide-react";

const SERVICES = [
  {
    icon: <Pencil className="h-5 w-5" />,
    emoji: "✦",
    title: "AVATARS",
    desc: "Custom avatar work — edits, overhauls, and full redesigns built around your vision.",
    includes: ["Avatar editing & customisation", "Clothing fitting & creation", "Hair swaps & styling", "Accessory & prop addition", "Material & shader setup", "Toggle & PhysBone setup", "Avatar optimisation"],
    excludes: ["Modelling from scratch (see Blender Work)", "Third-party asset creation", "Game development beyond VRChat"],
    price: "From £15 per project",
    process: ["Message me with your vision", "Receive a detailed quote", "50% deposit to start", "Progress updates", "Final delivery"],
  },
  {
    icon: <Rocket className="h-5 w-5" />,
    emoji: "✦",
    title: "TEXTURES",
    desc: "Custom textures, material edits, and colour work for existing avatar bases.",
    includes: ["Full texture recolours", "Pattern design & creation", "Material variants", "Custom texture painting", "Shader adjustments", "Property edits"],
    excludes: ["Complete avatar modelling", "Texture creation from photo references", "Real-time game engine integration"],
    price: "From £15 per project",
    process: ["Share your texture vision", "Receive quote & timeline", "Deposit payment", "Iterate on drafts", "Final delivery"],
  },
  {
    icon: <Settings2 className="h-5 w-5" />,
    emoji: "✦",
    title: "EDITS",
    desc: "Avatar modifications, optimisation, and Unity setup for performance and quality.",
    includes: ["Avatar optimisation", "Performance tuning", "Mesh cleanup", "Unity configuration", "VRChat packaging", "Quest compatibility"],
    excludes: ["Complete avatar redesign", "Custom asset modelling", "Platform development"],
    price: "From £30 per project",
    process: ["Describe your edit needs", "Get a quote", "50% deposit", "Work in progress", "Final optimised avatar"],
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

          {/* Service Blocks */}
          <div className="mt-16 space-y-6">
            {SERVICES.map((svc, i) => (
              <Reveal key={svc.title} delay={i * 80}>
                <div className="card overflow-hidden p-6 md:p-8">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-2xl transition-transform duration-300 hover:scale-110">
                          {svc.emoji}
                        </div>
                        <div>
                          <h3 className="heading-sm text-white">{svc.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-4">{svc.desc}</p>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">Starting from</p>
                        <p className="text-lg font-bold text-[var(--accent)]">{svc.price}</p>
                      </div>
                      <ButtonLink href="/commission" variant="primary" className="mt-4 w-full justify-center">
                        View Service
                        <ArrowRight className="h-4 w-4" />
                      </ButtonLink>
                    </div>
                    <div className="md:col-span-8">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                            Includes
                          </h4>
                          <ul className="space-y-2">
                            {svc.includes.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                                <span className="mt-1 h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
                          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                            <span className="h-3.5 w-3.5 inline-block border border-current rounded-sm" />
                            Not Included
                          </h4>
                          <ul className="space-y-2">
                            {svc.excludes.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-xs text-[var(--text-dim)]">
                                <span className="mt-1 h-1 w-1 rounded-full bg-rose-400 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">
                          <Clock className="h-3.5 w-3.5" />
                          Typical Process
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {svc.process.map((step, si) => (
                            <span key={step} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-[11px] text-[var(--text-secondary)]">
                              <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[8px] font-bold">{si + 1}</span>
                              {step}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Process */}
          <div className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
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
          </div>

          <div className="mt-16 text-center">
            <ButtonLink href="/pricing" variant="secondary">
              View Pricing
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <p className="mt-5 text-sm text-[var(--text-dim)]">
              Interested? DM me on Discord at <span className="font-medium text-white">{siteConfig.discord}</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
