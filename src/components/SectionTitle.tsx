import { ReactNode } from "react";

export default function SectionTitle({
  title,
  subtitle,
  children,
  align = "left",
  light = false,
  icon,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  align?: "left" | "center";
  light?: boolean;
  icon?: string;
}) {
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${light ? "mb-10 md:mb-14" : "mb-12 md:mb-16"}`}>
      {subtitle && <span className="section-label">{subtitle}</span>}
      <div className="flex items-center gap-3 mb-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <h2 className={`display-lg text-white ${align === "center" ? "mx-auto" : ""}`}>{title}</h2>
      </div>
      {align === "center" && (
        <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
      )}
      {children && <div className={`mt-5 ${align === "center" ? "mx-auto" : ""}`}>{children}</div>}
    </div>
  );
}
