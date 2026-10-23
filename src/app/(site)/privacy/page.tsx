"use client";

import { ShieldCheck, FileText, Clock, Cookie } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function PrivacyPage() {
  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px] orb-slow" />

        <div className="container max-w-3xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              Privacy Policy
            </span>
            <h1 className="display-xl mt-5 text-white">Privacy Policy</h1>
            <p className="lead mx-auto mt-4">
              Your privacy matters. This policy explains how Bluey collects, uses, and protects your information.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-[var(--text-dim)]">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Last Updated: August 2025
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="!pt-12">
        <div className="container max-w-3xl space-y-10">
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-bold text-[var(--accent)] tabular-nums">01</span>
              <h2 className="text-xl md:text-2xl font-bold text-white">Information We Collect</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We collect information you provide directly to us, such as your name, Discord username, email address, and commission details when you submit a commission request or contact form.
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-bold text-[var(--accent)] tabular-nums">02</span>
              <h2 className="text-xl md:text-2xl font-bold text-white">How We Use Your Information</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We use your information to process commission requests, communicate about your project, and deliver completed work. We never sell or share your personal information with third parties.
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-bold text-[var(--accent)] tabular-nums">03</span>
              <h2 className="text-xl md:text-2xl font-bold text-white">Commission Data</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Commission submissions are stored to track project progress and communicate with you. Reference images and project details are kept confidential and only shared with the commissioning artist (Bluey).
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-bold text-[var(--accent)] tabular-nums">04</span>
              <h2 className="text-xl md:text-2xl font-bold text-white">Cookies & Tracking</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              This site uses minimal cookies essential for functionality. No third-party tracking scripts are used.
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-bold text-[var(--accent)] tabular-nums">05</span>
              <h2 className="text-xl md:text-2xl font-bold text-white">Your Rights</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              You can request a copy of any personal data we hold about you, or request deletion of your data at any time by contacting us on Discord at <span className="font-medium text-white">{siteConfig.discord}</span>.
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm font-bold text-[var(--accent)] tabular-nums">06</span>
              <h2 className="text-xl md:text-2xl font-bold text-white">Contact</h2>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
              <div className="flex items-start gap-3">
                <Cookie className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  For privacy questions or requests, reach out via Discord at <strong className="text-white">{siteConfig.discord}</strong> or use the <a href="/contact" className="text-[var(--accent)] hover:underline">contact form</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
