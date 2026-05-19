"use client";

import { useState, useCallback } from "react";

// ─── Variants ─────────────────────────────────────────────────────────────────

const VARIANTS = [
  { label: "144p",  width: 256,  height: 144,  accent: "#00ff88" },
  { label: "360p",  width: 640,  height: 360,  accent: "#22c55e" },
  { label: "480p",  width: 854,  height: 480,  accent: "#eab308" },
  { label: "720p",  width: 1280, height: 720,  accent: "#f97316" },
  { label: "1080p", width: 1920, height: 1080, accent: "#ef4444" },
] as const;

type Label = (typeof VARIANTS)[number]["label"];

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "idle" | "running" | "done";

interface VariantResult {
  label: Label;
  width: number;
  height: number;
  ttfbMs: number;
  totalMs: number;
  bodyMs: number;
  bytes: number;
  format: string;
  httpStatus: number;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

function buildUrl(publicId: string, width: number, height: number) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_${width},h_${height},c_fill,f_auto,q_auto/${publicId}`;
}

function fmtMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

function fmtKB(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function latColor(ms: number) {
  if (ms < 50)  return "var(--green)";
  if (ms < 150) return "#eab308";
  if (ms < 400) return "#f97316";
  return "var(--red)";
}

function parseFormat(ct: string): string {
  const map: Record<string, string> = {
    "image/webp": "WEBP", "image/avif": "AVIF",
    "image/jpeg": "JPEG", "image/png": "PNG",
  };
  return map[ct] ?? ct.split("/")[1]?.toUpperCase() ?? "—";
}

function deltaPct(val: number, base: number): string {
  if (!base) return "—";
  const d = ((val - base) / base) * 100;
  if (Math.abs(d) < 1) return "baseline";
  return `${d > 0 ? "+" : ""}${d.toFixed(0)}%`;
}

async function measure(publicId: string, v: (typeof VARIANTS)[number]): Promise<VariantResult> {
  const url = buildUrl(publicId, v.width, v.height);
  const t0 = performance.now();
  const res = await fetch(url, { cache: "no-store" });
  const ttfbMs = performance.now() - t0;

  if (!res.ok) {
    return { label: v.label, width: v.width, height: v.height, ttfbMs: Math.round(ttfbMs), totalMs: Math.round(ttfbMs), bodyMs: 0, bytes: 0, format: "—", httpStatus: res.status, error: `HTTP ${res.status}` };
  }

  const blob = await res.blob();
  const totalMs = performance.now() - t0;
  return {
    label: v.label,
    width: v.width,
    height: v.height,
    ttfbMs: Math.round(ttfbMs),
    totalMs: Math.round(totalMs),
    bodyMs: Math.round(totalMs - ttfbMs),
    bytes: blob.size,
    format: parseFormat(res.headers.get("content-type") ?? ""),
    httpStatus: res.status,
  };
}

// ─── Bar ──────────────────────────────────────────────────────────────────────

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const w = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 44, textAlign: "right", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-2)", flexShrink: 0 }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 22, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─── Split Bar (TTFB + body) ───────────────────────────────────────────────────

function SplitBar({ r, i, maxMs }: { r: VariantResult; i: number; maxMs: number }) {
  const totalW = maxMs > 0 ? (r.totalMs / maxMs) * 100 : 0;
  const ttfbW  = r.totalMs > 0 ? (r.ttfbMs / r.totalMs) * 100 : 50;
  const bodyW  = 100 - ttfbW;
  const accent = VARIANTS[i]?.accent ?? "#0066ff";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 44, textAlign: "right", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-2)", flexShrink: 0 }}>
        {r.label}
      </div>
      <div style={{ flex: 1, height: 22, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${totalW}%`, height: "100%", display: "flex", transition: "width 0.6s ease" }}>
          <div style={{ width: `${ttfbW}%`, height: "100%", background: "var(--green)" }} title={`TTFB: ${fmtMs(r.ttfbMs)}`} />
          <div style={{ width: `${bodyW}%`, height: "100%", background: accent }} title={`Body: ${fmtMs(r.bodyMs)}`} />
        </div>
      </div>
      <div style={{ width: 140, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-2)", flexShrink: 0 }}>
        <span style={{ color: "var(--green)" }}>{fmtMs(r.ttfbMs)}</span>
        <span style={{ color: "var(--text-3)" }}> + </span>
        <span style={{ color: accent }}>{fmtMs(r.bodyMs)}</span>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LibraryAsset { id: string; cloudinaryPublicId: string; title: string; thumbnailUrl: string }

export function QualityTester() {
  const [publicId, setPublicId] = useState("");
  const [status,   setStatus]   = useState<Status>("idle");
  const [active,   setActive]   = useState<Label | null>(null);
  const [results,  setResults]  = useState<VariantResult[]>([]);
  const [runN,     setRunN]     = useState(0);
  const [library,  setLibrary]  = useState<LibraryAsset[]>([]);
  const [libOpen,  setLibOpen]  = useState(false);
  const [libLoading, setLibLoading] = useState(false);

  async function loadLibrary() {
    if (library.length > 0) { setLibOpen(o => !o); return; }
    setLibLoading(true);
    setLibOpen(true);
    try {
      const res = await fetch("/api/assets?type=image");
      const json = await res.json();
      setLibrary((json.assets ?? []).map((a: any) => ({
        id: a.id,
        cloudinaryPublicId: a.cloudinaryPublicId,
        title: a.title,
        thumbnailUrl: a.thumbnailUrl,
      })));
    } catch {
      setLibOpen(false);
    }
    setLibLoading(false);
  }

  const run = useCallback(async () => {
    if (!publicId.trim()) return;
    setStatus("running");
    setResults([]);
    setActive(null);
    setRunN(n => n + 1);

    const out: VariantResult[] = [];
    for (const v of VARIANTS) {
      setActive(v.label);
      try {
        out.push(await measure(publicId.trim(), v));
      } catch (e: unknown) {
        out.push({ label: v.label, width: v.width, height: v.height, ttfbMs: 0, totalMs: 0, bodyMs: 0, bytes: 0, format: "—", httpStatus: 0, error: e instanceof Error ? e.message : "fetch failed" });
      }
      setResults([...out]);
    }
    setActive(null);
    setStatus("done");
  }, [publicId]);

  const good = results.filter(r => !r.error);
  const base = good[0];
  const maxMs    = good.length ? Math.max(...good.map(r => r.totalMs))  : 1;
  const maxBytes = good.length ? Math.max(...good.map(r => r.bytes))    : 1;

  const summaryLine = good.length >= 2 ? (() => {
    const hi = good[good.length - 1];
    return {
      text: `${base.label} baseline: ${fmtMs(base.totalMs)} / ${fmtKB(base.bytes)}  →  ${hi.label} max: ${fmtMs(hi.totalMs)} / ${fmtKB(hi.bytes)}`,
      timeDelta:  deltaPct(hi.totalMs, base.totalMs),
      sizeDelta:  deltaPct(hi.bytes,   base.bytes),
      formats: [...new Set(good.map(r => r.format))].join(", "),
    };
  })() : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ color: "var(--text)" }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px clamp(12px, 4vw, 24px)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              Quality Variant Benchmark
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
              144p → 1080p · real Cloudinary fetches · TTFB + payload measured per variant
            </p>
          </div>

          {good.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {[
                { label: "variants", val: `${good.length}/5`,                      color: "var(--green)" },
                { label: "best",     val: fmtMs(Math.min(...good.map(r=>r.totalMs))), color: "var(--green)" },
                { label: "worst",    val: fmtMs(maxMs),                             color: latColor(maxMs) },
                { label: "max size", val: fmtKB(maxBytes),                          color: "var(--text)" },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", minWidth: 72, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px clamp(12px, 4vw, 24px)", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Input + Run ── */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 10, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
            Cloudinary Public ID
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={publicId}
              onChange={e => setPublicId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !status.startsWith("run") && run()}
              disabled={status === "running"}
              placeholder="mlrit/convocation-2024"
              style={{
                flex: 1, background: "var(--surface-2)", border: "1px solid var(--border-2)",
                borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--text)",
                fontFamily: "var(--font-mono)", outline: "none",
                opacity: status === "running" ? 0.5 : 1,
              }}
            />
            <button
              onClick={run}
              disabled={status === "running" || !publicId.trim()}
              style={{
                padding: "10px 22px", background: status === "running" ? "var(--surface-3)" : "var(--green)",
                color: "#0a0f0a", border: "none", borderRadius: 8, fontSize: 13,
                fontWeight: 700, cursor: status === "running" ? "not-allowed" : "pointer",
                transition: "background 0.2s", whiteSpace: "nowrap",
                opacity: !publicId.trim() ? 0.4 : 1,
              }}
            >
              {status === "running" ? `Measuring ${active}…` : "Run All"}
            </button>
            {results.length > 0 && status !== "running" && (
              <button
                onClick={() => { setResults([]); setStatus("idle"); }}
                style={{ padding: "10px 16px", background: "transparent", border: "1px solid var(--border-2)", borderRadius: 8, fontSize: 12, color: "var(--text-2)", cursor: "pointer" }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Library picker */}
          <div style={{ marginTop: 10 }}>
            <button
              onClick={loadLibrary}
              disabled={libLoading}
              style={{
                fontSize: 11, fontFamily: "var(--font-mono)", color: libOpen ? "var(--green)" : "var(--text-3)",
                background: "transparent", border: "none", cursor: "pointer", padding: 0,
              }}
            >
              {libLoading ? "Loading library…" : libOpen ? "▲ hide library" : "▼ pick from library"}
            </button>
            {libOpen && !libLoading && (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 8, marginTop: 8, maxHeight: 240, overflowY: "auto",
                background: "var(--surface-2)", borderRadius: 8, padding: 10,
                border: "1px solid var(--border)",
              }}>
                {library.length === 0 ? (
                  <p style={{ gridColumn: "1/-1", margin: 0, fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                    No images yet — upload one first.
                  </p>
                ) : library.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setPublicId(a.cloudinaryPublicId); setLibOpen(false); }}
                    title={a.title}
                    style={{
                      background: publicId === a.cloudinaryPublicId ? "rgba(0,255,136,0.08)" : "var(--surface)",
                      border: `1px solid ${publicId === a.cloudinaryPublicId ? "rgba(0,255,136,0.4)" : "var(--border)"}`,
                      borderRadius: 6, padding: 4, cursor: "pointer", overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.thumbnailUrl} alt={a.title} style={{ width: "100%", height: 72, objectFit: "cover", borderRadius: 4, display: "block" }} />
                    <p style={{ margin: "4px 0 0", fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--text-3)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {a.title}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Variant progress pills */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {VARIANTS.map((v) => {
              const r = results.find(x => x.label === v.label);
              const isActive = active === v.label;
              return (
                <div key={v.label} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 10px", borderRadius: 999,
                  border: `1px solid ${r && !r.error ? v.accent + "50" : isActive ? v.accent : "var(--border)"}`,
                  background: r && !r.error ? v.accent + "12" : isActive ? v.accent + "08" : "transparent",
                  fontSize: 11, fontWeight: 700,
                  color: r && !r.error ? v.accent : isActive ? v.accent : "var(--text-3)",
                  transition: "all 0.2s",
                }}>
                  {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.accent, display: "inline-block", animation: "pulse 1s infinite" }} />}
                  {v.label}
                  <span style={{ fontWeight: 400, opacity: 0.5, fontSize: 10 }}>{v.width}px</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Charts ── */}
        {good.length >= 2 && (
          <>
            {/* Two bar charts side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Load Time */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 10, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>
                  Total Load Time <span style={{ color: "var(--text-3)", textTransform: "none" }}>(lower = better)</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {good.map((r, i) => (
                    <div key={r.label}>
                      <Bar value={r.totalMs} max={maxMs} color={VARIANTS[i]?.accent ?? "#0066ff"} label={r.label} />
                      <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 11, color: latColor(r.totalMs), fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        {fmtMs(r.totalMs)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payload Size */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 10, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>
                  Payload Size <span style={{ color: "var(--text-3)", textTransform: "none" }}>(lower = better)</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {good.map((r, i) => (
                    <div key={r.label}>
                      <Bar value={r.bytes} max={maxBytes} color={VARIANTS[i]?.accent ?? "#0066ff"} label={r.label} />
                      <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 11, color: "var(--text-2)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        {fmtKB(r.bytes)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TTFB vs Body split */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 10, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>
                TTFB vs Body Download Split
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 14 }}>
                <span style={{ color: "var(--green)" }}>■ green</span> = time to first byte (server) &nbsp;·&nbsp;
                <span style={{ color: "var(--text-2)" }}>■ colored</span> = body download (network bandwidth)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {good.map((r, i) => (
                  <SplitBar key={r.label} r={r} i={i} maxMs={maxMs} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Data Table ── */}
        {results.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 2 }}>
                Benchmark Results
                {runN > 0 && <span style={{ marginLeft: 10, background: "var(--surface-2)", padding: "2px 8px", borderRadius: 4, color: "var(--text-3)" }}>Run #{runN}</span>}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-3)" }}>single fetch · cache: no-store</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Variant", "Resolution", "Format", "TTFB", "Total Time", "Body DL", "Payload", "vs 144p Time", "vs 144p Size"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const accent = VARIANTS[i]?.accent ?? "#0066ff";
                    const isBase = i === 0;
                    return (
                      <tr key={r.label} style={{ borderBottom: "1px solid var(--surface-2)" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        {/* Variant */}
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: accent + "18", color: accent, border: `1px solid ${accent}30` }}>
                            {r.label}
                          </span>
                        </td>
                        {/* Resolution */}
                        <td style={{ padding: "12px 16px", color: r.error ? "var(--red)" : "var(--text-2)" }}>
                          {r.error ? r.error : `${r.width}×${r.height}`}
                        </td>
                        {/* Format */}
                        <td style={{ padding: "12px 16px" }}>
                          {r.format !== "—" ? (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: (r.format === "WEBP" || r.format === "AVIF") ? "rgba(0,255,136,0.12)" : "var(--surface-2)", color: (r.format === "WEBP" || r.format === "AVIF") ? "var(--green)" : "var(--text-2)" }}>
                              {r.format}
                            </span>
                          ) : <span style={{ color: "var(--text-3)" }}>—</span>}
                        </td>
                        {/* TTFB */}
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: r.error ? "var(--text-3)" : latColor(r.ttfbMs) }}>
                          {r.error ? "—" : fmtMs(r.ttfbMs)}
                        </td>
                        {/* Total */}
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: r.error ? "var(--text-3)" : latColor(r.totalMs) }}>
                          {r.error ? "—" : fmtMs(r.totalMs)}
                        </td>
                        {/* Body DL */}
                        <td style={{ padding: "12px 16px", color: "var(--text-2)" }}>
                          {r.error ? "—" : fmtMs(r.bodyMs)}
                        </td>
                        {/* Payload */}
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: r.error ? "var(--text-3)" : "var(--text)" }}>
                          {r.error ? "—" : fmtKB(r.bytes)}
                        </td>
                        {/* vs 144p Time */}
                        <td style={{ padding: "12px 16px" }}>
                          {r.error ? <span style={{ color: "var(--text-3)" }}>—</span>
                          : isBase ? <span style={{ fontSize: 10, padding: "2px 6px", background: "var(--surface-2)", borderRadius: 4, color: "var(--text-3)" }}>baseline</span>
                          : base ? <span style={{ fontWeight: 700, color: r.totalMs > base.totalMs ? "var(--red)" : "var(--green)" }}>{deltaPct(r.totalMs, base.totalMs)}</span>
                          : <span style={{ color: "var(--text-3)" }}>—</span>}
                        </td>
                        {/* vs 144p Size */}
                        <td style={{ padding: "12px 16px" }}>
                          {r.error ? <span style={{ color: "var(--text-3)" }}>—</span>
                          : isBase ? <span style={{ fontSize: 10, padding: "2px 6px", background: "var(--surface-2)", borderRadius: 4, color: "var(--text-3)" }}>baseline</span>
                          : base ? <span style={{ fontWeight: 700, color: r.bytes > base.bytes ? "#f97316" : "var(--green)" }}>{deltaPct(r.bytes, base.bytes)}</span>
                          : <span style={{ color: "var(--text-3)" }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Summary Line ── */}
        {summaryLine && status === "done" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 24px" }}>
            <div style={{ fontSize: 9, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Summary</div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
              {summaryLine.text}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-3)", lineHeight: 1.6 }}>
              {base?.label} → {good[good.length - 1]?.label}:{" "}
              <span style={{ color: "var(--amber)" }}>{summaryLine.timeDelta} slower</span>
              {" · "}
              <span style={{ color: "#f97316" }}>{summaryLine.sizeDelta} larger</span>
              {" · "}
              format served: <span style={{ color: "var(--green)" }}>{summaryLine.formats}</span>
            </p>
          </div>
        )}

        {/* ── Idle empty state ── */}
        {status === "idle" && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 24px", border: "1px dashed var(--border-2)", borderRadius: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>📊</div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>
              Enter a Cloudinary public ID and click{" "}
              <span style={{ color: "var(--green)", fontWeight: 700 }}>Run All</span>
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-3)" }}>
              Fetches 5 quality levels and measures TTFB, total time, and payload for each.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
