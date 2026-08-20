import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LibraryCategory } from "@/lib/plutos-library";

export function CategoryCard({ category }: { category: LibraryCategory }) {
  return (
    <Link
      aria-label={`Open ${category.name}, ${category.toolCount} tools and ${category.subcategoryCount} subcategories`}
      className="focus-ring group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-violet-500 hover:shadow-elevated"
      href={`/plutos-library/${category.slug}`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-heading text-2xl font-bold text-neutral-900 group-hover:text-violet-600">
          {category.name}
        </h3>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-500 transition group-hover:bg-violet-100 group-hover:text-violet-600">
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <p className="number mt-2 text-sm font-semibold text-neutral-500">
        {category.toolCount} tools / {category.subcategoryCount} subcategories
      </p>
      <p className="mt-3 text-sm leading-6 text-neutral-700">
        {category.exampleSubcategories.slice(0, 3).join(", ") ||
          "Subcategories available after import."}
      </p>
      <span className="mt-auto pt-5 text-sm font-bold text-violet-600">
        View tools
      </span>
    </Link>
  );
}
