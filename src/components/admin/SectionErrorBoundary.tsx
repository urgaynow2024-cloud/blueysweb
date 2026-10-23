"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/admin/Button";

interface Props {
  children: React.ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * A section-level error boundary.
 *
 * A failing reviews/adoptables/queue section must never take the whole admin
 * dashboard down. Each tab is wrapped in its own boundary so one bad render
 * shows a compact retry card instead of a full-page crash, and the rest of the
 * shell (sidebar, other tabs, save state) stays intact.
 */
export class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ad-empty rounded-[var(--r-lg)] border border-dashed border-[var(--danger-border)] bg-[var(--danger-soft)] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                {this.props.fallbackLabel || "This section failed to render"}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {this.state.error?.message || "An unexpected error occurred while rendering this section."}
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                onClick={() => this.setState({ hasError: false, error: undefined })}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SectionErrorBoundary;