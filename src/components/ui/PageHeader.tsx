import { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`mx-auto ${centered ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <span className={`eyebrow ${centered ? "justify-center" : ""}`}>
          {icon}
          {eyebrow}
        </span>
      )}
      <h1 className={`display-xl mt-5 text-white ${centered ? "mx-auto" : ""}`}>{title}</h1>
      {subtitle && (
        <p className={`lead mx-auto mt-4 ${centered ? "max-w-xl" : "max-w-lg"}`}>{subtitle}</p>
      )}
    </div>
  );
}
