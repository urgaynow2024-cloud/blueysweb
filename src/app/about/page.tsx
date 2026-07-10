"use client";

import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";

export default function AboutPage() {
  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[var(--accent-3)] opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label">About</span>
              <div className="heading-md text-white mb-6">
                The person behind the work
              </div>
              <div className="space-y-5 text-[var(--text-secondary)] leading-relaxed">
                <p>
                  I&rsquo;m Bluey, a VRChat avatar creator with around 2 years of experience working with Unity and Blender.
                </p>
                <p>
                  I specialise in avatar edits, customisation, optimisation, accessories, clothing fitting, and making avatars feel unique while staying comfortable for everyday VRChat use.
                </p>
              </div>
              <div className="mt-8 pt-7 border-t border-[var(--border)]">
                <h3 className="text-sm font-bold text-white mb-4">Services</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { emoji: "✏️", title: "Avatar Edits", desc: "Texture recolours, accessory additions, clothing fitting, hair combinations." },
                    { emoji: "🔧", title: "Blender Work", desc: "Asset creation, retopology, UV work, material setup, mesh adjustments." },
                    { emoji: "⚙️", title: "Unity Setup", desc: "Material configuration, toggles, optimisation, viseme setup, VRChat packaging." },
                  ].map((svc) => (
                    <div key={svc.title} className="flex gap-4 group">
                      <div className="text-xl mt-0.5 group-hover:scale-110 transition-transform">{svc.emoji}</div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{svc.title}</h4>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{svc.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-7 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--text-dim)]">
                  Discord: <span className="text-white font-medium">BlueyBarks</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: "✨", stat: "£15+", label: "Starting price" },
                { emoji: "⏱", stat: "2yrs", label: "Experience" },
                { emoji: "🎮", stat: "VRChat", label: "Platform" },
                { emoji: "💬", stat: "24h", label: "Response" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-2xl p-5 text-center border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-500 group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{stat.emoji}</div>
                  <div className="text-xl font-bold text-white mb-1">{stat.stat}</div>
                  <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
