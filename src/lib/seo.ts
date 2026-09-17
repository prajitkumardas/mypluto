import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mypluto.vercel.app";
export const DEFAULT_SOCIAL_IMAGE = "/images/plutofinds-logo.png";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

export function createPageMetadata({ title, description, path, noIndex = false }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "Pluto Finds",
      title,
      description,
      url: path,
      images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: "Pluto Finds" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_SOCIAL_IMAGE]
    },
    robots: noIndex ? { index: false, follow: false } : undefined
  };
}

