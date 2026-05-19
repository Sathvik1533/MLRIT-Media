"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StatsResponse {
  status: string;
  db: { health: string; totalAssets: number };
  cache: {
    configured: boolean;
    provider: string;
    hitRatePct: number;
    hitCount: number;
    missCount: number;
    sampledFrom: number;
  };
  load: {
    requestsPerMinute: number;
    avgLatencyMs: number;
    avgRedisLatencyMs: number | null;
    avgPayloadBytes: number;
    avgPayloadKB: string;
    lastCheckedMs: number;
  };
  timestamp: string;
}

// ── Color helpers ──────────────────────────────────────────────────────────────

function latencyColor(ms: number): string {
  if (ms < 100)  return "var(--green)";
  if (ms < 500)  return "var(--amber)";
  return "var(--red)";
}

function hitRateColor(pct: number): string {
  if (pct >= 70) return "var(--green)";
  if (pct >= 40) return "var(--amber)";
  return "var(--red)";
}

function fmtMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

function timeSince(iso: string): string {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  return `${Math.round(diff / 60)}m ago`;
}

// ── Subcomponents ──────────────────────────────────────────────────────────────

function KpiCard({
  label, value, unit, color, sub,
}: {
  label: string; value: string | number; unit?: string; color?: string; sub?: string;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 transition-all duration-300"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <span
        className="text-xs font-mono uppercase tracking-widest"
        style={{ color: "var(--text-3)" }}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-3xl font-bold leading-none"
          style={{ fontFamily: "var(--font-geist-mono)", color: color ?? "var(--text)" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-mono" style={{ color: "var(--text-3)" }}>
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>{sub}</span>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p
        className="text-xs font-mono uppercase tracking-widest mb-4"
        style={{ color: "var(--text-3)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2.5">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: ok ? "var(--green)" : "var(--red)",
            boxShadow: ok ? "0 0 6px var(--green)" : "0 0 6px var(--red)",
          }}
        />
        <span className="text-sm" style={{ color: "var(--text-2)" }}>{label}</span>
      </div>
      <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>{value}</span>
    </div>
  );
}

function ToolCard({
  href, title, desc, tag,
}: { href: string; title: string; desc: string; tag: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      className="group rounded-xl p-5 flex flex-col gap-3 transition-all duration-200"
      style={{
        background: "var(--surface)",
        border: hovered ? "1px solid rgba(37,99,235,0.35)" : "1px solid var(--border)",
        boxShadow: hovered ? "0 8px 32px rgba(37,99,235,0.08)" : "none",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-mono px-2 py-0.5 rounded"
          style={{ background: "rgba(37,99,235,0.1)", color: "var(--accent)" }}
        >
          {tag}
        </span>
        <span style={{ color: "var(--text-3)" }}>→</span>
      </div>
      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{desc}</p>
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl h-28 skeleton-shimmer" />
      ))}
    </div>
  );
}

interface TopAsset {
  id: string;
  cloudinaryPublicId: string;
  title: string;
  category: string;
  views: number;
}

function TopAssets() {
  const [assets, setAssets] = useState<TopAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assets?sort=views&limit=8", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setAssets(d.assets ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 rounded-lg skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (!assets.length) {
    return (
      <p className="text-xs font-mono" style={{ color: "var(--text-3)" }}>
        No views recorded yet — open assets in the gallery.
      </p>
    );
  }

  const max = Math.max(assets[0]?.views ?? 1, 1);

  return (
    <div className="space-y-3">
      {assets.map((asset, i) => (
        <div key={asset.id} className="flex items-center gap-3">
          <span
            className="text-xs font-mono w-4 text-right flex-shrink-0"
            style={{ color: "var(--text-3)" }}
          >
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs font-medium truncate"
                style={{ color: "var(--text-2)" }}
              >
                {asset.title}
              </span>
              <span
                className="text-xs font-mono ml-3 flex-shrink-0"
                style={{ color: "var(--accent)" }}
              >
                {asset.views} views
              </span>
            </div>
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: "var(--surface-3)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(asset.views / max) * 100}%`,
                  background: "var(--accent)",
                  boxShadow: "0 0 6px rgba(0,102,255,0.35)",
                }}
              />
            </div>
          </div>
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-3)",
            }}
          >
            {asset.category}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────

