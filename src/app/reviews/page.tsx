"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ClientReviewForm from "@/components/ClientReviewForm";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (!isSupabaseConfigured || !supabase) {
          const stored = localStorage.getItem("adminData");
          if (stored) {
            try {
              const data = JSON.parse(stored);
              if (data.reviews && data.reviews.length > 0) setReviews(data.reviews);
            } catch (e) {}
          }
          setLoading(false);
          return;
        }
        const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) setReviews(data);
      } catch (e) {
        console.error("Failed to load reviews:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
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
            <div className="text-center py-16 text-[var(--text-dim)]">Loading...</div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-16">
              {reviews.map((review, i) => (
                <div key={review.id || i} className="glass rounded-2xl p-6 md:p-8 border border-[var(--border)] relative overflow-hidden group hover:border-[var(--border-hover)] transition-all duration-500">
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
