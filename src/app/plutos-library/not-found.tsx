import { StatePanel } from "@/components/shared/state-panel";

export default function PlutosLibraryNotFound() {
  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <StatePanel
        action="Browse all categories"
        actionHref="/plutos-library"
        copy="That Pluto's Library page does not exist. The category or tool slug may have changed."
        secondary="Search tools"
        secondaryHref="/plutos-library/search"
        title="Library page not found"
      />
    </main>
  );
}
