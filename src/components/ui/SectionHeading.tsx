import { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  icon,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  icon?: ReactNode;
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={`${centered ? "text-center mx-auto" : ""} ${
        centered ? "mb-12 md:mb-16" : "mb-10 md:mb-14"
      } ${className}`}
    >
      {eyebrow && (
        <span className={`section-label ${centered ? "justify-center" : ""}`}>
          {icon}
          {eyebrow}
        </span>
      )}
      <h2 className={`display-lg text-white ${centered ? "mx-auto" : ""}`}>{title}</h2>
      {subtitle && (
        <p className={`lead mt-4 ${centered ? "mx-auto max-w-2xl" : "max-w-xl"}`}>{subtitle}</p>
      )}
      {centered && (
        <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
      )}
    </div>
  );
}
