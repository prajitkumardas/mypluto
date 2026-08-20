"use client";

import { useEffect } from "react";
import { useCompareStore } from "@/lib/compare-store";

export function ViewedMarker({ slug }: { slug: string }) {
  const addRecent = useCompareStore((state) => state.addRecent);

  useEffect(() => {
    addRecent(slug);
  }, [addRecent, slug]);

  return null;
}
