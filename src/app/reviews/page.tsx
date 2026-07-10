"use client";

import { reviews } from "@/data/site";

export default function ReviewsPage() {
  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 page-head">
            <span className="section-label justify-center">Reviews</span>
            <h2 className="display-lg text-white mb-3">Client Reviews</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">What clients say about their commission experience.</p>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {reviews.map((review, i) => (
                <div key={i} className="glass rounded-2xl p-6 md:p-8 border border-[var(--border)] relative overflow-hidden group hover:border-[var(--border-hover)] transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.02] blur-3xl rounded-full pointer-events-none group-hover:opacity-[0.05] transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">{review.avatar}</div>
                      <div>
                        <p className="font-bold text-white">{review.name}</p>
                        <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider">{review.project}</p>
                      </div>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed italic">"{review.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
                <div className="relative text-5xl">💬</div>
              </div>
              <p className="text-[var(--text-dim)] text-lg mb-6">
                Client reviews will appear here after commissions are completed.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
