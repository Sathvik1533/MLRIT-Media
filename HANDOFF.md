# SESSION HANDOFF — MLRIT Media Platform
**Date:** 2026-04-29 (end of day) | **Last commit:** `356b352` | **Read this before touching any file.**

---

## ACTIVE PROJECT PATH

```
~/Projects/MLRIT-Media
```

**NOT** the iCloud path. All work uses `~/Projects/MLRIT-Media` only.
The iCloud copy at `~/Library/Mobile Documents/com~apple~CloudDocs/Desktop/MLRIT-Media` is stale — ignore permanently. The IDE may show it as an open folder — close it. All errors shown from that path are false positives.

---

## WHAT THIS PROJECT IS

**NOT a college gallery website.**

This is **MLRIT's internal Media Asset Performance Platform** — a premium infrastructure tool for:
- Uploading media assets
- Benchmarking CDN delivery (5 quality variants, TTFB, payload)
- Monitoring Redis cache performance in real time
- Certifying zero-lag delivery before assets go live on mlrit.ac.in

**Stack:** Next.js 16.2.2 (App Router, Turbopack) · SQLite (Prisma) · Upstash Redis · Cloudinary CDN · TypeScript · Tailwind v4 · Geist Sans + Geist Mono

---

## BUILD STATUS — FULLY CLEAN

```
TypeScript:  0 errors
ESLint:      0 errors
Next.js build: 15 routes compiled successfully
```

Static routes: `/`, `/dashboard`, `/gallery`, `/test-lab`, `/upload`, `/videos`
Dynamic routes: `/api/assets`, `/api/assets/[id]`, `/api/media`, `/api/media/[id]/view`, `/api/media/invalidate`, `/api/stats`, `/api/upload`, `/api/upload/media`

---

## ENVIRONMENT — ALL CREDENTIALS SET

`.env.local` is complete:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=diigktj8x
CLOUDINARY_API_KEY=993826933699591
CLOUDINARY_API_SECRET=ql6b2CRU5jTdbyhlxSPz5WNl29M
UPSTASH_REDIS_REST_URL=https://assuring-gorilla-40099.upstash.io
UPSTASH_REDIS_REST_TOKEN=AZyjAAIncDFhNThlNzFiZWZmNTI0MDlkYmQ0MGU3ZTIwZmI2YzlkMXAxNDAwOTk
DATABASE_URL="file:/Users/k.sathvik/Projects/MLRIT-Media/prisma/dev.db"
```

**Dev server:** `cd ~/Projects/MLRIT-Media && bun run dev`

---

## DESIGN SYSTEM (globals.css — DO NOT CHANGE)

```css
--bg:        #070709
--surface:   #0d0d12
--surface-2: #131319
--surface-3: #1a1a24
--border:    rgba(255,255,255,0.06)
--border-2:  rgba(255,255,255,0.10)
--text:      #e8e8ea
--text-2:    #888
--text-3:    #444
--accent:    #0066ff
--green:     #00ff88
--amber:     #f59e0b
--red:       #ef4444
```

**Accent palette used in HomepageClient:**
| Use | Value |
|-----|-------|
| Primary / Upload / Events | `#2563eb` |
| Process / Cultural | `#7c3aed` |
| Cache / Live / Success | `#059669` |
| Deliver / Sports / Benchmark | `#ea580c` |

**Fonts:** `--font-geist` (sans — headings/body) · `--font-geist-mono` (ALL metrics, labels, data, overlines)

**Styling pattern:** All components in HomepageClient and Navbar use **inline `style={{}}` with CSS vars**. Tailwind is only used for layout utilities (`flex`, `grid`, `columns-*`, `break-inside-avoid`). Never mix Tailwind color/spacing into these components.

---

## LAYOUT SYSTEM — FIXED THIS SESSION

**The container token is now unified across the entire page:**

```
maxWidth: 1200px
padding:  "0 48px" (horizontal only, on inner containers)
margin:   "0 auto"
```

This applies identically to: **Navbar · Hero · MetricsStrip · Pipeline · Capabilities · Asset Library · Footer**

