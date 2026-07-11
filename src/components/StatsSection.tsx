"use client";

import { useState, useEffect, useRef } from "react";

interface Stat {
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
}

const stats: Stat[] = [
  { value: "150", label: "Completed Commissions", suffix: "+" },
  { value: "120", label: "Happy Clients", suffix: "+" },
  { value: "40", label: "Returning Clients", suffix: "+" },
  { value: "4.9", label: "Average Rating", suffix: "/5" },
  { value: "2", label: "Years Experience", suffix: "+" },
  { value: "1", label: "Avg Response Time", suffix: "-3 hrs" },
  { value: "5", label: "Avg Delivery Time", suffix: "-10 days" },
];

function AnimatedCounter({ value, suffix, prefix }: { value: string; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const target = parseFloat(value);
          const duration = 2000;
          const steps = 60;
          const stepTime = duration / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += target / steps;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(current);
            }
          }, stepTime);

          observer.disconnect();
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  const displayValue = value.includes(".") ? count.toFixed(1) : Math.floor(count);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-white">
      {prefix}{displayValue}{suffix}
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="section section-alt">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <span className="section-label justify-center">Trust & Experience</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">By the numbers</h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Real work, real clients, real results.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)] text-center hover:border-[var(--border-hover)] transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
            >
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
              />
              <p className="text-sm text-[var(--text-secondary)] mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-white mb-4">Tools & Platforms</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-secondary)]">Blender</span>
                  <span className="text-white font-semibold">2+ Years</span>
                </div>
                <div className="w-full bg-[var(--bg)] rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-secondary)]">Unity</span>
                  <span className="text-white font-semibold">2+ Years</span>
                </div>
                <div className="w-full bg-[var(--bg)] rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-[var(--text-dim)] mb-2">Platforms Supported</p>
                <div className="flex flex-wrap gap-2">
                  {["PC", "Quest", "PC + Quest", "VRChat SDK"].map((platform) => (
                    <span key={platform} className="px-3 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-white mb-4">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Avatar Editing",
                "Blender Work",
                "Unity Setup",
                "PhysBones",
                "Toggles",
                "Clothing Fitting",
                "Optimization",
                "Texture Editing",
                "Accessories",
                "Performance",
              ].map((spec) => (
                <span key={spec} className="px-3 py-1.5 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-xs text-[var(--accent)] font-medium">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
