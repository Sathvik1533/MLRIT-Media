"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

type StageStatus = "idle" | "running" | "done" | "error";

interface Stage {
  status: StageStatus;
  label: string;
  detail: string;
  ms: number | null;
}

interface UploadedAsset {
  publicId: string;
  resourceType: "image" | "video";
  title: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

interface CycleResult {
  miss: { latencyMs: number; serverMs: number; payloadKB: string };
  hit:  { latencyMs: number; serverMs: number; payloadKB: string };
}

const CATEGORIES = ["events","campus","sports","academics","cultural","technical"] as const;
type Category = typeof CATEGORIES[number];

const ROLES = ["hero", "banner", "thumbnail", "featured"] as const;
type AssetRole = typeof ROLES[number];

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}
function fmtBytes(b: number) {
  return b >= 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
}

function makeStages(): Stage[] {
  return [
    { status: "idle", label: "Cloudinary CDN upload",   detail: "Direct browser → CDN, no server proxy", ms: null },
    { status: "idle", label: "Database persist",         detail: "Save metadata to SQLite",               ms: null },
    { status: "idle", label: "Cache invalidation",       detail: "Clear stale Redis keys",                ms: null },
  ];
}

// ── Copy button ────────────────────────────────────────────────────────────────

function CopyButton({ text, small }: { text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: small ? "4px 10px" : "5px 12px",
        borderRadius: 6,
        fontSize: small ? 10 : 11,
        fontFamily: "var(--font-geist-mono)",
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: copied ? "rgba(5,150,105,0.1)" : "var(--surface-2)",
        border: `1px solid ${copied ? "rgba(5,150,105,0.25)" : "var(--border)"}`,
        color: copied ? "var(--green)" : "var(--text-2)",
        cursor: "pointer",
        transition: "all 200ms",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {copied ? (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1 7V1.5A.5.5 0 011.5 1H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ── Stage row ──────────────────────────────────────────────────────────────────

function StageRow({ stage, index }: { stage: Stage; index: number }) {
  const colors: Record<StageStatus, { border: string; dot: string; text: string }> = {
    idle:    { border: "var(--border)", dot: "var(--surface-3)", text: "var(--text-3)" },
    running: { border: "rgba(37,99,235,0.25)", dot: "#2563eb", text: "var(--accent)" },
    done:    { border: "rgba(5,150,105,0.2)", dot: "var(--green)", text: "var(--green)" },
    error:   { border: "rgba(220,38,38,0.2)", dot: "#ef4444", text: "var(--red)" },
  };
  const c = colors[stage.status];

  return (
    <div
      className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300"
      style={{ border: `1px solid ${c.border}`, background: "var(--surface)" }}
    >
      <span className="text-xs font-mono w-4 text-center" style={{ color: "var(--text-3)" }}>
        {index + 1}
      </span>
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300"
        style={{
          background: c.dot,
          boxShadow: stage.status === "running"
            ? "0 0 8px rgba(37,99,235,0.6)"
            : stage.status === "done"
            ? "0 0 6px rgba(5,150,105,0.6)"
            : "none",
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{stage.label}</p>
        <p className="text-xs font-mono truncate" style={{ color: "var(--text-3)" }}>{stage.detail}</p>
      </div>
      {stage.status === "running" && (
        <span
          className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      )}
      {stage.status === "done" && stage.ms !== null && (
        <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--green)" }}>
          {fmtMs(stage.ms)}
        </span>
      )}
      {stage.status === "error" && (
        <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--red)" }}>FAIL</span>
      )}
    </div>
  );
}

// ── Production outputs panel ───────────────────────────────────────────────────

function OutputRow({
  label,
  icon,
  code,
  downloadUrl,
}: {
  label: string;
  icon: React.ReactNode;
  code: string;
  downloadUrl?: string;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--text-3)", display: "flex" }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>
            {label}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "var(--font-geist-mono)",
                fontWeight: 600,
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.2)",
                color: "var(--accent)",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v6M2 5.5L5 8.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Download
            </a>
          )}
          <CopyButton text={code} />
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--font-geist-mono)",
          color: "var(--text-2)",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "8px 12px",
          overflow: "hidden",
          whiteSpace: "pre",
          overflowX: "auto",
          lineHeight: 1.6,
          maxHeight: 120,
        }}
      >
        {code}
      </div>
    </div>
  );
}

