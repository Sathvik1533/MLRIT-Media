# MLRIT Zero-Lag Media Platform

## Project Overview

College media website for MLRIT. Serves 40+ images/videos with <50ms perceived load via Cloudflare CDN + Next.js Image optimization.

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **CDN/Storage**: Cloudflare Images + R2 (videos)
- **Hosting**: Cloudflare Pages

## Architecture

```
src/
  app/           # App Router pages + layouts
  components/    # Reusable UI components
    media/       # Image, VideoPlayer, MediaGrid
    ui/          # Button, Card, Modal, etc.
  lib/           # Utilities, CDN helpers, constants
  types/         # TypeScript types for media assets
```

## Performance Rules

- ALL images go through `next/image` with `sizes` and `priority` set appropriately
- Use Cloudflare Images URL transforms for resizing (e.g., `?width=800&format=auto`)
- Videos served from Cloudflare R2 via signed URLs — never embed raw large files
- Blur placeholders on all images (base64 `blurDataURL`)
- Lazy-load below-fold media; only first 6 assets eager-loaded

## Code Standards

- Clean architecture: pages → components → lib
- `async/await` everywhere, no `.then()`
- TypeScript strict mode
- No `any` types — define proper interfaces in `src/types/`
- All media asset config in `src/lib/media.ts`

## Environment Variables

```
NEXT_PUBLIC_CF_IMAGES_BASE_URL=  # Cloudflare Images delivery URL
NEXT_PUBLIC_CF_ACCOUNT_ID=       # Cloudflare account ID
CF_R2_BUCKET_NAME=               # R2 bucket for videos
CF_R2_PUBLIC_URL=                # R2 public access URL
```

## Cloudflare Setup

- Images: Upload via Cloudflare Images API → deliver via `imagedelivery.net`
- Videos: Store in R2 bucket → stream via HLS or direct MP4 (<=10MB clips)
- Pages: Deploy via `wrangler pages deploy ./out`

## Key Files

- `src/lib/media.ts` — all media asset definitions
- `src/lib/cloudflare.ts` — CDN URL builders
- `next.config.ts` — image domains, headers

## Session Goals Log

- [2026-04-05] MVP scaffold: structure, types, Cloudflare config, media grid
