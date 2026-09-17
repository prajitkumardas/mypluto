"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type VisualEffectBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type VisualEffectBoundaryState = {
  failed: boolean;
};

export class VisualEffectBoundary extends Component<VisualEffectBoundaryProps, VisualEffectBoundaryState> {
  state: VisualEffectBoundaryState = { failed: false };

  static getDerivedStateFromError(): VisualEffectBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("A decorative visual effect was disabled after a rendering failure.", error, info);
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
