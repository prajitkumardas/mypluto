"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CompareState = {
  selected: string[];
  saved: string[];
  recentlyViewed: string[];
  addTool: (slug: string) => void;
  removeTool: (slug: string) => void;
  clearCompare: () => void;
  toggleSaved: (slug: string) => void;
  addRecent: (slug: string) => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      selected: [],
      saved: [],
      recentlyViewed: [],
      addTool: (slug) =>
        set((state) => {
          if (state.selected.includes(slug) || state.selected.length >= 4) {
            return state;
          }
          return { selected: [...state.selected, slug] };
        }),
      removeTool: (slug) =>
        set((state) => ({ selected: state.selected.filter((item) => item !== slug) })),
      clearCompare: () => set({ selected: [] }),
      toggleSaved: (slug) =>
        set((state) => ({
          saved: state.saved.includes(slug)
            ? state.saved.filter((item) => item !== slug)
            : [...state.saved, slug]
        })),
      addRecent: (slug) =>
        set((state) => ({
          recentlyViewed: [slug, ...state.recentlyViewed.filter((item) => item !== slug)].slice(0, 6)
        }))
    }),
    {
      name: "pluto-local-journey"
    }
  )
);
