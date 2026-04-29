"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatsData {
  status: string;
  cache: { hitRatePct: number; configured: boolean };
  load: {
    avgLatencyMs: number;
    avgRedisLatencyMs: number;
    requestsPerMinute: number;
    avgPayloadKB: string;
  };
  db: { totalAssets: number };
}

interface MediaItem {
  id: string;
  cloudinaryPublicId: string;
  title: string;
  category: string;
  type: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  {
    num: "01",
    label: "Upload",
    desc: "Raw asset ingestion via drag-drop or API",
    tag: "WebP · AVIF · MP4",
    accent: "#2563eb",
    href: "/upload",
  },
  {
    num: "02",
    label: "Process",
    desc: "5 quality variants auto-generated per asset",
    tag: "144p → 1080p",
    accent: "#7c3aed",
    href: "/upload",
  },
  {
    num: "03",
    label: "Cache",
    desc: "Redis hot-storage with instant hit detection",
    tag: "TTL 5 min · <5ms",
    accent: "#059669",
    href: "/dashboard",
  },
  {
    num: "04",
    label: "Deliver",
    desc: "Cloudinary global CDN with adaptive quality",
    tag: "f_auto · q_auto",
    accent: "#ea580c",
    href: "/test-lab",
  },
] as const;

const CAPABILITIES = [
  {
    id: "upload",
    title: "Smart Upload Pipeline",
    desc: "Drag-drop asset ingestion with automatic format detection, 5-tier quality variant generation, and immediate CDN sync.",
    accent: "#2563eb",
    href: "/upload",
    cta: "Upload Assets",
    bullets: [
      "WebP / AVIF auto-conversion",
      "5 quality tiers (144p → 1080p)",
      "Instant Cloudinary sync",
    ],
  },
  {
    id: "benchmark",
    title: "CDN Benchmark Lab",
    desc: "Measure TTFB, payload size, and total delivery time across all quality variants. Catch regressions before production.",
    accent: "#ea580c",
    href: "/test-lab",
    cta: "Run Benchmark",
    bullets: [
      "TTFB vs body download split",
      "Payload size per variant",
      "Baseline delta comparison",
    ],
  },
  {
    id: "monitor",
    title: "Live Performance Monitor",
    desc: "Real-time Redis cache hit rates, API latency, and payload tracking across a rolling 100-request ring buffer.",
    accent: "#059669",
    href: "/dashboard",
    cta: "Open Dashboard",
    bullets: [
      "Cache HIT / MISS ratio",
      "Per-request latency timeline",
      "100-request rolling window",
    ],
  },
] as const;

