"use client";

import { PageShell } from "@/components/layout/page-shell";
import { StatePanel } from "@/components/shared/state-panel";

export default function PlutosLibraryError() {
  return (
    <PageShell>
      <StatePanel
        action="Retry"
        copy="The imported library data could not be loaded. Search context should be preserved when you retry or return to discovery."
        secondary="Browse categories"
        title="Search data unavailable"
        tone="error"
      />
    </PageShell>
  );
}