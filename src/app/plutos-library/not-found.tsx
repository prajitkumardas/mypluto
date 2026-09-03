import { PageShell } from "@/components/layout/page-shell";
import { StatePanel } from "@/components/shared/state-panel";

export default function PlutosLibraryNotFound() {
  return (
    <PageShell>
      <StatePanel
        action="Browse all categories"
        actionHref="/plutos-library"
        copy="That Discover page does not exist. The category or tool slug may have changed."
        secondary="Search tools"
        secondaryHref="/plutos-library/search"
        title="Library page not found"
      />
    </PageShell>
  );
}