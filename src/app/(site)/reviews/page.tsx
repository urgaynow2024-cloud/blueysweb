"use client";

import { useState, useEffect } from "react";
import ClientReviewForm from "@/components/ClientReviewForm";
import Reveal from "@/components/ui/Reveal";
import { getApprovedReviews } from "@/lib/db";
import { Star, Quote, MessageSquarePlus, Sparkles } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7">
      <div className="mb-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-[var(--bg)]" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-36 rounded bg-[var(--bg)]" />
          <div className="h-3 w-24 rounded bg-[var(--bg)]" />
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="h-3 w-full rounded bg-[var(--bg)]" />
        <div className="h-3 w-5/6 rounded bg-[var(--bg)]" />
        <div className="h-3 w-4/6 rounded bg-[var(--bg)]" />
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
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px] orb-slow" />

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <Quote className="h-3.5 w-3.5 text-[var(--accent)]" />
              Reviews
            </span>
            <h1 className="display-xl mt-5 text-white">
              ✦ Client <span className="text-gradient-animated">Reviews</span>
            </h1>
            <p className="lead mx-auto mt-4 max-w-xl">
              Real feedback from people I&rsquo;ve had the pleasure of working with.
            </p>
          </div>

          {loading ? (
            <div className="mx-auto mb-16 max-w-5xl grid grid-cols-1 gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : approvedReviews.length > 0 ? (
            <div className="mx-auto max-w-3xl">
              {approvedReviews.map((review, i) => (
                <Reveal key={review.id || i} delay={(i % 4) * 70}>
                  <div className="review-divider">
                    <div className="flex items-start gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-lg font-bold text-white">
                        {review.display_name?.[0]?.toUpperCase() || "★"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-white">{review.display_name}</p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${star <= (review.rating || 5) ? "text-[var(--accent)]" : "text-[var(--text-dim)]"}`}
                                style={{ fill: star <= (review.rating || 5) ? "currentColor" : "none" }}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                          &ldquo;{review.review_text}&rdquo;
                        </p>
                        {review.image_url && (
                          <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border)]">
                            <img src={review.image_url} alt="Commission preview" loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto mb-16 max-w-2xl">
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <MessageSquarePlus className="h-6 w-6" />
                </div>
                <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                  Client reviews will appear here after commissions are completed.
                </p>
              </div>
            </div>
          )}

          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center gap-3 text-[var(--text-secondary)]">
              <MessageSquarePlus className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="heading-md text-white">Leave your own review</h2>
            </div>
            <div className="py-8">
              <ClientReviewForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