**What was changed in commit `356b352`:**
- `Navbar.tsx:29` — maxWidth 1320 → 1200
- `HomepageClient.tsx` Hero `<section>` — removed `minHeight: calc(100vh - 52px)` and `alignItems: center` (was causing full-viewport empty space)
- Hero inner container — maxWidth 1320 → 1200, padding normalized to `88px 48px 80px`
- `MetricsStrip` — background stays full-bleed, grid wrapped in `maxWidth: 1200` inner div so metric left edges align with all sections
- Pipeline section — padding `64px 48px` → `72px 0`, inner → `maxWidth: 1200, padding: 0 48px`
- Capabilities section — removed `<Divider>` before it, restructured to outer section + inner 1200px container
- Asset Library — padding `80px 48px` → `72px 0`, inner → `maxWidth: 1200`
- Footer — removed `<Divider>` before it, padding `60px 48px 40px` → `56px 0 40px`, inner → `maxWidth: 1200`
- Deleted unused `Divider` component entirely

---

## MODULE STATUS

| Module | Feature | Status |
|--------|---------|--------|
| 1 | Redis caching + telemetry headers | ✅ Complete |
| 2 | Upload pipeline (3-stage, Cloudinary) | ✅ Complete |
| 3 | CDN benchmark / test-lab | ✅ Complete |
| 4 | Dashboard (performance metrics, ring buffer) | ✅ Complete |
| 5 | Tags, roles, API integration fixes | ✅ Complete |
| 6 | View tracking (POST /api/media/[id]/view, GalleryClient wired) | ✅ Complete |
| — | Homepage layout unification | ✅ Complete (this session) |
| — | Stability audit (gallery, videos, layout, homepage) | ✅ All clear |

---

## STABILITY AUDIT — COMPLETED THIS SESSION

Every page verified. Key findings:

**`gallery/page.tsx`** — Both `CategoryFilter` and `GalleryClient` correctly wrapped in `Suspense` (required for `useSearchParams()`). Fallbacks present.

**`GalleryClient.tsx`** — Error handling, abort controller (10s timeout), cancelled flag (prevents setState after unmount), retry + dismiss UI, optimistic delete/edit with rollback. API shape `{ assets, total }` matches `/api/assets` response.

**`videos/page.tsx`** — `getVideos()` is synchronous, valid in Server Component. `MediaGrid` renders safely without callbacks: `showActions = !!(onDelete && onEdit)` — false means `CardActions` never mounts. `onView` and `onTagClick` use optional chaining (`?.`).

**`MediaImage` / `VideoCard`** — Both build their own Cloudinary URLs from `cloudinaryPublicId` directly via `cloudinary.ts`. They do NOT depend on `thumbnailUrl`/`fullUrl` optional props.

**`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=diigktj8x`** — set, images will load.

**Result: 0 runtime risks. App is demo-safe.**

---

## FILE MAP — CURRENT STATE

```
src/
├── app/
│   ├── globals.css              ← Design tokens (DO NOT CHANGE)
│   ├── layout.tsx               ← Geist fonts + Navbar + flex wrapper
│   ├── page.tsx                 ← Renders <HomepageClient />
│   ├── HomepageClient.tsx       ← ✅ UPDATED this session — layout fixed
│   ├── DashboardClient.tsx      ← Original perf dashboard
│   ├── dashboard/page.tsx       ← Renders DashboardClient at /dashboard
│   ├── gallery/
│   │   ├── page.tsx             ← Server shell + Suspense wrappers
│   │   └── GalleryClient.tsx    ← Live data, HUDs, optimistic CRUD
│   ├── upload/                  ← 3-stage upload pipeline
│   ├── test-lab/
│   │   ├── page.tsx             ← Renders QualityTester
│   │   └── QualityTester.tsx    ← CDN benchmark component
│   ├── videos/page.tsx          ← Static video list via getVideos()
│   └── api/
│       ├── assets/route.ts      ← GET (Redis-cached, all filters)
│       ├── assets/[id]/route.ts ← GET · PATCH · DELETE
│       ├── media/route.ts       ← GET (legacy Redis-cached endpoint)
│       ├── media/[id]/view/     ← POST view increment
│       ├── media/invalidate/    ← POST cache bust
│       ├── upload/route.ts      ← POST Cloudinary upload
│       ├── upload/media/        ← POST upload with cache invalidation
│       └── stats/route.ts       ← GET ring buffer live metrics
├── components/
│   ├── ui/
│   │   ├── Navbar.tsx           ← ✅ UPDATED this session — maxWidth 1200
│   │   ├── InfrastructureHUD.tsx
│   │   ├── PerformanceHUD.tsx
│   │   └── Skeleton.tsx         ← MediaGridSkeleton + MediaCardSkeleton
│   └── media/
│       ├── MediaGrid.tsx        ← Masonry grid, edit modal, CardActions
│       ├── MediaImage.tsx       ← next/image + cloudinaryImageUrl
│       ├── VideoCard.tsx        ← <video> + cloudinaryVideoUrl
│       └── CategoryFilter.tsx   ← URL-param driven filter bar
└── lib/
    ├── redis.ts                 ← Singleton Upstash (cacheGet/cacheSet/cacheInvalidatePattern)
    ├── db.ts                    ← Prisma singleton
    ├── cloudinary.ts            ← URL builders (cloudinaryImageUrl/cloudinaryVideoUrl)
    ├── media.ts                 ← Static MEDIA_ASSETS array + getVideos/getImages
    └── telemetry.ts             ← traceFetch() — reads X-Cache/X-Response-Time headers
```

