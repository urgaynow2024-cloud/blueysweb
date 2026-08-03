import { ReactNode, HTMLAttributes } from "react";

type CardVariant = "default" | "elevated" | "interactive" | "glass" | "marketplace" | "minimal" | "portfolio" | "pricing" | "review" | "faq";
type CardPadding = "sm" | "md" | "lg";

const variantClasses: Record<CardVariant, string> = {
  default: "premium-card border border-[var(--border)]",
  elevated: "border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-hover)]",
  interactive: "premium-card group border border-[var(--border)] hover:border-[var(--border-hover)]",
  glass: "glass",
  marketplace: "marketplace-card group border border-[var(--border)] hover:border-[var(--border-hover)]",
  minimal: "border border-[var(--border)] bg-transparent hover:border-[var(--border-hover)]",
  portfolio: "portfolio-card border border-[var(--border)]",
  pricing: "pricing-card border border-[var(--border)]",
  review: "review-card border border-[var(--border)]",
  faq: "faq-card border border-[var(--border)]",
};

const paddingClasses: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverGlow?: boolean;
  children?: ReactNode;
}

export function PremiumCard({
  variant = "default",
  padding = "md",
  hoverGlow = false,
  className = "",
  children,
  ...props
}: PremiumCardProps) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-[var(--r-lg)] transition-all duration-500 ${variantClasses[variant]} ${paddingClasses[padding]} ${
        hoverGlow ? "hover:shadow-[0_0_50px_rgba(90,176,240,0.15)]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  actions,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{description}</p>}
        </div>
      </div>
      {actions && <div className="shrink-0 pt-0.5 sm:pt-0 sm:pl-4">{actions}</div>}
    </div>
  );
}

export function CardBody({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`mt-6 flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4 text-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardGrid({
  children,
  cols = "sm",
  gap = "4",
  className = "",
}: {
  children: ReactNode;
  cols?: "sm" | "md" | "lg";
  gap?: string;
  className?: string;
}) {
  const colClasses = {
    sm: "grid-cols-1 sm:grid-cols-2",
    md: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    lg: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };
  return <div className={`grid ${colClasses[cols]} gap-${gap} ${className}`}>{children}</div>;
}
