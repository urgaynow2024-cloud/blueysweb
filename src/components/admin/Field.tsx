"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";

interface FieldWrapProps {
  label?: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, htmlFor, children, className = "" }: FieldWrapProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="ad-label">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="ad-field-hint">{hint}</p>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = "", ...props },
  ref
) {
  return <input ref={ref} className={`field ${className}`} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className = "", rows = 4, ...props },
  ref
) {
  return <textarea ref={ref} rows={rows} className={`field resize-y ${className}`} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className = "", children, ...props },
  ref
) {
  return (
    <select ref={ref} className={`field appearance-none bg-[var(--bg-elevated)] ${className}`} {...props}>
      {children}
    </select>
  );
});
