"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ClientReviewForm from "@/components/ClientReviewForm";
import { getApprovedReviews } from "@/lib/db";
import { Star } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)] animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-[var(--bg)]" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-[var(--bg)] rounded w-32" />
          <div className="h-3 bg-[var(--bg)] rounded w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[var(--bg)] rounded w-full" />
        <div className="h-3 bg-[var(--bg)] rounded w-5/6" />
        <div className="h-3 bg-[var(--bg)] rounded w-4/6" />
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      try {
        const reviews = await getApprovedReviews();
        setApprovedReviews(reviews);
      } catch (e) {
        console.error("Failed to load reviews:", e);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-16">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : approvedReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-16">
              {approvedReviews.map((review, i) => (
                <div key={review.id || i} className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)] relative overflow-hidden group hover:border-[var(--border-hover)] transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.02] blur-3xl rounded-full pointer-events-none group-hover:opacity-[0.05] transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">{review.avatar || "🎭"}</div>
                      <div>
                        <p className="font-bold text-white">{review.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-4 h-4 ${star <= (review.star_rating || 5) ? "text-[var(--accent)] fill-[var(--accent)]" : "text-[var(--text-dim)]"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.project && (
                      <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider mb-2">{review.project}</p>
                    )}
                    <p className="text-[var(--text-secondary)] leading-relaxed italic">"{review.text}"</p>
                    {review.image_url && (
                      <div className="mt-4">
                        <img src={review.image_url} alt="Review image" className="w-full h-48 object-cover rounded-xl border border-[var(--border)]" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-16 mb-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
                <div className="relative text-5xl">💬</div>
              </div>
              <p className="text-[var(--text-dim)] text-lg">
                Client reviews will appear here after commissions are completed.
              </p>
            </div>
          )}

          <div className="max-w-2xl mx-auto">
            <ClientReviewForm />
          </div>
        </div>
      </section>
    </div>
  );
}
