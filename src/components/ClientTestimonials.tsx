"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  commissioned: string;
}

export default function ClientTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={t.id || i} delay={(i % 4) * 50}>
            <div className="group relative h-full overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/50">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--accent)] opacity-[0.03] blur-[100px] transition-opacity duration-500 group-hover:opacity-[0.06]" />

              <div className="relative flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20">
                  {t.avatar ? (
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-lg font-bold text-white">
                      {t.name?.[0]?.toUpperCase() || "★"}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= t.rating
                              ? "fill-[var(--accent)] text-[var(--accent)]"
                              : "text-[var(--text-dim)]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[var(--text-dim)]">5.0 rated</span>
                  </div>

                  <p className="mt-2 text-xs font-medium text-[var(--accent)]">{t.commissioned}</p>
                </div>
              </div>

              <p className="relative mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                &quot;{t.text}&quot;
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-px w-8 bg-gradient-to-r from-[var(--accent)] to-transparent" />
                <span className="text-sm font-semibold text-white">— {t.name}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
