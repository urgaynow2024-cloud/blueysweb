"use client";

import Link from "next/link";

export default function QueuePage() {
  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-[var(--accent)] opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14 page-head">
            <span className="section-label justify-center">Queue</span>
            <h2 className="display-lg text-white mb-3">Commission Queue</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">Current availability and status</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="glass rounded-2xl p-8 text-center border border-[var(--border)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent group-hover:from-green-500/10 transition-all" />
              <div className="relative">
                <div className="text-4xl font-bold text-white mb-2">Open</div>
                <p className="text-sm text-[var(--text-secondary)]">I&rsquo;m currently accepting commissions for all tiers.</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-8 text-center border border-[var(--border)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent group-hover:from-[var(--accent)]/10 transition-all" />
              <div className="relative">
                <div className="text-4xl font-bold text-white mb-2">All Tiers</div>
                <p className="text-sm text-[var(--text-secondary)]">Light, Custom, and Overhaul commissions available.</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-7 mb-6 border border-[var(--border)]">
            <h2 className="text-base font-bold text-white mb-4">Queue Notes</h2>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              {[
                "Estimated dates are guidelines — actual completion may vary based on complexity",
                "Deposit must be paid to secure a slot",
                "I&rsquo;ll notify you if there are any significant changes to your ETA",
                "You can check in at any time for status updates on Discord",
              ].map((note) => (
                <li key={note} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <Link href="/contact" className="btn-primary">Start a Commission →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
