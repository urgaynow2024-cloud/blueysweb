"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  driftDuration: number;
  driftDelay: number;
  twinkleDuration: number;
  twinkleDelay: number;
  driftXAmplitude: number;
  driftYAmplitude: number;
  color: string;
  rotation: number;
  twinklePhase: number;
  kind: "bone" | "star";
};

const DOG_BONE_PATH =
  "M12.8 3.6c1.4 0.6 2.3 1.9 2.3 3.5 0 0.3 0 0.6-0.1 0.9 1.2 1 2 2.5 2 4.1 0 1.7-0.9 3.3-2.3 4.1 0.1 0.3 0.1 0.6 0.1 0.9 0 1.6-0.9 2.9-2.3 3.5-1.4-0.6-2.3-1.9-2.3-3.5 0-0.3 0-0.6 0.1-0.9-1.2-1-2-2.5-2-4.1 0-1.7 0.9-3.3 2.3-4.1-0.1-0.3-0.1-0.6-0.1-0.9 0-1.6 0.9-2.9 2.3-3.5zM8.8 6.6c-0.8 0.7-1.3 1.7-1.3 2.9 0 0.1 0 0.2 0 0.3-0.6-0.5-1-1.3-1-2.2 0-0.8 0.4-1.5 1-2 0 0.1 0.3 0 0.3 0zM15.2 6.6c0.8 0.7 1.3 1.7 1.3 2.9 0 0.1 0 0.2 0 0.3 0.6-0.5 1-1.3 1-2.2 0-0.8-0.4-1.5-1-2 0 0.1-0.3 0-0.3 0zM10.2 11c-0.2-0.2-0.3-0.5-0.3-0.8 0-0.4 0.2-0.8 0.6-1 0.5 0.2 0.8 0.6 0.8 1 0 0.3-0.1 0.6-0.3 0.8h-0.8zM13.8 11c-0.2-0.2-0.3-0.5-0.3-0.8 0-0.4 0.2-0.8 0.6-1 0.5 0.2 0.8 0.6 0.8 1 0 0.3-0.1 0.6-0.3 0.8h-0.8z";

const COLORS = [
  "rgba(255,255,255,0.8)",
  "rgba(96,165,250,0.75)",
  "rgba(167,139,250,0.7)",
  "rgba(124,58,237,0.65)",
  "rgba(255,255,255,0.6)",
  "rgba(90,176,240,0.7)",
  "rgba(255,255,255,0.9)",
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  const boneCount = Math.max(4, Math.floor(count * 0.35));
  const starCount = count - boneCount;
  for (let i = 0; i < boneCount; i++) {
    particles.push({
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: randomBetween(14, 28),
      driftDuration: randomBetween(20, 40) * 1000,
      driftDelay: Math.random() * -40000,
      twinkleDuration: randomBetween(2, 5) * 1000,
      twinkleDelay: Math.random() * -5000,
      driftXAmplitude: randomBetween(15, 40),
      driftYAmplitude: randomBetween(15, 40),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: randomBetween(0, 360),
      twinklePhase: Math.random() * Math.PI * 2,
      kind: "bone",
    });
  }
  for (let i = 0; i < starCount; i++) {
    particles.push({
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: randomBetween(2, 5),
      driftDuration: randomBetween(30, 60) * 1000,
      driftDelay: Math.random() * -60000,
      twinkleDuration: randomBetween(1.5, 4) * 1000,
      twinkleDelay: Math.random() * -4000,
      driftXAmplitude: randomBetween(8, 20),
      driftYAmplitude: randomBetween(8, 20),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: 0,
      twinklePhase: Math.random() * Math.PI * 2,
      kind: "star",
    });
  }
  return particles;
}

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export default function SpaceParticles({ count }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  const desktopCount = count ?? 45;
  const mobileCount = count ?? (count === undefined ? 22 : Math.max(10, Math.floor(count / 2)));

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const particles = useMemo(() => {
    if (!mounted) return [];
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const baseCount = isMobile ? mobileCount : desktopCount;
    const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finalCount = reducedMotion ? Math.max(6, Math.floor(baseCount / 3)) : baseCount;
    return generateParticles(finalCount);
  }, [mounted, desktopCount, mobileCount]);

  useEffect(() => {
    if (!mounted) return;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const baseCount = isMobile ? mobileCount : desktopCount;
    const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finalCount = prefersReducedMotion.current ? Math.max(6, Math.floor(baseCount / 3)) : baseCount;
    particlesRef.current = generateParticles(finalCount);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const particles = particlesRef.current;
      const container = containerRef.current;

      if (!container) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const children = container.children;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const el = children[i] as HTMLElement | undefined;
        if (!el) continue;

        if (prefersReducedMotion.current) {
          el.style.transform = `translate(0px, 0px) rotate(${p.rotation}deg)`;
          el.style.opacity = "0.6";
          continue;
        }

        const driftT = ((elapsed + p.driftDelay) % p.driftDuration) / p.driftDuration;
        const driftEased = easeInOutSine(driftT);
        const dx = Math.sin(driftEased * Math.PI * 2) * p.driftXAmplitude;
        const dy = Math.cos(driftEased * Math.PI * 2) * p.driftYAmplitude;

        const twinkleT = ((elapsed + p.twinkleDelay) % p.twinkleDuration) / p.twinkleDuration;
        const twinkle = 0.2 + (Math.sin(twinkleT * Math.PI * 2 + p.twinklePhase) + 1) / 2 * 0.6;

        el.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${p.rotation}deg)`;
        el.style.opacity = twinkle.toFixed(3);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [mounted, desktopCount, mobileCount]);

  if (!mounted) {
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
          contain: "layout style paint",
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        contain: "layout style paint",
      }}
    >
      {particles.map((p, i) => {
        if (p.kind === "star") {
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${p.baseX}%`,
                top: `${p.baseY}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: "50%",
                background: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                willChange: "transform, opacity",
                opacity: 0.8,
              }}
            />
          );
        }
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={p.size}
            height={p.size}
            style={{
              position: "absolute",
              left: `${p.baseX}%`,
              top: `${p.baseY}%`,
              willChange: "transform, opacity",
              color: p.color,
              transform: "translate(0px, 0px)",
              opacity: 0.7,
              filter: `drop-shadow(0 0 ${p.size * 0.3}px ${p.color})`,
            }}
          >
            <path
              d={DOG_BONE_PATH}
              fill="currentColor"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        );
      })}
    </div>
  );
}
