"use client";

/**
 * CategoryFilter — pill-style filter bar for media categories.
 *
 * WHY "use client": filter state lives in the browser (URL search params).
 * The media grid itself is still a server component — we only hydrate this
 * small interactive piece. This keeps the JS bundle minimal.
 */

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { MediaCategory, MediaType } from "@/types/media";

const CATEGORIES: { label: string; value: MediaCategory }[] = [
  { label: "Events", value: "events" },
  { label: "Campus", value: "campus" },
  { label: "Sports", value: "sports" },
  { label: "Academics", value: "academics" },
  { label: "Cultural", value: "cultural" },
  { label: "Technical", value: "technical" },
];

const TYPES: { label: string; value: MediaType }[] = [
  { label: "Photos", value: "image" },
  { label: "Videos", value: "video" },
];

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") as MediaCategory | null;
  const activeType = searchParams.get("type") as MediaType | null;
  const search = searchParams.get("q") ?? "";

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const toggleCategory = (value: MediaCategory) => {
    setParam("category", activeCategory === value ? null : value);
  };

  const toggleType = (value: MediaType) => {
    setParam("type", activeType === value ? null : value);
  };

  return (
    <div className="space-y-3 mb-8">
      {/* Search */}
      <input
        type="search"
        placeholder="Search photos and videos..."
        defaultValue={search}
        onChange={(e) => setParam("q", e.target.value || null)}
        className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        aria-label="Search media"
      />

      {/* Type toggle */}
      <div className="flex gap-2">
        {TYPES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => toggleType(value)}
            className={pill(activeType === value)}
            aria-pressed={activeType === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setParam("category", null)}
          className={pill(!activeCategory)}
          aria-pressed={!activeCategory}
        >
          All
        </button>
        {CATEGORIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => toggleCategory(value)}
            className={pill(activeCategory === value)}
            aria-pressed={activeCategory === value}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function pill(active: boolean): string {
  const base =
    "px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer";
  return active
    ? `${base} bg-black text-white`
    : `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
}
