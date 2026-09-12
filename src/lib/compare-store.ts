"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_COMPARE_TOOLS = 4;

export type CompareActionStatus = "added" | "duplicate" | "limit";

export type CompareActionResult = {
  status: CompareActionStatus;
  selected: string[];
};

export type RecentToolRecord = {
  slug: string;
  name: string;
  logoUrl: string | null;
  visitedAt: string;
};

type CompareState = {
  selected: string[];
  saved: string[];
  recentlyViewed: RecentToolRecord[];
  hydrated: boolean;
  feedback: string;
  lastUpdated: string | null;
  addTool: (slug: string, toolName?: string) => CompareActionResult;
  removeTool: (slug: string, toolName?: string) => void;
  replaceTool: (oldSlug: string, nextSlug: string, toolName?: string) => CompareActionResult;
  setSelectedTools: (slugs: string[]) => void;
  clearCompare: () => void;
  toggleSaved: (slug: string) => void;
  addRecent: (tool: Omit<RecentToolRecord, "visitedAt">) => void;
  setFeedback: (message: string) => void;
  markHydrated: () => void;
};

function uniqueSlugs(slugs: string[]) {
  return [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))].slice(0, MAX_COMPARE_TOOLS);
}

function now() {
  return new Date().toISOString();
}

function addedMessage(name: string, count: number) {
  if (count <= 1) return `${name} added. Select at least one more tool to compare.`;
  if (count === 2) return `${name} added. Your comparison is ready.`;
  if (count === 3) return `${name} added. You can add one more tool.`;
  return `${name} added. Maximum 4 tools selected.`;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      selected: [],
      saved: [],
      recentlyViewed: [],
      hydrated: false,
      feedback: "",
      lastUpdated: null,
      addTool: (slug, toolName) => {
        const cleanSlug = slug.trim();
        const name = toolName || cleanSlug;
        const state = get();

        if (!cleanSlug) {
          return { status: "duplicate", selected: state.selected };
        }

        if (state.selected.includes(cleanSlug)) {
          set({ feedback: `${name} is already in your comparison.` });
          return { status: "duplicate", selected: state.selected };
        }

        if (state.selected.length >= MAX_COMPARE_TOOLS) {
          set({ feedback: "You can compare up to 4 tools at a time." });
          return { status: "limit", selected: state.selected };
        }

        const selected = [...state.selected, cleanSlug];
        set({ feedback: addedMessage(name, selected.length), lastUpdated: now(), selected });
        return { status: "added", selected };
      },
      removeTool: (slug, toolName) => {
        const state = get();
        const selected = state.selected.filter((item) => item !== slug);
        set({
          feedback: `${toolName || slug} removed from comparison.`,
          lastUpdated: now(),
          selected
        });
      },
      replaceTool: (oldSlug, nextSlug, toolName) => {
        const cleanNext = nextSlug.trim();
        const state = get();
        const name = toolName || cleanNext;
        const oldIndex = state.selected.indexOf(oldSlug);

        if (!cleanNext || oldIndex === -1) {
          return get().addTool(cleanNext, name);
        }

        if (state.selected.includes(cleanNext) && cleanNext !== oldSlug) {
          set({ feedback: `${name} is already in your comparison.` });
          return { status: "duplicate", selected: state.selected };
        }

        const selected = [...state.selected];
        selected[oldIndex] = cleanNext;
        set({ feedback: `${name} added to slot ${oldIndex + 1}.`, lastUpdated: now(), selected });
        return { status: "added", selected };
      },
      setSelectedTools: (slugs) => {
        const selected = uniqueSlugs(slugs);
        set({ selected, lastUpdated: selected.length > 0 ? now() : null });
      },
      clearCompare: () => set({ feedback: "Comparison cleared.", lastUpdated: now(), selected: [] }),
      toggleSaved: (slug) =>
        set((state) => ({
          saved: state.saved.includes(slug)
            ? state.saved.filter((item) => item !== slug)
            : [...state.saved, slug]
        })),
      addRecent: (tool) =>
        set((state) => ({
          recentlyViewed: [
            { ...tool, visitedAt: now() },
            ...state.recentlyViewed.filter((item) => item.slug !== tool.slug)
          ].slice(0, 24)
        })),
      setFeedback: (message) => set({ feedback: message }),
      markHydrated: () => set({ hydrated: true })
    }),
    {
      name: "pluto-local-journey",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<CompareState> & { recentlyViewed?: Array<RecentToolRecord | string> };
        return {
          ...state,
          recentlyViewed: (state.recentlyViewed || []).map((item) => typeof item === "string"
            ? { slug: item, name: item, logoUrl: null, visitedAt: now() }
            : item).slice(0, 24)
        } as CompareState;
      },
      partialize: (state) => ({
        selected: state.selected,
        saved: state.saved,
        recentlyViewed: state.recentlyViewed,
        lastUpdated: state.lastUpdated
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      }
    }
  )
);
