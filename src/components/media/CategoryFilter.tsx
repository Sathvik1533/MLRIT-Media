"use client";

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
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="space-y-3 mb-8">
      <input
        type="search"
        placeholder="Search photos and videos..."
        defaultValue={search}
        onChange={(e) => setParam("q", e.target.value || null)}
        className="w-full max-w-sm px-4 py-2 rounded-full text-sm outline-none transition-all"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--text)",
        }}
        aria-label="Search media"
      />

      <div className="flex gap-2">
        {TYPES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setParam("type", activeType === value ? null : value)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-150"
            style={
              activeType === value
                ? { background: "var(--accent)", color: "#ffffff" }
                : { border: "1px solid var(--border)", color: "var(--text-2)" }
            }
            aria-pressed={activeType === value}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setParam("category", null)}
          className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-150"
          style={
            !activeCategory
              ? { background: "var(--accent)", color: "#ffffff" }
              : { border: "1px solid var(--border)", color: "var(--text-2)" }
          }
          aria-pressed={!activeCategory}
        >
          All
        </button>
        {CATEGORIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setParam("category", activeCategory === value ? null : value)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-150"
            style={
              activeCategory === value
                ? { background: "var(--accent)", color: "#ffffff" }
                : { border: "1px solid var(--border)", color: "var(--text-2)" }
            }
            aria-pressed={activeCategory === value}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
