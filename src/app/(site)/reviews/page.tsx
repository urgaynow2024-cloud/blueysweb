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

function Stars({ rating, size = "h-4 w-4" }: { rating?: number; size?: string }) {
  const value = rating || 5;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= value ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--text-dim)]"}`} />
      ))}
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

  const featured = approvedReviews[0];
  const supporting = approvedReviews.slice(1);

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
            <>
              {/* Featured Review */}
              {featured && (
                <Reveal>
                  <div className="relative mx-auto mb-10 max-w-3xl overflow-hidden rounded-[var(--r-xl)] border border-[var(--border-accent)] bg-[var(--bg-card)] p-8 md:p-10">
                    <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[80px]" />
                    <div className="flex items-center gap-1 mb-4">
                      <Stars rating={featured.rating} size="h-5 w-5" />
                    </div>
                    <Quote className="h-8 w-8 text-[var(--accent)] opacity-30 mb-4" />
                    <p className="text-lg leading-relaxed text-white mb-6">&ldquo;{featured.review_text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/30 to-[var(--accent-2)]/30 text-lg font-bold text-white">
                        {featured.display_name?.[0]?.toUpperCase() || "★"}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{featured.display_name}</p>
                        <p className="text-xs text-[var(--text-dim)]">Verified Client</p>
                      </div>
                    </div>
                    {featured.image_url && (
                      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)]">
                        <img src={featured.image_url} alt="Commission preview" loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" onError={(e) => { e.currentTarget.src = "https://picsum.photos/id/1000/800/450"; e.currentTarget.alt = "Image failed to load - placeholder shown"; }} />
                      </div>
                    )}
                  </div>
                </Reveal>
              )}

              {/* Supporting Reviews */}
              {supporting.length > 0 && (
                <div className="mx-auto max-w-4xl">
                  <div className="mb-6 flex items-center gap-3 text-[var(--text-secondary)]">
                    <MessageSquarePlus className="h-5 w-5 text-[var(--accent)]" />
                    <h2 className="heading-md text-white">More Reviews</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {supporting.map((review, i) => (
                      <Reveal key={review.id || i} delay={i * 60}>
                        <div className="review-divider border-b border-[var(--border)] p-6 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-sm font-bold text-white">
                              {review.display_name?.[0]?.toUpperCase() || "★"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{review.display_name}</p>
                              <Stars rating={review.rating} size="h-3 w-3" />
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                            &ldquo;{review.review_text}&rdquo;
                          </p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </>
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
