"use client";

import { useEffect } from "react";
import { StatePanel } from "@/components/shared/state-panel";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Route rendering failed", { digest: error.digest, name: error.name });
  }, [error]);

  return (
    <main className="mx-auto min-h-[70dvh] w-full max-w-[var(--page-content)] px-[var(--page-gutter)] py-32">
      <StatePanel
        action="Try again"
        actionOnClick={reset}
        copy="This part of Pluto hit an unexpected problem. Your saved and comparison data is still on this device."
        secondary="Go home"
        secondaryHref="/"
        title="We couldn’t load this page"
        tone="error"
      />
    </main>
  );
}
