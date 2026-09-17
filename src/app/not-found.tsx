import type { Metadata } from "next";
import { PlutoButton } from "@/components/ui/pluto-button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[75dvh] w-full max-w-[var(--page-content)] place-items-center px-[var(--page-gutter)] py-32 text-center">
      <div>
        <p className="type-overline text-[var(--text-brand)]">404 · Lost in Pluto’s orbit</p>
        <h1 className="mt-4 type-h1 text-[var(--text-primary)]">This page drifted out of range.</h1>
        <p className="mx-auto mt-4 max-w-xl type-body-lg text-[var(--text-secondary)]">
          Try searching again or head back to Discover to find a useful AI tool.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <PlutoButton href="/" variant="secondary">Go home</PlutoButton>
          <PlutoButton href="/search" variant="secondary">Search</PlutoButton>
          <PlutoButton href="/plutos-library" showArrow variant="primary">Discover tools</PlutoButton>
        </div>
      </div>
    </main>
  );
}
