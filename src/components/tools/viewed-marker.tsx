"use client";

import { useEffect } from "react";
import { useCompareStore } from "@/lib/compare-store";

export function ViewedMarker({ logoUrl = null, name, slug }: { logoUrl?: string | null; name: string; slug: string }) {
  const addRecent = useCompareStore((state) => state.addRecent);

  useEffect(() => {
    addRecent({ logoUrl, name, slug });
  }, [addRecent, logoUrl, name, slug]);

  return null;
}
