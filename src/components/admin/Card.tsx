import { type HTMLAttributes, type ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children: ReactNode;
}

export function Card({ hover = false, className = "", children, ...props }: CardProps) {
  return (
    <div className={`ad-panel ${hover ? "ad-panel-hover" : ""} ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, actions, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[1.25rem] font-semibold leading-tight tracking-[-0.02em] text-white">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