const CATEGORY_ACCENT: Record<string, string> = {
  events: "#2563eb",
  sports: "#ea580c",
  cultural: "#7c3aed",
  academic: "#0891b2",
  campus: "#059669",
  technical: "#ca8a04",
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const Icons = {
  upload: (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M8.5 11.5V3M4.5 6.5l4-3.5 4 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 14.5h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  process: (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 2v2M8.5 13v2M2 8.5h2M13 8.5h2M3.6 3.6l1.4 1.4M12 12l1.4 1.4M3.6 13.4l1.4-1.4M12 5l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  cache: (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  deliver: (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M3 14L14 3M14 3H7M14 3v7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  benchmark: (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M2 13l4-5.5 3.5 2 4-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="3.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  monitor: (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <rect x="1.5" y="3.5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 10.5l2 1.5 3.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  arrow: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 6.5h11M6.5 1l5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  arrowSmall: (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M1 5.5h9M5.5 1l4.5 4.5L5.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const PIPELINE_ICONS = [Icons.upload, Icons.process, Icons.cache, Icons.deliver];
const CAPABILITY_ICONS = [Icons.upload, Icons.benchmark, Icons.monitor];

// ── Helpers ───────────────────────────────────────────────────────────────────

function cdnUrl(publicId: string, w = 480, h = 300) {
  return `https://res.cloudinary.com/diigktj8x/image/upload/f_auto,q_auto,w_${w},h_${h},c_fill/${publicId}`;
}

function healthColor(val: number | null, threshold: number, higherIsBetter = true) {
  if (val === null) return "var(--text-2)";
  return (higherIsBetter ? val >= threshold : val <= threshold) ? "#059669" : "#d97706";
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({
  overline,
  heading,
  accent = "#2563eb",
}: {
  overline: string;
  heading: string;
  accent?: string;
}) {
  return (
    <div style={{ marginBottom: 64 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 5px ${accent}80`,
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-geist-mono)",
            color: "var(--text-2)",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontWeight: 600,
          }}
        >
          {overline}
        </span>
      </div>
      <h2
        style={{
          fontSize: "clamp(28px, 3.2vw, 40px)",
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {heading}
      </h2>
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────

function Divider({ color = "rgba(37,99,235,0.2)" }: { color?: string }) {
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
        marginInline: 48,
      }}
    />
  );
}

// ── Live status panel ─────────────────────────────────────────────────────────

function LivePanel() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isLive = !loading && data?.status === "ok";
  const hitRate = data?.cache?.hitRatePct ?? null;
  const latency = data?.load?.avgLatencyMs ?? null;
  const redisMs = data?.load?.avgRedisLatencyMs ?? null;
  const assets  = data?.db?.totalAssets ?? null;

  const rows = [
    { label: "Cache Hit Rate", value: hitRate !== null ? `${hitRate.toFixed(0)}%` : "—", color: healthColor(hitRate, 70) },
    { label: "Avg Latency",    value: latency !== null ? `${latency.toFixed(0)}ms` : "—", color: healthColor(latency, 20, false) },
    { label: "Redis Latency",  value: redisMs !== null ? `${redisMs.toFixed(1)}ms` : "—", color: healthColor(redisMs, 5, false) },
    { label: "Total Assets",   value: assets  !== null ? String(assets)  : "—", color: "var(--text)" },
  ];

  return (
    <div
      style={{
        borderRadius: 12,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderTop: "2px solid rgba(37,99,235,0.55)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        overflow: "hidden",
        width: "100%",
        maxWidth: 340,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-geist-mono)",
            color: "var(--text-2)",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            fontWeight: 600,
          }}
        >
          Pipeline Status
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="live-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: loading ? "#d97706" : isLive ? "var(--green)" : "#dc2626",
              boxShadow: isLive ? "0 0 8px rgba(5,150,105,0.5)" : loading ? "0 0 8px rgba(217,119,6,0.5)" : "none",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-geist-mono)",
              letterSpacing: "0.07em",
              color: loading ? "#d97706" : isLive ? "#059669" : "#dc2626",
              fontWeight: 600,
            }}
          >
            {loading ? "CHECKING" : isLive ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Metrics 2×2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          background: "var(--border)",
        }}
      >
        {rows.map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--surface)", padding: "18px 20px" }}>
            <div
              style={{
                fontSize: 9,
                fontFamily: "var(--font-geist-mono)",
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                marginBottom: 8,
              }}
            >
              {label}
            </div>
            {loading ? (
              <div className="skeleton-shimmer" style={{ height: 28, width: "58%", borderRadius: 5 }} />
            ) : (
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: "var(--font-geist-mono)",
                  color,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pipeline trace */}
      <div
        style={{
          padding: "12px 18px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        {(
          [
            ["Upload", "#2563eb"],
            ["Redis", "#059669"],
            ["CDN", "#ea580c"],
            ["Browser", "var(--text-3)"],
          ] as [string, string][]
        ).map(([label, color], i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <span
              style={{
                fontSize: 10,
                fontFamily: "var(--font-geist-mono)",
                fontWeight: 600,
                color,
                letterSpacing: "0.04em",
                padding: "0 5px",
              }}
            >
              {label}
            </span>
            {i < 3 && (
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path
                  d="M1 3.5h8M5.5 1l3 2.5-3 2.5"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Metrics strip ─────────────────────────────────────────────────────────────

function MetricsStrip() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    {
      label: "Cache Hit Rate",
      value: data?.cache?.hitRatePct != null ? `${data.cache.hitRatePct.toFixed(0)}%` : "—",
      color: healthColor(data?.cache?.hitRatePct ?? null, 70),
      sub: "last 20 requests",
      accent: "#059669",
    },
    {
      label: "Avg API Latency",
      value: data?.load?.avgLatencyMs != null ? `${data.load.avgLatencyMs.toFixed(0)}ms` : "—",
      color: healthColor(data?.load?.avgLatencyMs ?? null, 20, false),
      sub: "end-to-end",
      accent: "#2563eb",
    },
    {
      label: "Redis Latency",
      value: data?.load?.avgRedisLatencyMs != null ? `${data.load.avgRedisLatencyMs.toFixed(1)}ms` : "—",
      color: healthColor(data?.load?.avgRedisLatencyMs ?? null, 5, false),
      sub: "cache round-trip",
      accent: "#059669",
    },
    {
      label: "Avg Payload",
      value: data?.load?.avgPayloadKB ?? "—",
      color: "var(--text)",
      sub: "per response",
      accent: "#ea580c",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4"
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
      }}
    >
      {metrics.map(({ label, value, color, sub, accent }, i) => (
        <div
          key={label}
          style={{
            padding: "24px 32px",
            borderRight: i < 3 ? "1px solid var(--border)" : undefined,
            borderLeft: `3px solid ${accent}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: "var(--font-geist-mono)",
              color: "var(--text-2)",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              marginBottom: 12,
            }}
          >
            {label}
          </div>
          {loading ? (
            <div className="skeleton-shimmer" style={{ height: 38, width: "55%", borderRadius: 6, marginBottom: 8 }} />
          ) : (
            <div
              style={{
                fontSize: 38,
                fontWeight: 800,
                fontFamily: "var(--font-geist-mono)",
                color,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {value}
            </div>
          )}
          <div style={{ fontSize: 11, fontFamily: "var(--font-geist-mono)", color: "var(--text-3)", letterSpacing: "0.02em" }}>
            {sub}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Pipeline card ─────────────────────────────────────────────────────────────

function PipelineCard({ step, icon, isLast }: { step: (typeof PIPELINE_STEPS)[number]; icon: React.ReactNode; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", flex: "1 1 220px", minWidth: 0 }}>
      <Link
        href={step.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1,
          borderRadius: 12,
          padding: "24px 20px",
          background: hovered ? "var(--surface-2)" : "var(--surface)",
          border: `1px solid ${hovered ? step.accent + "35" : "var(--border)"}`,
          borderTop: `2px solid ${hovered ? step.accent + "cc" : step.accent + "60"}`,
          boxShadow: hovered ? `0 8px 32px ${step.accent}14` : "0 1px 4px rgba(0,0,0,0.04)",
          transition: "all 220ms ease",
          textDecoration: "none",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-geist-mono)",
              color: step.accent,
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            STEP {step.num}
          </span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: step.accent + "12",
              border: `1px solid ${step.accent}25`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: step.accent,
              transition: "transform 220ms",
              transform: hovered ? "scale(1.08)" : "scale(1)",
            }}
          >
            {icon}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 5, letterSpacing: "-0.02em" }}>
            {step.label}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
            {step.desc}
          </div>
        </div>

        <div
          style={{
            fontSize: 10,
            fontFamily: "var(--font-geist-mono)",
            color: step.accent,
            background: step.accent + "10",
            border: `1px solid ${step.accent}20`,
            padding: "4px 9px",
            borderRadius: 5,
            display: "inline-block",
            width: "fit-content",
            letterSpacing: "0.05em",
          }}
        >
          {step.tag}
        </div>
      </Link>

      {!isLast && (
        <div style={{ padding: "0 8px", flexShrink: 0 }}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path
              d="M1 5h12M8 1.5l4 3.5-4 3.5"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Capability card ───────────────────────────────────────────────────────────

function CapabilityCard({ cap, icon }: { cap: (typeof CAPABILITIES)[number]; icon: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12,
        padding: "32px 24px",
        background: "var(--surface)",
        border: `1px solid ${hovered ? cap.accent + "35" : "var(--border)"}`,
        boxShadow: hovered ? `0 12px 48px ${cap.accent}12, 0 2px 8px rgba(0,0,0,0.04)` : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "all 260ms ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient tint */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: cap.accent + "0e",
          filter: "blur(60px)",
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 400ms",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: cap.accent + "12",
          border: `1px solid ${cap.accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: cap.accent,
          marginBottom: 22,
          transition: "transform 220ms",
          transform: hovered ? "scale(1.06)" : "scale(1)",
        }}
      >
        {icon}
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 10, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
        {cap.title}
      </h3>
      <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 24, flexGrow: 1 }}>
        {cap.desc}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {cap.bullets.map((b) => (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: cap.accent,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>{b}</span>
          </div>
        ))}
      </div>

      <Link
        href={cap.href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          color: cap.accent,
          textDecoration: "none",
          transition: "gap 180ms",
        }}
      >
        {cap.cta}
        {Icons.arrowSmall}
      </Link>
    </div>
  );
}

// ── Asset card ────────────────────────────────────────────────────────────────

function AssetCard({ item }: { item: MediaItem }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const accent = CATEGORY_ACCENT[item.category] ?? "#2563eb";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${hovered ? accent + "30" : "var(--border)"}`,
        transition: "all 220ms ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 24px ${accent}0c, 0 2px 8px rgba(0,0,0,0.06)` : "0 1px 4px rgba(0,0,0,0.04)",
        background: "var(--surface)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "16/10",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${accent}0c 0%, rgba(0,0,0,0.04) 100%)`,
        }}
      >
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cdnUrl(item.cloudinaryPublicId)}
            alt={item.title}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 380ms ease",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(2, 1fr)",
              gap: 3,
              padding: 10,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 5, background: accent + (i % 3 === 0 ? "20" : "0e") }} />
            ))}
          </div>
        )}

        {item.type === "video" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="10" height="11" viewBox="0 0 10 11" fill="none">
                <path d="M2 1.5L8.5 5.5 2 9.5V1.5z" fill={accent} />
              </svg>
            </div>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 8,
            left: 9,
            fontSize: 9,
            fontFamily: "var(--font-geist-mono)",
            fontWeight: 700,
            color: accent,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(4px)",
            padding: "2px 7px",
            borderRadius: 4,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            border: `1px solid ${accent}25`,
          }}
        >
          {item.category}
        </div>
      </div>

      <div style={{ padding: "10px 12px 11px" }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.005em" }}>
          {item.title}
        </p>
      </div>
    </div>
  );
}

function AssetCardSkeleton() {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div className="skeleton-shimmer" style={{ width: "100%", aspectRatio: "16/10" }} />
      <div style={{ padding: "10px 12px 11px" }}>
        <div className="skeleton-shimmer" style={{ height: 12, borderRadius: 4, width: "60%" }} />
      </div>
    </div>
  );
}

function AssetLibraryGrid() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : Array.isArray(d?.assets) ? d.assets : [];
        setItems(arr.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <AssetCardSkeleton key={i} />)
        : items.map((item) => <AssetCard key={item.id} item={item} />)}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function HomepageClient() {
  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "calc(100vh - 52px)",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Blue tint glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 50% 50% at 60% 30%, rgba(37,99,235,0.07) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        {/* Bottom fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 140,
            background: "linear-gradient(to bottom, transparent, var(--bg))",
            pointerEvents: "none",
          }}
        />

        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center"
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "96px 48px 108px",
            width: "100%",
            gap: 72,
          }}
        >
          {/* ── Copy ── */}
          <div style={{ maxWidth: 600 }}>
            {/* Status badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(5,150,105,0.08)",
                border: "1px solid rgba(5,150,105,0.2)",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 36,
              }}
            >
              <span
                className="live-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--green)",
                  boxShadow: "0 0 8px rgba(5,150,105,0.6)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-geist-mono)",
                  color: "#059669",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                MLRIT INTERNAL PLATFORM · LIVE
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(44px, 6vw, 76px)",
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: "-0.045em",
                color: "var(--text)",
                marginBottom: 24,
              }}
            >
              Upload. Optimize.
              <br />
              <span
                style={{
                  background: "linear-gradient(115deg, #1d4ed8 0%, #0891b2 55%, #059669 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Deliver at speed.
              </span>
            </h1>

            {/* Subheadline */}
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.75,
                color: "var(--text-2)",
                maxWidth: 490,
                marginBottom: 48,
                fontWeight: 400,
              }}
            >
              The internal media asset performance pipeline for MLRIT. Upload,
              benchmark CDN delivery across 5 quality variants, and certify
              zero-lag performance — before anything goes live on the college
              website.
            </p>

            {/* CTA row */}
            <div style={{ display: "flex", gap: 12 }}>
              <Link
                href="/test-lab"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "13px 26px",
                  borderRadius: 10,
                  textDecoration: "none",
                  boxShadow: "0 2px 12px rgba(37,99,235,0.32), 0 1px 0 rgba(255,255,255,0.1) inset",
                  letterSpacing: "-0.01em",
                }}
              >
                Run Benchmark
                {Icons.arrow}
              </Link>

              <Link
                href="/upload"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--border-2)",
                  color: "var(--text)",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "13px 26px",
                  borderRadius: 10,
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                Upload Assets
              </Link>
            </div>

            {/* Tech stack row */}
            <div style={{ display: "flex", gap: 8, marginTop: 36, flexWrap: "wrap", alignItems: "center" }}>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-geist-mono)",
                  color: "var(--text-3)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginRight: 4,
                }}
              >
                Stack
              </span>
              {(
                [
                  ["Redis", "#dc2626"],
                  ["Cloudinary", "#ea580c"],
                  ["Upstash", "#7c3aed"],
                  ["Next.js 16", "var(--text-2)"],
                  ["Prisma", "#0891b2"],
                ] as [string, string][]
              ).map(([label, color]) => (
                <span
                  key={label}
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-geist-mono)",
                    color,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "4px 10px",
                    letterSpacing: "0.04em",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Live panel ── */}
          <LivePanel />
        </div>

        {/* Scroll hint */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: "var(--font-geist-mono)",
              color: "var(--text-3)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <svg width="13" height="17" viewBox="0 0 13 17" fill="none">
            <rect x="4" y="0.5" width="5" height="9" rx="2.5" stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none" />
            <circle cx="6.5" cy="3.5" r="1" fill="rgba(0,0,0,0.25)" className="scroll-dot" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* METRICS STRIP                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <MetricsStrip />

      <Divider color="rgba(37,99,235,0.2)" />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PIPELINE                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: "var(--surface-2)",
          borderTop: "1px solid var(--border)",
          padding: "88px 48px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <SectionHeader overline="How it works" heading="The pipeline" accent="#2563eb" />

          <div style={{ display: "flex", gap: 0, alignItems: "stretch", flexWrap: "wrap" }}>
            {PIPELINE_STEPS.map((step, i) => (
              <PipelineCard key={step.num} step={step} icon={PIPELINE_ICONS[i]} isLast={i === PIPELINE_STEPS.length - 1} />
            ))}
          </div>
        </div>
      </section>

      <Divider color="rgba(37,99,235,0.16)" />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CAPABILITIES                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "104px 48px",
        }}
      >
        <SectionHeader overline="Platform features" heading="Built for every stage" accent="#7c3aed" />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {CAPABILITIES.map((cap, i) => (
            <CapabilityCard key={cap.id} cap={cap} icon={CAPABILITY_ICONS[i]} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ASSET LIBRARY                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: "var(--surface-2)",
          borderTop: "1px solid var(--border)",
          padding: "104px 48px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52 }}>
            <SectionHeader overline="Verified & CDN-optimized" heading="Asset Library" accent="#059669" />

            <Link
              href="/gallery"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--accent)",
                textDecoration: "none",
                padding: "10px 18px",
                borderRadius: 8,
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.18)",
                whiteSpace: "nowrap",
                marginBottom: 64,
                transition: "background 180ms",
              }}
            >
              Full library
              {Icons.arrowSmall}
            </Link>
          </div>

          <AssetLibraryGrid />
        </div>
      </section>

      <Divider color="rgba(5,150,105,0.2)" />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "60px 48px 40px",
          background: "var(--surface)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1fr",
              gap: 56,
              marginBottom: 48,
            }}
          >
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
                  MLRIT
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "var(--font-geist-mono)",
                    fontWeight: 700,
                    color: "#059669",
                    background: "rgba(5,150,105,0.1)",
                    border: "1px solid rgba(5,150,105,0.22)",
                    padding: "3px 7px",
                    borderRadius: 4,
                    letterSpacing: "0.1em",
                  }}
                >
                  MEDIA PLATFORM
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 270 }}>
                Internal media asset performance pipeline. Upload, benchmark, and
                certify assets before production deployment on mlrit.ac.in.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-geist-mono)",
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  marginBottom: 20,
                }}
              >
                Platform
              </div>
              {[
                ["Upload Assets", "/upload"],
                ["Benchmark Lab", "/test-lab"],
                ["Asset Library", "/gallery"],
                ["Performance Dashboard", "/dashboard"],
              ].map(([label, href]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <Link href={href} style={{ fontSize: 13, color: "var(--text-2)", textDecoration: "none" }}>
                    {label}
                  </Link>
                </div>
              ))}
            </div>

            {/* Infrastructure */}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-geist-mono)",
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  marginBottom: 20,
                }}
              >
                Infrastructure
              </div>
              {(
                [
                  ["Upstash Redis", "#7c3aed"],
                  ["Cloudinary CDN", "#ea580c"],
                  ["Next.js 16 + Turbopack", "var(--text-2)"],
                  ["Prisma + SQLite", "#0891b2"],
                ] as [string, string][]
              ).map(([label, color]) => (
                <div key={label} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: color, opacity: 0.7, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 22,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--text-3)" }}>
              © 2026 MLRIT · Internal platform — not for public distribution
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className="live-dot"
                style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 5px rgba(5,150,105,0.5)" }}
              />
              <span style={{ fontSize: 11, fontFamily: "var(--font-geist-mono)", color: "#059669", letterSpacing: "0.07em" }}>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
