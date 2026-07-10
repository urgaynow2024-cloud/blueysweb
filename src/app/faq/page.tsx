"use client";

import SectionTitle from "@/components/SectionTitle";

export default function FAQPage() {
  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 page-head">
            <span className="section-label justify-center">FAQ</span>
            <h2 className="display-lg text-white mb-3">Common questions</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">Quick answers to things you might be wondering.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-2.5">
            {[
              { q: "What do I need to provide?", a: "What you want done, avatar base name, reference images, and any required assets provided." },
              { q: "How long does a commission take?", a: "Depends on the tier and complexity. Light work is faster, full overhauls take longer." },
              { q: "Do you work on Quest?", a: "Quest compatibility depends on the tier. Overhauls include Quest optimisation." },
              { q: "What payment methods?", a: "PayPal and Payhip only. 50% deposit before work begins." },
              { q: "Can I request NSFW work?", a: "Limited NSFW commissions are accepted case-by-case for 18+ clients." },
              { q: "What files do I get?", a: "Unity-ready VRChat avatar files. Blender source files on request." },
            ].map((item, i) => (
              <div
                key={item.q}
                className="border border-[var(--border)] rounded-xl p-5 md:p-6 hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]/50 transition-all duration-300 cursor-pointer group"
                style={{ animation: `fadeInUp 0.7s ${0.5 + i * 0.1}s ease both` }}
              >
                <h3 className="text-sm font-bold text-white group-hover:text-[var(--accent)] transition-colors mb-2">{item.q}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/contact" className="btn-primary">Commission Me</a>
          </div>
        </div>
      </section>
    </div>
  );
}