---

## LIVE ROUTES

| Route | What it renders | Status |
|-------|----------------|--------|
| `/` | Premium platform homepage | ✅ |
| `/dashboard` | DashboardClient (perf metrics) | ✅ |
| `/gallery` | Gallery with Redis HUDs + CRUD | ✅ |
| `/upload` | 3-stage upload pipeline | ✅ |
| `/test-lab` | CDN quality benchmark | ✅ |
| `/videos` | Static video list | ✅ |

---

## KEY PATTERNS — DO NOT BREAK

1. **Styling**: inline `style={{}}` with CSS vars in HomepageClient + Navbar. Never Tailwind color/spacing classes here.
2. **Container system**: `maxWidth: 1200, margin: "0 auto", padding: "0 48px"` — use this everywhere. Do not introduce 1280/1320/1400.
3. **Stats fetch**: `<LivePanel>` and `<MetricsStrip>` each independently fetch `/api/stats` — intentional, they are not siblings.
4. **Media fetch**: `<AssetLibraryGrid>` handles three response shapes (`data`, `data.items`, `data.assets`) — don't simplify.
5. **Singleton pattern**: Redis and Prisma use module-level singletons — never `new PrismaClient()` directly.
6. **No Framer Motion**: Not installed. Animation via CSS `transition` only.
7. **Section rhythm**: sections use `padding: "72px 0"` on the outer `<section>` and `padding: "0 48px"` on the inner container. Do not merge these.

---

## WHAT REMAINS (NOT DONE)

### Mobile responsiveness — not implemented
All layouts are desktop-first. On small screens:
- Hero grid `1fr auto` — LivePanel needs to stack below copy
- MetricsStrip `repeat(4, 1fr)` — needs `repeat(2, 1fr)` at ≤768px
- Pipeline `flex` row — needs column at ≤768px
- Capabilities `repeat(3, 1fr)` — needs `repeat(1, 1fr)` at ≤640px

### Hero CTA hover states
Primary button (`Run Benchmark`) has `transition` defined but no `onMouseEnter/Leave`. Add state-driven hover for premium feel.

### Real Cloudinary assets
`/api/media` returns seeded DB data. If the images at the Cloudinary public IDs don't exist, `<AssetCard>` shows a placeholder tile grid. Not a code bug — a content gap.

---

## KNOWN GOTCHAS

1. **iCloud copy** — `~/Library/Mobile Documents/.../MLRIT-Media` is stale. IDE may open it. Close it. All errors from that path are false.
2. **`--text-3` is `#444`** — nearly invisible on `#070709`. Never use for readable content.
3. **Turbopack cache** — if page looks wrong after edits: `rm -rf .next && bun run dev`
4. **`QualityTester.tsx`** uses inline `style={{}}` throughout — do NOT switch to Tailwind mid-file.
5. **bun not npm** — this project uses bun. Use `bun run dev`, `bun run build`.

---

## SESSION START CHECKLIST FOR NEXT AGENT

```bash
cd ~/Projects/MLRIT-Media
bun run dev
```

1. Read this file first — do not start touching code without it.
2. Open `http://localhost:3000` — verify homepage loads and all sections align.
3. Check `/api/stats` returns JSON (confirms Redis + DB connection).
4. Check `/api/assets` returns items (confirms DB seeded).
5. DO NOT touch: anything in `src/app/api/`, `src/lib/`, `prisma/`, `.env.local`, `globals.css`.

---

*Last updated: 2026-04-29 | Session: Layout unification + stability audit*
*Next task: Mobile responsiveness OR Hero CTA hover states*