export function DashboardClient() {
  const [stats, setStats]     = useState<StatsResponse | null>(null);
  const [error, setError]     = useState(false);
  const [lastAt, setLastAt]   = useState<string | null>(null);

  async function poll() {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      const data: StatsResponse = await res.json();
      setStats(data);
      setLastAt(new Date().toISOString());
      setError(false);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  const isOnline = stats?.status === "healthy";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <h1
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "var(--text)",
            }}
          >
            Media Performance Observatory
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
            Cloudinary CDN · Upstash Redis · SQLite — live metrics
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: stats ? (isOnline ? "var(--green)" : "var(--red)") : "var(--text-3)" }}>
          <span
            className="w-1.5 h-1.5 rounded-full live-dot"
            style={{ background: stats ? (isOnline ? "var(--green)" : "var(--red)") : "var(--text-3)" }}
          />
          {stats ? (isOnline ? "SYSTEM ONLINE" : "DEGRADED") : "CONNECTING…"}
          {lastAt && (
            <span style={{ color: "var(--text-3)" }}>· {timeSince(lastAt)}</span>
          )}
        </div>
      </div>

      {/* KPI row ─────────────────────────────────────────────────────────── */}
      {!stats ? (
        <Skeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <KpiCard
            label="Avg Latency"
            value={fmtMs(stats.load.avgLatencyMs)}
            color={latencyColor(stats.load.avgLatencyMs)}
            sub={`Redis: ${stats.load.avgRedisLatencyMs != null ? fmtMs(stats.load.avgRedisLatencyMs) : "N/A"}`}
          />
          <KpiCard
            label="Cache Hit Rate"
            value={stats.cache.hitRatePct}
            unit="%"
            color={hitRateColor(stats.cache.hitRatePct)}
            sub={`${stats.cache.sampledFrom} requests sampled`}
          />
          <KpiCard
            label="Avg Payload"
            value={stats.load.avgPayloadKB}
            unit="KB"
            sub={`${stats.load.avgPayloadBytes.toLocaleString()} bytes`}
          />
          <KpiCard
            label="Throughput"
            value={stats.load.requestsPerMinute}
            unit="req/min"
            sub={`${stats.load.lastCheckedMs}ms last request`}
          />
        </div>
      )}

      {/* Cache + System panels ───────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">

          {/* Cache Analysis */}
          <Panel title="Cache Analysis">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span style={{ color: "var(--green)" }}>HIT</span>
                  <span style={{ color: "var(--text-3)" }}>{stats.cache.hitCount} req</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.cache.sampledFrom ? (stats.cache.hitCount / stats.cache.sampledFrom) * 100 : 0}%`,
                      background: "var(--green)",
                      boxShadow: "0 0 8px rgba(0,255,136,0.4)",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span style={{ color: "var(--amber)" }}>MISS</span>
                  <span style={{ color: "var(--text-3)" }}>{stats.cache.missCount} req</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.cache.sampledFrom ? (stats.cache.missCount / stats.cache.sampledFrom) * 100 : 0}%`,
                      background: "var(--amber)",
                    }}
                  />
                </div>
              </div>
              <div
                className="pt-3 flex items-center justify-between text-xs font-mono"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span style={{ color: "var(--text-3)" }}>Hit rate</span>
                <span style={{ color: hitRateColor(stats.cache.hitRatePct) }}>
                  {stats.cache.hitRatePct}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span style={{ color: "var(--text-3)" }}>Provider</span>
                <span style={{ color: "var(--text-2)" }}>{stats.cache.provider}</span>
              </div>
            </div>
          </Panel>

          {/* System Status */}
          <Panel title="System Status">
            <div>
              <StatusRow
                label="Database"
                value={`SQLite · ${stats.db.health}`}
                ok={stats.db.health === "OK"}
              />
              <StatusRow
                label="Redis Cache"
                value={stats.cache.configured ? stats.cache.provider : "Not configured"}
                ok={stats.cache.configured}
              />
              <StatusRow
                label="CDN"
                value="Cloudinary · Active"
                ok={true}
              />
              <div
                className="flex items-center justify-between pt-3 text-xs font-mono"
                style={{ borderTop: "none" }}
              >
                <span style={{ color: "var(--text-3)" }}>Total assets</span>
                <span style={{ color: "var(--text-2)" }}>{stats.db.totalAssets}</span>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="rounded-xl p-4 mb-3 text-sm font-mono"
          style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)", color: "var(--red)" }}
        >
          Failed to reach /api/stats — retrying…
        </div>
      )}

      {/* Top Assets ──────────────────────────────────────────────────────── */}
      <div className="mb-3">
        <Panel title="Top Assets · By Views">
          <TopAssets />
        </Panel>
      </div>

      {/* Tool cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <ToolCard
          href="/upload"
          title="Upload & Stress Test"
          desc="Upload media directly to Cloudinary CDN. Trigger cache invalidation and observe MISS → HIT cycle in real time."
          tag="CDN · Cache"
        />
        <ToolCard
          href="/test-lab"
          title="Results Lab"
          desc="Benchmark the same asset at 144p → 1080p quality variants. Compare load time, payload size, and degradation curves."
          tag="Quality · Latency"
        />
        <ToolCard
          href="/gallery"
          title="Asset Monitor"
          desc="Browse indexed media assets. Filter by category and type. Each load fires a traced request visible in the dashboard."
          tag="Monitor · Trace"
        />
      </div>
    </div>
  );
}
