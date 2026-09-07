import { ReactNode, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  destructive: "btn-destructive",
};

const sizeClass: Record<Size, string> = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  leftIcon,
  rightIcon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}) {
  return (
    <button
      className={`btn-base ${variantClass[variant]} ${sizeClass[size]} ${className} inline-flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={props.disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {leftIcon && <span className="flex items-center">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  leftIcon,
  rightIcon,
  external = false,
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  external?: boolean;
}) {
  const cls = `btn-base ${variantClass[variant]} ${sizeClass[size]} ${className} inline-flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-50`;
  const inner = loading ? (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  ) : (
    <>
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-busy={loading}>
        {inner}
      </a>
    );
  }
  return (
    <a href={href} className={cls} aria-busy={loading}>
      {inner}
    </a>
  );
}