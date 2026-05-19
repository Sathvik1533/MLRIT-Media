"use client";

import { useState } from "react";
import { MediaImage } from "./MediaImage";
import { VideoCard } from "./VideoCard";
import type { MediaAsset, MediaCategory, MediaGalleryFilter } from "@/types/media";

const CATEGORIES: MediaCategory[] = [
  "events", "campus", "sports", "academics", "cultural", "technical",
];

interface MediaGridProps {
  assets: MediaAsset[];
  filter?: MediaGalleryFilter;
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (id: string, title: string, category: MediaCategory, description: string) => Promise<void>;
  onView?: (cloudinaryPublicId: string) => void;
  onTagClick?: (tag: string) => void;
}

// ── Edit modal ─────────────────────────────────────────────────────────────────

function EditModal({
  asset,
  onSave,
  onClose,
}: {
  asset: MediaAsset;
  onSave: (title: string, category: MediaCategory, description: string) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(asset.title);
  const [category, setCategory] = useState<MediaCategory>(asset.category);
  const [description, setDescription] = useState(asset.description ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(title.trim(), category, description);
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-6 flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
            Edit Asset
          </p>
          <button
            onClick={onClose}
            className="text-sm leading-none"
            style={{ color: "var(--text-3)" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono" style={{ color: "var(--text-3)" }}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(37,99,235,0.5)"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono" style={{ color: "var(--text-3)" }}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as MediaCategory)}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono" style={{ color: "var(--text-3)" }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional description…"
            className="px-3 py-2 rounded-xl text-sm outline-none resize-none"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
            onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "rgba(37,99,235,0.5)"; }}
            onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--border)"; }}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
            style={{
              background: saving ? "rgba(0,102,255,0.4)" : "var(--accent)",
              color: "#fff",
              opacity: !title.trim() ? 0.5 : 1,
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Role badge ─────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  hero:      { text: "#60a5fa", bg: "rgba(37,99,235,0.15)",   border: "rgba(37,99,235,0.3)" },
  banner:    { text: "#c084fc", bg: "rgba(168,85,247,0.15)",  border: "rgba(168,85,247,0.3)" },
  thumbnail: { text: "#22d3ee", bg: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.3)" },
  featured:  { text: "#fbbf24", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.3)" },
};

function RoleBadge({ role }: { role: string }) {
  const c = ROLE_COLORS[role] ?? { text: "var(--text-2)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" };
  return (
    <span
      style={{
        fontSize: 9,
        fontFamily: "var(--font-geist-mono)",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: c.text,
        background: c.bg,
        border: `1px solid ${c.border}`,
        padding: "2px 6px",
        borderRadius: 4,
      }}
    >
      {role}
    </span>
  );
}

// ── Card action buttons ────────────────────────────────────────────────────────

function CardActions({
  asset,
  onEdit,
  onDelete,
}: {
  asset: MediaAsset;
  onEdit: (asset: MediaAsset) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await onDelete(asset.id);
    setDeleting(false);
    setConfirmDelete(false);
  }

  return (
    <div
      className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {confirmDelete ? (
        <>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-2 py-1 rounded-lg text-xs font-mono transition-all duration-150"
            style={{ background: "rgba(0,0,0,0.75)", color: "var(--text-2)", border: "1px solid var(--border)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-2 py-1 rounded-lg text-xs font-mono transition-all duration-150"
            style={{ background: "rgba(239,68,68,0.85)", color: "#fff" }}
          >
            {deleting ? "…" : "Confirm"}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => onEdit(asset)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all duration-150"
            style={{ background: "rgba(0,0,0,0.65)", color: "var(--text-2)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Edit"
            title="Edit"
          >
            ✎
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all duration-150"
            style={{ background: "rgba(0,0,0,0.65)", color: "rgba(239,68,68,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Delete"
            title="Delete"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}

// ── Main grid ─────────────────────────────────────────────────────────────────

export function MediaGrid({ assets, filter, onDelete, onEdit, onView, onTagClick }: MediaGridProps) {
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);

  const filtered = filterAssets(assets, filter);

  if (filtered.length === 0) {
    return (
      <p className="text-center py-12" style={{ color: "var(--text-3)" }}>
        No media found.
      </p>
    );
  }

  const showActions = !!(onDelete && onEdit);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
        {filtered.map((asset, index) => (
          <div key={asset.id} className="break-inside-avoid group media-card" onClick={() => onView?.(asset.cloudinaryPublicId)}>
            {asset.type === "image" ? (
              <div className="relative overflow-hidden rounded-lg">
                <MediaImage
                  asset={asset}
                  displayWidth={600}
                  priority={index < 12}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {asset.role && (
                  <div className="absolute top-2 left-2">
                    <RoleBadge role={asset.role} />
                  </div>
                )}
                <div
                  className="absolute inset-x-0 bottom-0 px-3 pt-8 pb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                    {asset.category}
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5 truncate">{asset.title}</p>
                </div>
                {showActions && (
                  <CardActions
                    asset={asset}
                    onEdit={setEditingAsset}
                    onDelete={onDelete!}
                  />
                )}
              </div>
            ) : (
              <div className="relative">
                <VideoCard asset={asset} />
                {showActions && (
                  <CardActions
                    asset={asset}
                    onEdit={setEditingAsset}
                    onDelete={onDelete!}
                  />
                )}
              </div>
            )}
            {asset.type === "video" && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <p className="text-sm font-medium truncate flex-1" style={{ color: "var(--text-2)" }}>
                  {asset.title}
                </p>
                {asset.role && <RoleBadge role={asset.role} />}
              </div>
            )}
            {asset.tags && asset.tags.length > 0 && (
              <div
                className="flex flex-wrap gap-1 mt-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {asset.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick?.(tag)}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded transition-all duration-150"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "var(--text-3)",
                      cursor: onTagClick ? "pointer" : "default",
                    }}
                    onMouseEnter={(e) => {
                      if (onTagClick) {
                        e.currentTarget.style.borderColor = "rgba(0,102,255,0.35)";
                        e.currentTarget.style.color = "var(--accent)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "var(--text-3)";
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {editingAsset && onEdit && (
        <EditModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={async (title, category, description) => {
            await onEdit(editingAsset.id, title, category, description);
            setEditingAsset(null);
          }}
        />
      )}
    </>
  );
}

function filterAssets(assets: MediaAsset[], filter?: MediaGalleryFilter): MediaAsset[] {
  if (!filter) return assets;
  return assets.filter((a) => {
    if (filter.category && a.category !== filter.category) return false;
    if (filter.type && a.type !== filter.type) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      const matches =
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });
}
