"use client";

import { useMemo } from "react";

type Particle = {
  left: number;
  top: number;
  size: number;
  opacity: number;
  rotation: number;
  color: string;
  kind: "bone" | "star";
};

const DOG_BONE_PATH =
  "M12.8 3.6c1.4 0.6 2.3 1.9 2.3 3.5 0 0.3 0 0.6-0.1 0.9 1.2 1 2 2.5 2 4.1 0 1.7-0.9 3.3-2.3 4.1 0.1 0.3 0.1 0.6 0.1 0.9 0 1.6-0.9 2.9-2.3 3.5-1.4-0.6-2.3-1.9-2.3-3.5 0-0.3 0-0.6 0.1-0.9-1.2-1-2-2.5-2-4.1 0-1.7 0.9-3.3 2.3-4.1-0.1-0.3-0.1-0.6-0.1-0.9 0-1.6 0.9-2.9 2.3-3.5zM8.8 6.6c-0.8 0.7-1.3 1.7-1.3 2.9 0 0.1 0 0.2 0 0.3-0.6-0.5-1-1.3-1-2.2 0-0.8 0.4-1.5 1-2 0-0.1 0.3 0 0.3 0zM15.2 6.6c0.8 0.7 1.3 1.7 1.3 2.9 0 0.1 0 0.2 0 0.3 0.6-0.5 1-1.3 1-2.2 0-0.8-0.4-1.5-1-2-0.1 0 0.3 0 0.3 0zM10.2 11c-0.2-0.2-0.3-0.5-0.3-0.8 0-0.4 0.2-0.8 0.6-1 0.5 0.2 0.8 0.6 0.8 1 0 0.3-0.1 0.6-0.3 0.8h-0.8zM13.8 11c-0.2-0.2-0.3-0.5-0.3-0.8 0-0.4 0.2-0.8 0.6-1 0.5 0.2 0.8 0.6 0.8 1 0 0.3 0.1 0.6 0.3 0.8h-0.8z";

const COLORS = [
  "rgba(255,255,255,0.55)",
  "rgba(105,189,245,0.5)",
  "rgba(180,156,255,0.45)",
  "rgba(109,93,244,0.4)",
  "rgba(255,255,255,0.4)",
  "rgba(248,214,109,0.45)",
];

/**
 * Deterministic pseudo-random generator (mulberry32).
 *
 * The previous implementation used Math.random(), so the field was different on
 * every mount and could not be memoised meaningfully. A fixed seed keeps the
 * layout stable between renders and between page navigations, which removes the
 * "shuffling background" effect when moving between pages.
 */
function seededRandom(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function between(rand: () => number, min: number, max: number) {
  return rand() * (max - min) + min;
}

function generateParticles(count: number, seed = 20260901): Particle[] {
  const rand = seededRandom(seed);
  const particles: Particle[] = [];
  // Bones are the signature motif, so they keep the larger share.
  const boneCount = Math.max(4, Math.round(count * 0.35));
  const starCount = count - boneCount;

  for (let i = 0; i < boneCount; i++) {
    particles.push({
      left: rand() * 100,
      top: rand() * 100,
      size: between(rand, 12, 26),
      opacity: between(rand, 0.14, 0.3),
      rotation: between(rand, 0, 360),
      color: COLORS[Math.floor(rand() * COLORS.length)],
      kind: "bone",
    });
  }

  for (let i = 0; i < starCount; i++) {
    particles.push({
      left: rand() * 100,
      top: rand() * 100,
      size: between(rand, 2, 4),
      opacity: between(rand, 0.25, 0.6),
      rotation: 0,
      color: COLORS[Math.floor(rand() * COLORS.length)],
      kind: "star",
    });
  }

  return particles;
}

/**
 * Static decorative star/bone field.
 *
 * This used to run a permanent `requestAnimationFrame` loop that mutated the
 * transform and opacity of ~45 elements on every single frame, on every page,
 * forever. That contradicted the design brief ("avoid constant particles and
 * over-animated backgrounds"; "should feel smooth rather than constantly
 * moving") and it was a genuine performance and battery cost, especially on
 * mobile and on VRChat's Quest hardware.
 *
 * The particles are now rendered once and left completely static:
 *   - zero JavaScript runs per frame
 *   - no layout or paint work while scrolling
 *   - automatically satisfies `prefers-reduced-motion`, because there is no
 *     motion to disable
 *   - a deterministic seed keeps the field identical on every page
 */
export default function SpaceParticles({ count }: { count?: number }) {
  const particles = useMemo(() => generateParticles(count ?? 45), [count]);

  return (
    <div
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
      {particles.map((p, i) =>
        p.kind === "star" ? (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              opacity: p.opacity,
            }}
          />
        ) : (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={p.size}
            height={p.size}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: `${p.left}%`,
              top: `${p.top}%`,
              color: p.color,
              opacity: p.opacity,
              transform: `rotate(${p.rotation}deg)`,
            }}
          >
            <path d={DOG_BONE_PATH} fill="currentColor" />
          </svg>
        ),
      )}
    </div>
  );
}