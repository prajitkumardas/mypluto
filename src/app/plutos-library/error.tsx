"use client";

import { StatePanel } from "@/components/shared/state-panel";

export default function PlutosLibraryError() {
  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <StatePanel
        action="Retry"
        copy="The imported library data could not be loaded. Search context should be preserved when you retry or return to discovery."
        secondary="Browse categories"
        title="Search data unavailable"
        tone="error"
      />
    </main>
  );
}
