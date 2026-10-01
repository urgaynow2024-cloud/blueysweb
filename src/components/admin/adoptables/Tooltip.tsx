"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Accessible tooltip for icon-only controls.
 *
 * Admin actions are frequently icon buttons, and an unlabelled icon is unusable
 * without a hover hint. The label is always exposed to assistive technology via
 * `aria-label`; this adds the visual hint.
 */
export function Tooltip({ label, children, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const show = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), 180);
  };

  const hide = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(false);
  };

  const position = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`ad-tooltip pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg ${position}`}
        >
          {label}
        </span>
      )}
    </span>
  );
}
