import { notFound, permanentRedirect } from "next/navigation";
import {
  buildLibraryHref,
  getLibraryCategory,
  plutosLibrary
} from "@/lib/plutos-library";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{
    q?: string;
    pricing?: string;
    platform?: string;
    api?: string;
    verification?: string;
    sort?: string;
    page?: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return plutosLibrary.categories.map((category) => ({ categorySlug: category.slug }));
}

export default async function LibraryCategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = getLibraryCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const query = await searchParams;
  permanentRedirect(buildLibraryHref("/plutos-library", {
    category: category.slug,
    q: query.q,
    pricing: query.pricing,
    platform: query.platform,
    api: query.api,
    verification: query.verification,
    sort: query.sort,
    page: query.page
  }));
}
