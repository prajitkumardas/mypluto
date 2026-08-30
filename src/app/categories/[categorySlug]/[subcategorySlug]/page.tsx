import { redirect } from "next/navigation";

type SubcategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { categorySlug } = await params;

  redirect(`/categories/${categorySlug}`);
}