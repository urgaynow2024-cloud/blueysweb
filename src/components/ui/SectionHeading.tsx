import { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  icon,
  className = "",
  divider = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  icon?: ReactNode;
  className?: string;
  divider?: boolean;
}) {
  const centered = align === "center";
  return (
    <div
      className={`${centered ? "text-center mx-auto" : ""} ${
        centered ? "mb-10 md:mb-12" : "mb-8 md:mb-10"
      } ${className}`}
    >
      {eyebrow && (
        <span className={`section-eyebrow ${centered ? "justify-center" : ""}`}>
          {icon}
          {eyebrow}
        </span>
      )}
      <h2 className={`display-lg text-white ${centered ? "mx-auto" : ""}`}>{title}</h2>
      {subtitle && (
        <p className={`lead mt-3 ${centered ? "mx-auto max-w-2xl" : "max-w-xl"}`}>{subtitle}</p>
      )}
      {divider && centered && (
        <div className="mt-5 flex justify-center">
          <span className="block h-px w-10 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />
        </div>
      )}
    </div>
  );
}