function ProductionOutputs({ asset }: { asset: UploadedAsset }) {
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/${asset.resourceType}/upload`;
  const optimizedUrl = `${base}/f_auto,q_auto/${asset.publicId}`;
  const downloadUrl  = `${base}/fl_attachment/${asset.publicId}`;

  const htmlTag = asset.resourceType === "image"
    ? `<img\n  src="${optimizedUrl}"\n  loading="lazy"\n  decoding="async"\n  alt="${asset.title}"\n/>`
    : `<video\n  src="${optimizedUrl}"\n  preload="none"\n  controls\n  title="${asset.title}"\n></video>`;

  const nextSnippet = asset.resourceType === "image"
    ? `import Image from 'next/image';\n\n<Image\n  src="${optimizedUrl}"\n  alt="${asset.title}"${asset.width ? `\n  width={${asset.width}}` : ""}${asset.height ? `\n  height={${asset.height}}` : ""}\n  className="object-cover"\n/>`
    : `<video\n  src="${optimizedUrl}"\n  preload="none"\n  controls\n  className="w-full"\n/>`;

  const variants = [
    { label: "Thumb · 400px",  width: 400 },
    { label: "Small · 800px",  width: 800 },
    { label: "Medium · 1200px",width: 1200 },
    { label: "Full · 1920px",  width: 1920 },
  ].map(({ label, width }) => ({
    label,
    url: `${base}/f_auto,q_auto,w_${width}/${asset.publicId}`,
  }));

  return (
    <div
      style={{
        marginTop: 16,
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--green)",
              boxShadow: "0 0 8px rgba(5,150,105,0.6)",
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", letterSpacing: "0.01em" }}>
            Production Outputs
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-geist-mono)", color: "var(--text-3)" }}>
            {asset.format.toUpperCase()} · {fmtBytes(asset.bytes)}
          </span>
          <span
            style={{
              fontSize: 9,
              fontFamily: "var(--font-geist-mono)",
              fontWeight: 700,
              background: asset.resourceType === "video" ? "rgba(234,88,12,0.1)" : "rgba(37,99,235,0.1)",
              color: asset.resourceType === "video" ? "#ea580c" : "var(--accent)",
              border: `1px solid ${asset.resourceType === "video" ? "rgba(234,88,12,0.2)" : "rgba(37,99,235,0.2)"}`,
              padding: "2px 7px",
              borderRadius: 4,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {asset.resourceType}
          </span>
        </div>
      </div>

      {/* Output 1: Optimized URL */}
      <OutputRow
        label="Optimized URL"
        icon={
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1 6.5h11M6.5 1a9 9 0 010 11M6.5 1a9 9 0 000 11" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        }
        code={optimizedUrl}
      />

      {/* Output 2: Download */}
      <OutputRow
        label="Download File"
        icon={
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v7.5M3.5 6L6.5 9.5 9.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 11.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        }
        code={downloadUrl}
        downloadUrl={downloadUrl}
      />

      {/* Output 3: HTML tag */}
      <OutputRow
        label="HTML Tag"
        icon={
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M4 4L1 6.5 4 9M9 4l3 2.5L9 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 2.5L5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        }
        code={htmlTag}
      />

      {/* Output 4: React/Next.js */}
      <OutputRow
        label="React / Next.js"
        icon={
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" />
            <ellipse cx="6.5" cy="6.5" rx="5.5" ry="2.3" stroke="currentColor" strokeWidth="1.1" />
            <ellipse cx="6.5" cy="6.5" rx="5.5" ry="2.3" stroke="currentColor" strokeWidth="1.1" transform="rotate(60 6.5 6.5)" />
            <ellipse cx="6.5" cy="6.5" rx="5.5" ry="2.3" stroke="currentColor" strokeWidth="1.1" transform="rotate(120 6.5 6.5)" />
          </svg>
        }
        code={nextSnippet}
      />

      {/* Output 5: Responsive variants */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ color: "var(--text-3)", display: "flex" }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <rect x="3.5" y="6" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
              <path d="M5.5 11V9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              <path d="M7.5 11V9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>
            Responsive Variants
          </span>
        </div>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {variants.map(({ label, url }, i) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 12px",
                borderBottom: i < variants.length - 1 ? "1px solid var(--border)" : "none",
                background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-geist-mono)",
                  fontWeight: 600,
                  color: "var(--text-2)",
                  width: 96,
                  flexShrink: 0,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-geist-mono)",
                  color: "var(--text-3)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {url}
              </span>
              <CopyButton text={url} small />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Cache cycle result ─────────────────────────────────────────────────────────

function CycleCard({ result }: { result: CycleResult }) {
  const delta = result.miss.latencyMs - result.hit.latencyMs;
  const pct   = Math.round((delta / result.miss.latencyMs) * 100);

  return (
    <div
      className="rounded-xl p-5 mt-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>
        Cache Cycle — Live Proof
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "MISS (first load)", data: result.miss, color: "var(--amber)" },
          { label: "HIT (cached)",      data: result.hit,  color: "var(--green)" },
        ].map(({ label, data, color }) => (
          <div key={label} className="rounded-xl p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-mono mb-2" style={{ color }}>{label}</p>
            <p className="text-2xl font-bold font-mono" style={{ color }}>{fmtMs(data.latencyMs)}</p>
            <div className="mt-2 space-y-0.5 text-xs font-mono" style={{ color: "var(--text-3)" }}>
              <p>server: {fmtMs(data.serverMs)}</p>
              <p>payload: {data.payloadKB} KB</p>
            </div>
          </div>
        ))}
      </div>
      <div
        className="flex items-center justify-between text-xs font-mono pt-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span style={{ color: "var(--text-3)" }}>Cache speedup</span>
        <span style={{ color: "var(--green)" }}>
          {fmtMs(delta)} faster · {pct}% improvement
        </span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function UploadClient() {
  const [file, setFile]               = useState<File | null>(null);
  const [title, setTitle]             = useState("");
  const [category, setCategory]       = useState<Category>("events");
  const [role, setRole]               = useState<AssetRole | "">("");
  const [tags, setTags]               = useState("");
  const [stages, setStages]           = useState<Stage[]>(makeStages());
  const [running, setRunning]         = useState(false);
  const [uploadDone, setUploadDone]   = useState(false);
  const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null);
  const [cycleRunning, setCycleRunning]   = useState(false);
  const [cycleResult, setCycleResult]     = useState<CycleResult | null>(null);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setStage = useCallback((i: number, patch: Partial<Stage>) => {
    setStages(prev => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }, []);

  // ── Upload pipeline ──────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!file || !title.trim() || running) return;
    setRunning(true);
    setUploadDone(false);
    setUploadedAsset(null);
    setCycleResult(null);
    setErrorMsg(null);
    setStages(makeStages());

    // All 3 stages handled server-side in one signed request
    setStage(0, { status: "running", detail: `${fmtBytes(file.size)} → /api/upload/media` });
    setStage(1, { status: "running", detail: "queued server-side" });
    setStage(2, { status: "running", detail: "queued server-side" });

    const t0 = Date.now();
    const form = new FormData();
    form.append("file", file);
    form.append("title", title.trim());
    form.append("category", category);
    form.append("tags", tags);
    if (role) form.append("role", role);

    try {
      const res  = await fetch("/api/upload/media", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);

      const elapsed = Date.now() - t0;
      setStage(0, { status: "done", detail: json.publicId, ms: elapsed });
      setStage(1, { status: "done", detail: `id: ${json.id.slice(0, 12)}…`, ms: null });
      setStage(2, { status: "done", detail: "assets:* + media:* evicted", ms: null });

      setUploadedAsset({
        publicId:     json.publicId,
        resourceType: json.resourceType,
        title:        title.trim(),
        format:       json.format ?? file.type.split("/")[1] ?? "unknown",
        bytes:        json.bytes ?? file.size,
        width:        json.width,
        height:       json.height,
      });
      setUploadDone(true);
    } catch (e: any) {
      setStage(0, { status: "error", detail: e.message });
      setStage(1, { status: "idle", detail: "skipped" });
      setStage(2, { status: "idle", detail: "skipped" });
      setErrorMsg(e.message);
    }

    setRunning(false);
  }

  // ── Cache cycle demo ─────────────────────────────────────────────────────────

  async function runCacheCycle() {
    setCycleRunning(true);
    setCycleResult(null);

    await fetch("/api/media/invalidate", { method: "POST" });

    const m0  = performance.now();
    const r1  = await fetch("/api/media", { cache: "no-store" });
    const missLatency = Math.round(performance.now() - m0);
    const missData    = await r1.json();
    const missServer  = parseInt(r1.headers.get("X-Response-Time") ?? "0");
    const missPayload = r1.headers.get("X-Payload-Size") ?? "—";

    const h0  = performance.now();
    const r2  = await fetch("/api/media", { cache: "no-store" });
    const hitLatency = Math.round(performance.now() - h0);
    await r2.json();
    const hitServer  = parseInt(r2.headers.get("X-Response-Time") ?? "0");
    const hitPayload = r2.headers.get("X-Payload-Size") ?? "—";

    void missData;

    setCycleResult({
      miss: { latencyMs: missLatency, serverMs: missServer, payloadKB: missPayload },
      hit:  { latencyMs: hitLatency,  serverMs: hitServer,  payloadKB: hitPayload  },
    });
    setCycleRunning(false);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const canUpload = !!file && !!title.trim() && !running;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Link href="/" style={{ color: "var(--text-3)", fontSize: 12, fontFamily: "var(--font-geist-mono)", textDecoration: "none" }}>
            ← back
          </Link>
          <span style={{ color: "var(--border-2)", fontSize: 12 }}>/</span>
          <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--text-2)" }}>upload</span>
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "var(--text)",
          }}
        >
          Upload Asset
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-2)" }}>
          Direct CDN upload · metadata persistence · live cache invalidation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left: Upload form */}
        <div>
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
            Asset
          </p>
          <div className="space-y-2.5">

            {/* File drop zone */}
            <div
              className="rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
              style={{
                border: `2px dashed ${file ? "rgba(5,150,105,0.4)" : "var(--border-2)"}`,
                background: file ? "rgba(5,150,105,0.04)" : "var(--surface)",
                boxShadow: "inset 0 1px 4px rgba(0,0,0,0.03)",
              }}
              onClick={() => inputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) setFile(f);
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: "rgba(5,150,105,0.12)",
                      border: "1px solid rgba(5,150,105,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                      color: "#059669",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 12l4-5 3.5 2.5 3-4 3 6.5H2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm font-mono font-semibold" style={{ color: "#059669" }}>{file.name}</p>
                  <p className="text-xs font-mono mt-1" style={{ color: "var(--text-3)" }}>
                    {fmtBytes(file.size)} · {file.type || "unknown type"}
                  </p>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                      color: "var(--text-3)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 11V3M4 6l4-3.5L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Drop file or click to select</p>
                  <p className="text-xs font-mono mt-1" style={{ color: "var(--text-3)" }}>image/* · video/*</p>
                </div>
              )}
            </div>

            {/* Title */}
            <input
              type="text"
              placeholder="Asset title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = "rgba(37,99,235,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
              onBlur={e   => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
            />

            {/* Category */}
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>

            {/* Role */}
            <select
              value={role}
              onChange={e => setRole(e.target.value as AssetRole | "")}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: role ? "var(--text)" : "var(--text-3)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <option value="">Role — none (optional)</option>
              {ROLES.map(r => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>

            {/* Tags */}
            <input
              type="text"
              placeholder="Tags — comma separated (e.g. convocation, 2024)"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = "rgba(37,99,235,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
              onBlur={e   => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
            />

            {/* Submit */}
            <button
              onClick={handleUpload}
              disabled={!canUpload}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: canUpload
                  ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                  : "var(--surface-2)",
                color: canUpload ? "#fff" : "var(--text-3)",
                cursor: canUpload ? "pointer" : "not-allowed",
                boxShadow: canUpload ? "0 2px 12px rgba(37,99,235,0.32), 0 1px 0 rgba(255,255,255,0.1) inset" : "none",
                border: "none",
              }}
            >
              {running ? "Running pipeline…" : "Upload & Index"}
            </button>
          </div>

          {/* Success strip */}
          {uploadDone && (
            <div
              className="mt-4 rounded-xl px-4 py-3"
              style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.2)" }}
            >
              <div className="flex items-center justify-between">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px rgba(5,150,105,0.5)", display: "inline-block" }} />
                  <p className="text-xs font-mono font-semibold" style={{ color: "var(--green)" }}>
                    Pipeline complete
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/gallery" className="text-xs font-mono" style={{ color: "var(--text-3)", textDecoration: "none" }}>
                    View in library →
                  </Link>
                </div>
              </div>
              <button
                onClick={runCacheCycle}
                disabled={cycleRunning}
                className="w-full mt-3 py-2 rounded-lg text-xs font-mono transition-all duration-200"
                style={{
                  background: cycleRunning ? "var(--surface-2)" : "var(--surface)",
                  border: "1px solid var(--border)",
                  color: cycleRunning ? "var(--text-3)" : "var(--text-2)",
                  cursor: cycleRunning ? "not-allowed" : "pointer",
                }}
              >
                {cycleRunning ? "Measuring cache…" : "Run MISS → HIT cycle test"}
              </button>
            </div>
          )}

          {cycleResult && <CycleCard result={cycleResult} />}
        </div>

        {/* Right: Pipeline + output */}
        <div>
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
            Pipeline
          </p>
          <div className="space-y-2">
            {stages.map((stage, i) => (
              <StageRow key={i} stage={stage} index={i} />
            ))}
          </div>

          {errorMsg && (
            <div
              className="mt-3 rounded-lg px-4 py-3 text-xs font-mono"
              style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.18)", color: "var(--red)" }}
            >
              {errorMsg}
            </div>
          )}

          {/* Architecture note */}
          <div
            className="mt-4 rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
              Pipeline design
            </p>
            <div className="space-y-2 text-xs font-mono" style={{ color: "var(--text-2)" }}>
              {[
                ["Stage 1", "Browser uploads directly to Cloudinary. No Next.js server involved — bypasses serverless timeout on large files."],
                ["Stage 2", "Only the public_id, title, and category are saved to SQLite. Never file bytes."],
                ["Stage 3", "Redis holds the gallery list for 60s. After upload, stale keys are evicted so the new asset appears immediately."],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="flex-shrink-0 w-14" style={{ color: "var(--accent)" }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Production outputs — shown after upload */}
          {uploadedAsset && <ProductionOutputs asset={uploadedAsset} />}
        </div>
      </div>
    </div>
  );
}
