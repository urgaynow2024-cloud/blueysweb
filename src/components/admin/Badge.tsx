import { type ReactNode } from "react";

type Tone = "default" | "accent" | "success" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  default: "border-[var(--border-strong)] text-[var(--text-secondary)]",
  accent: "border-[var(--border-accent)] text-[var(--accent)] bg-[var(--accent-soft)]",
  success: "border-[rgba(52,211,153,0.3)] text-[var(--success)] bg-[rgba(52,211,153,0.08)]",
  warning: "border-[rgba(251,191,36,0.3)] text-[var(--warning)] bg-[rgba(251,191,36,0.08)]",
  danger: "border-[var(--danger-border)] text-[var(--danger)] bg-[var(--danger-soft)]",
};

export function Badge({ tone = "default", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={`ad-badge glass ${toneClass[tone]} ${className}`}>{children}</span>;
}
