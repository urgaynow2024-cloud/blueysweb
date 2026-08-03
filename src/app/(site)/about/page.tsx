"use client";

import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
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
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[var(--accent-3)] opacity-[0.04] blur-[120px]" />

        <div className="container">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="About" title="The person behind the work" subtitle="A little about me, and how I approach every commission." />

              <div className="space-y-5 leading-relaxed text-[var(--text-secondary)]">
                <p>
                  I&rsquo;m Bluey, a VRChat avatar creator with around 2 years of experience working with Unity and Blender.
                </p>
                <p>
                  I specialise in avatar edits, customisation, optimisation, accessories, clothing fitting, and making avatars feel unique while staying comfortable for everyday VRChat use.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {SERVICES.map((svc, i) => (
                  <Reveal key={svc.title} delay={i * 70}>
                    <div className="group flex gap-4 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--border-hover)]">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl transition-transform duration-300 group-hover:scale-110">
                        {svc.emoji}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{svc.title}</h4>
                        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{svc.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
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

            <div className="grid grid-cols-2 gap-3">
              {STATS.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 70}>
                  <div className="group h-full rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)]">
                    <div className="mb-2 text-2xl transition-transform duration-300 group-hover:scale-110">{stat.emoji}</div>
                    <div className="text-xl font-bold text-white">{stat.stat}</div>
                    <div className="text-xs uppercase tracking-wider text-[var(--text-dim)]">{stat.label}</div>
                  </div>
                </Reveal>
              ))}

              <Reveal delay={120} className="col-span-2">
                <div className="flex items-center gap-3 rounded-[var(--r-md)] border border-[var(--border)] bg-gradient-to-br from-[var(--accent-soft)] to-transparent p-5">
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
