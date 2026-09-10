export function getLibraryCategoryHref(categorySlug: string) {
  return `/plutos-library?category=${encodeURIComponent(categorySlug)}`;
}
