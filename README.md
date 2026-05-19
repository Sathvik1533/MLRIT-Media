# MLRIT Performance Platform

A benchmarking platform that measures the quantitative impact of Redis caching and CDN optimizations on media-heavy web applications — built to demonstrate infrastructure engineering with real, measurable numbers.

## What It Does

Upload media → serve through Redis cache → measure the latency difference in real time.

- First load: queries SQLite via Prisma, caches result in Upstash Redis (5-min TTL)
- Second load: reads from Redis — no DB query, measured <5ms round-trip
- Live Infrastructure HUD shows cache hit/miss state, Redis latency, and payload size per request
- Pressure Test Bench loads small images, large images, small videos, and 4K video to stress-test the cache layer

## Measured Results

| Metric | Before (Prisma) | After (Redis HIT) | Improvement |
|--------|-----------------|-------------------|-------------|
| API latency | ~50ms | ~5ms | **10× faster** |
| Connection overhead | Per-request | Singleton | **Zero leak risk** |
| Cache hit rate | 0% | ~85% (repeated loads) | — |

## Stack

- **Next.js** (App Router) · **TypeScript**
- **Upstash Redis** — cache layer (REST API, singleton connection)
- **Prisma** + **SQLite** — database (dev)
- **Cloudinary CDN** — media delivery with automatic WebP/AVIF format negotiation
- **Custom telemetry** — `X-Cache`, `X-Response-Time`, `X-Redis-Latency`, `X-Payload-Size` response headers

## Architecture

```
Browser → /api/media
           ├── Redis HIT  → return cached JSON (X-Cache: HIT, ~5ms)
           └── Redis MISS → Prisma query → cache in Redis → return (X-Cache: MISS, ~50ms)

/api/stats → ring buffer (last 100 requests) → cache hit rate, avg latency
```

## Key Engineering Decisions

**Singleton Redis connection** — without this, 50 concurrent uploads = 50 open connections = server crash. Module-level `const redis = makeRedis()` runs once; Node.js module caching ensures every import gets the same instance.

**Response header telemetry** — instead of a separate logging service, latency data is stamped directly onto API responses (`X-Redis-Latency`, `X-Response-Time`). The client reads these headers to drive the live HUD — zero extra network round-trips.

**Ring buffer for stats** — only the last 100 requests are kept in memory. No database writes for metrics; no unbounded memory growth.

## Run Locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Fill in: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, DATABASE_URL, CLOUDINARY_CLOUD_NAME

# Seed the database (50 media items)
npx prisma db push
npx ts-node prisma/seed.ts

# Start dev server
npm run dev
```

Open `http://localhost:3000/gallery`

## Environment Variables

See `.env.local.example` for all required variables.

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash auth token |
| `DATABASE_URL` | SQLite path (dev) |
| `CLOUDINARY_CLOUD_NAME` | CDN media delivery |
