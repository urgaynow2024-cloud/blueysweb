"use client";

import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";

export default function ServicesPage() {
  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-80 bg-[var(--accent)] opacity-[0.05] blur-[130px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14 page-head">
            <span className="section-label justify-center">Services</span>
            <h2 className="display-lg text-white mb-3">What I provide</h2>
            <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
              I work on VRChat avatars in a few different ways. Here&rsquo;s what I can help with.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
            {[
              { emoji: "✏️", title: "Avatar Edits", desc: "Texture recolours, accessory additions, clothing fitting, hair combinations, and minor geometry tweaks to existing bases.", features: ["Texture recolours", "Accessory additions", "Clothing fitting", "Hair combinations", "Minor fixes"] },
              { emoji: "🔧", title: "Blender Work", desc: "Asset creation, retopology, UV work, material setup, and mesh adjustments for clean avatar bases.", features: ["Asset creation", "Retopology", "UV & material work", "Mesh adjustments", "Clean topology"] },
              { emoji: "⚙️", title: "Unity Setup", desc: "Material configuration, toggles, optimisation, viseme setup, and VRChat-ready packaging.", features: ["Material config", "Toggle systems", "Performance tuning", "Viseme setup", "VRChat packaging"] },
            ].map((svc, i) => (
              <div
                key={svc.title}
                className="glass rounded-2xl p-7 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-500 group"
              >
                <div className="text-3xl mb-5 group-hover:scale-110 transition-transform duration-300">{svc.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{svc.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                  {svc.desc}
                </p>
                <ul className="space-y-2.5">
                  {svc.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="divider mb-20" />

          <div className="mb-10">
            <span className="section-label">Process</span>
            <h2 className="display-lg text-white mb-2">How it Works</h2>
            <p className="text-[var(--text-secondary)] mt-2">From enquiry to delivery in five simple steps.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {[
              { emoji: "💬", title: "Enquiry", desc: "Message me on Discord with what you're looking for, your avatar base, and any references." },
              { emoji: "📋", title: "Quote", desc: "I'll let you know the price and how long it'll take." },
              { emoji: "💳", title: "Deposit", desc: "50% deposit before I start work." },
              { emoji: "🎨", title: "Work", desc: "I'll send progress updates and previews as I go." },
              { emoji: "📦", title: "Delivery", desc: "Final files sent once the remaining payment is done." },
            ].map((step, i) => (
              <div
                key={step.title}
                className="group glass rounded-2xl p-5 text-center border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-500"
              >
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {step.emoji}
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/pricing" className="btn-secondary mb-3 inline-flex">
              View Pricing
            </Link>
            <p className="text-sm text-[var(--text-dim)] mt-5">
              Interested? DM me on Discord at <span className="text-white font-medium">BlueyBarks</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
