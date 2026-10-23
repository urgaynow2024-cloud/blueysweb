"use client";

import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { about, workflowSteps } from "@/config/site";
import { Sparkles, ArrowRight, Heart, Layers, PenTool, ShieldCheck, Clock, MessageSquare, Zap } from "lucide-react";

const SERVICES = [
  { icon: PenTool, title: "Avatar Edits", desc: "Texture recolours, accessory additions, clothing fitting, hair combinations." },
  { icon: Layers, title: "Blender Work", desc: "Asset creation, retopology, UV work, material setup, mesh adjustments." },
  { icon: ShieldCheck, title: "Unity Setup", desc: "Material configuration, toggles, optimisation, viseme setup, VRChat packaging." },
];

const STATS = [
  { stat: "£15+", label: "Starting price" },
  { stat: "~2 yrs", label: "Experience" },
  { stat: "VRChat", label: "Platform" },
  { stat: "24–48h", label: "Typical reply" },
];

export default function AboutPage() {
  return (
    <div className="relative">
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="About"
            title="The Person Behind the Work"
            subtitle="A little about me, and how I approach every commission."
          />

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <div className="mt-8 space-y-6 leading-relaxed text-[var(--text-secondary)]">
                <p className="text-base">
                  I&rsquo;m Bluey, a VRChat avatar creator with around 2 years of experience working with Unity and Blender.
                </p>
                <p className="text-base">
                  I specialise in avatar edits, customisation, optimisation, accessories, clothing fitting, and making avatars feel unique while staying comfortable for everyday VRChat use.
                </p>
              </div>

              <div className="mt-10 space-y-4">
                {SERVICES.map((svc, i) => (
                  <Reveal key={svc.title} delay={i * 80}>
                    <div className="group flex items-start gap-4 py-3">
                      <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl transition-transform duration-300 group-hover:scale-110">
                        <svc.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{svc.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{svc.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                <Heart className="h-4 w-4 text-[var(--accent)]" />
                Discord: <span className="font-medium text-white">{siteConfig.discord}</span>
              </div>

              <div className="mt-8">
                <Link href="/commission" className="btn-secondary inline-flex items-center gap-2">
                  Work with me
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="border-b border-[var(--border)] pb-8 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                  {STATS.map((stat, i) => (
                    <div key={stat.label} className="flex flex-col items-center gap-1">
                      {i > 0 && (
                        <span className="w-px h-8 bg-gradient-to-b from-transparent via-[var(--border)] to-transparent hidden md:block" />
                      )}
                      <span className="text-2xl font-bold text-white">{stat.stat}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Reveal delay={120}>
                <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <div className="flex items-start gap-4">
                    <Sparkles className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      Every avatar is built with care, performance, and your vision in mind. I don't use templates or shortcuts — each commission gets the attention it deserves.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <h3 className="heading-sm text-white mt-12 mb-6">Process Overview</h3>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                  {workflowSteps.map((step, i) => (
                    <Reveal key={step.title} delay={i * 60}>
                      <div className="group relative text-center">
                        <div className="relative z-10 mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-2xl transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-[var(--accent)]/50 group-hover:bg-[var(--accent-soft)]">
                          {step.emoji}
                          <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[10px] font-bold text-[#04060a]">
                            {i + 1}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{step.title}</h4>
                        <p className="mt-1.5 px-1 text-[11px] leading-relaxed text-[var(--text-dim)]">{step.desc}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}