"use client";

import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import React from "react";

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
              <div>
                <span className="eyebrow">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                  About
                </span>
                <h1 className="display-xl mt-4 text-white">The person behind the work</h1>
                <p className="lead mt-3">A little about me, and how I approach every commission.</p>
              </div>

              <div className="mt-8 space-y-6 leading-relaxed text-[var(--text-secondary)]">
                <p className="text-base">
                  I&rsquo;m Bluey, a VRChat avatar creator with around 2 years of experience working with Unity and Blender.
                </p>
                <p className="text-base">
                  I specialise in avatar edits, customisation, optimisation, accessories, clothing fitting, and making avatars feel unique while staying comfortable for everyday VRChat use.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                {SERVICES.map((svc, i) => (
                  <Reveal key={svc.title} delay={i * 80}>
                    <div className="group flex items-start gap-4 py-3">
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
              <div className="border-b border-[var(--border)] pb-8 mb-8">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-center">
                  {STATS.map((stat, i) => (
                    <React.Fragment key={stat.label}>
                      {i > 0 && <span className="stat-row-separator hidden sm:inline-block" />}
                      <div className="stat-row-item">
                        <span className="text-lg">{stat.emoji}</span>
                        <span className="stat-row-value">{stat.stat}</span>
                        <span className="stat-row-label">{stat.label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <Reveal delay={120}>
                <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-soft)] to-transparent p-6">
                  <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
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
