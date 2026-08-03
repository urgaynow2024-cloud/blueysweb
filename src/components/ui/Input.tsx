import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

interface FieldWrapperProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, error, htmlFor, children, className = "" }: FieldWrapperProps) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={`block text-xs font-semibold mb-2 transition-colors ${
            error ? "text-[var(--danger)]" : "text-[var(--text-secondary)]"
          }`}
        >
          {label}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="mt-2 text-xs text-[var(--text-dim)] leading-relaxed">{hint}</p>
      )}
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--danger)] leading-relaxed">
          <span className="h-3 w-3 shrink-0 rounded-full bg-[var(--danger)]" />
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode; hint?: ReactNode; error?: ReactNode }>(
  function Input({ className = "", label, hint, error, ...props }, ref) {
    if (label !== undefined || hint !== undefined || error !== undefined) {
      return (
        <Field label={label} hint={hint} error={error}>
          <input
            ref={ref}
            className={`field ${className} ${error ? "error" : ""}`}
            style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.025), transparent 45%), var(--bg-card)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
              transition:
                "border-color 0.4s var(--ease-out), box-shadow 0.4s var(--ease-out), background 0.4s, transform 0.2s",
            }}
            {...props}
          />
        </Field>
      );
    }
    return (
      <input
        ref={ref}
        className={`field ${className}`}
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.025), transparent 45%), var(--bg-card)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
          transition:
            "border-color 0.4s var(--ease-out), box-shadow 0.4s var(--ease-out), background 0.4s, transform 0.2s",
        }}
        {...props}
      />
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: ReactNode; hint?: ReactNode; error?: ReactNode }>(
  function Textarea({ className = "", label, hint, error, rows = 4, ...props }, ref) {
    if (label !== undefined || hint !== undefined || error !== undefined) {
      return (
        <Field label={label} hint={hint} error={error}>
          <textarea
            ref={ref}
            rows={rows}
            className={`field resize-y ${className} ${error ? "error" : ""}`}
            style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.025), transparent 45%), var(--bg-card)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
              transition:
                "border-color 0.4s var(--ease-out), box-shadow 0.4s var(--ease-out), background 0.4s, transform 0.2s",
            }}
            {...props}
          />
        </Field>
      );
    }
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`field resize-y ${className}`}
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.025), transparent 45%), var(--bg-card)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
          transition:
            "border-color 0.4s var(--ease-out), box-shadow 0.4s var(--ease-out), background 0.4s, transform 0.2s",
        }}
        {...props}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = "", children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`field appearance-none bg-[var(--bg-elevated)] ${className}`}
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.025), transparent 45%), var(--bg-card)",
          paddingRight: "2.5rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);

export const InputGroup = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex items-center gap-2 rounded-[var(--r-xs)] border border-[var(--border)] bg-[var(--bg-card)] px-3 transition-all duration-300 focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_var(--accent-soft),_0_0_30px_-8px_var(--accent-glow)] ${className}`}
  >
    {children}
  </div>
);

export const InputIcon = ({
  icon,
  position = "left",
  clickable = false,
  onClick,
}: {
  icon: ReactNode;
  position?: "left" | "right";
  clickable?: boolean;
  onClick?: () => void;
}) => {
  if (position === "right") {
    return (
      <span
        className={`flex shrink-0 items-center text-[var(--text-dim)] transition-colors ${
          clickable
            ? "cursor-pointer text-[var(--text-secondary)] hover:text-[var(--accent)]"
            : ""
        }`}
        onClick={clickable ? onClick : undefined}
      >
        {icon}
      </span>
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center text-[var(--text-dim)] transition-colors ${
        clickable
          ? "cursor-pointer text-[var(--text-secondary)] hover:text-[var(--accent)]"
          : ""
      }`}
      onClick={clickable ? onClick : undefined}
    >
      {icon}
    </span>
  );
};
