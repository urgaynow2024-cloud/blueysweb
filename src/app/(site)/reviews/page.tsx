"use client";

import { useState, useEffect } from "react";
import ClientReviewForm from "@/components/ClientReviewForm";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { getApprovedReviews } from "@/lib/db";
import { Star, Quote, MessageSquarePlus } from "lucide-react";

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
      <section className="page relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[130px]" />

        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Reviews"
            title="Client Reviews"
            subtitle="Real feedback from people I've had the pleasure of working with."
          />

          {loading ? (
            <div className="mx-auto mb-16 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : approvedReviews.length > 0 ? (
            <div className="mx-auto mb-16 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
              {approvedReviews.map((review, i) => (
                <Reveal key={review.id || i} delay={(i % 4) * 70}>
                  <article className="group relative h-full overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)] md:p-8">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--accent)] opacity-[0.03] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.07]" />
                    <Quote className="relative mb-4 h-7 w-7 text-[var(--accent)]/30" />
                    <div className="relative flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-lg font-bold text-white">
                        {review.display_name?.[0]?.toUpperCase() || "★"}
                      </div>
                      <div>
                        <p className="font-bold text-white">{review.display_name}</p>
                        <div className="mt-1 flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${star <= (review.rating || 5) ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--text-dim)]"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="relative mt-5 leading-relaxed text-[var(--text-secondary)]">"{review.review_text}"</p>
                    {review.image_url && (
                      <div className="relative mt-5 overflow-hidden rounded-xl border border-[var(--border)]">
                        <img src={review.image_url} alt="Commission preview" loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                      </div>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto mb-16 max-w-2xl rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <MessageSquarePlus className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
                Client reviews will appear here after commissions are completed.
              </p>
            </div>
          )}

          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex items-center gap-3 text-[var(--text-secondary)]">
              <MessageSquarePlus className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="heading-md text-white">Leave your own review</h2>
            </div>
            <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)]/60 p-1">
              <ClientReviewForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
