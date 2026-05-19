"use client";

/**
 * Skeleton / Boneyard — the "ghost" of the content while it loads.
 *
 * WHY shimmer not opacity pulse?
 *   A left-to-right shimmer communicates "loading in progress."
 *   Opacity pulse communicates "broken / waiting."
 *   Premium products always shimmer.
 *
 * The gradient animation is pure CSS — zero JS cost.
 */

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * MediaCard Skeleton — mirrors the shape of a real MediaCard.
 * Heights are randomized slightly so the grid looks natural, not robotic.
 */
export function MediaCardSkeleton({ index }: { index: number }) {
  // Vary heights to mimic masonry — same pattern every render (deterministic)
  const heights = [200, 260, 180, 300, 220, 240, 190, 280];
  const h = heights[index % heights.length];

  return (
    <div
      className="break-inside-avoid"
      style={{ contentVisibility: "auto", containIntrinsicSize: `0 ${h + 50}px` }}
    >
      <Skeleton style={{ height: h, borderRadius: 8 }} />
      <Skeleton
        style={{ height: 14, marginTop: 8, width: "70%", borderRadius: 4 }}
      />
    </div>
  );
}

/**
 * MediaGrid Skeleton — 12 cards (3 rows × 4 cols at xl, matches priority={index < 12}).
 */
export function MediaGridSkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <MediaCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
