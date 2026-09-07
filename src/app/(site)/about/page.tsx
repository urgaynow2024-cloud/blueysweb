"use client";

import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { PremiumCard } from "@/components/ui/Card";
import { Sparkles, Hammer, Boxes, ArrowRight, Heart } from "lucide-react";

const SERVICES = [
  { emoji: "✏️", title: "Avatar Edits", desc: "Texture recolours, accessory additions, clothing fitting, hair combinations." },
  { emoji: "🔧", title: "Blender Work", desc: "Asset creation, retopology, UV work, material setup, mesh adjustments." },
  { emoji: "⚙️", title: "Unity Setup", desc: "Material configuration, toggles, optimisation, viseme setup, VRChat packaging." },
];

const STATS = [
  { emoji: "✨", stat: "£15+", label: "Starting price" },
  { emoji: "⏱", stat: "~2 yrs", label: "Experience" },
  { emoji: "🎮", stat: "VRChat", label: "Platform" },
  { emoji: "💬", stat: "24–48h", label: "Typical reply" },
];

export default function AboutPage() {
  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[var(--accent-3)] opacity-[0.04] blur-[120px] orb-slow" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[var(--accent-cosmic)] opacity-[0.04] blur-[110px] orb-med" />

        <div className="container">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <SectionHeading eyebrow="About" title="The person behind the work" subtitle="A little about me, and how I approach every commission." />

              <div className="mt-8 space-y-6 leading-relaxed text-[var(--text-secondary)]">
                <p className="text-base">
                  I&rsquo;m Bluey, a VRChat avatar creator with around 2 years of experience working with Unity and Blender.
                </p>
                <p className="text-base">
                  I specialise in avatar edits, customisation, optimisation, accessories, clothing fitting, and making avatars feel unique while staying comfortable for everyday VRChat use.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3">
                {SERVICES.map((svc, i) => (
                  <Reveal key={svc.title} delay={i * 80}>
                    <div className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-white/[0.02] p-5 transition-all duration-500 hover:border-[var(--border-hover)] hover:bg-white/[0.04]">
                      <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl transition-transform duration-300 group-hover:scale-110">
                        {svc.emoji}
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
                Discord: <span className="font-medium text-white">BlueyBarks</span>
              </div>

              <div className="mt-8">
                <ButtonLink href="/contact" variant="secondary">
                  Work with me
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-3">
                {STATS.map((stat, i) => (
                  <Reveal key={stat.label} delay={i * 70}>
                    <div className="group flex h-full flex-col justify-between rounded-2xl border border-[var(--border)] bg-white/[0.02] p-6 transition-all duration-500 hover:border-[var(--border-hover)] hover:bg-white/[0.04]">
                      <div className="text-2xl transition-transform duration-300 group-hover:scale-110">{stat.emoji}</div>
                      <div>
                        <div className="text-xl font-bold text-white">{stat.stat}</div>
                        <div className="text-xs uppercase tracking-wider text-[var(--text-dim)]">{stat.label}</div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={120} className="mt-3">
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-soft)] to-transparent p-5">
                  <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    Every avatar is built with care, performance, and your vision in mind.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
