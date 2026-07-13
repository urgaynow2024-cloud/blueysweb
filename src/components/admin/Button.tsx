"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: "ad-btn-primary",
  secondary: "ad-btn-secondary",
  danger: "ad-btn-danger",
  ghost: "ad-btn-ghost",
};

const sizeClass: Record<Size, string> = {
  sm: "ad-btn-sm",
  md: "",
  lg: "ad-btn-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, leftIcon, rightIcon, fullWidth, className = "", children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`ad-btn ${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      data-loading={loading ? "true" : undefined}
      aria-busy={loading ? true : undefined}
      {...props}
    >
      {loading ? <Loader2 className="ad-spinner" aria-hidden /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
