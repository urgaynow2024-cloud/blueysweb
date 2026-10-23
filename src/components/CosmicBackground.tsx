import { ReactNode } from "react";

export default function CosmicBackground({
  children,
  intensity = "medium",
  className,
}: {
  children?: ReactNode;
  intensity?: "light" | "medium" | "heavy";
  className?: string;
}) {
  const intensityMap = {
    light: "opacity-[0.03]",
    medium: "opacity-[0.05]",
    heavy: "opacity-[0.08]",
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-30" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] blur-[130px] orb-slow" style={{ opacity: intensity === "heavy" ? 0.06 : intensity === "medium" ? 0.04 : 0.03 }} />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-60 w-[500px] rounded-full bg-[var(--accent-nebula)] blur-[100px]" style={{ opacity: intensity === "heavy" ? 0.05 : intensity === "medium" ? 0.03 : 0.02 }} />
      <div className="pointer-events-none absolute top-1/3 left-0 h-48 w-[400px] rounded-full bg-[var(--accent-star)] blur-[110px]" style={{ opacity: intensity === "heavy" ? 0.05 : 0.03 }} />
      {children}
    </div>
  );
}
