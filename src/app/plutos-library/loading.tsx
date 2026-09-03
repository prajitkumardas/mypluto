import { CardGrid } from "@/components/layout/card-grid";
import { PageShell } from "@/components/layout/page-shell";

export default function LoadingPlutosLibrary() {
  return (
    <PageShell>
      <div className="h-8 w-40 rounded-[var(--radius-md)] bg-[var(--background-interactive)]" />
      <div className="mt-5 h-16 max-w-[var(--text-width-lg)] rounded-[var(--radius-xl)] bg-[var(--background-interactive)]" />
      <div className="mt-10 h-20 rounded-[var(--radius-2xl)] bg-[var(--surface-raised)]" />
      <CardGrid className="mt-10" columns="three">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="h-80 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-raised)]" key={index} />
        ))}
      </CardGrid>
    </PageShell>
  );
}