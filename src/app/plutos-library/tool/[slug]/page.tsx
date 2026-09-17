import { permanentRedirect } from "next/navigation";

type LegacyToolDetailProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyToolDetailPage({ params }: LegacyToolDetailProps) {
  const { slug } = await params;
  permanentRedirect(`/tools/${slug}`);
}
