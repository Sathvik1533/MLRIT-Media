# MLRIT Media - Web Performance Testing Platform: Ownership Guide

**Owner:** K. Sathvik
**Project:** Web Performance Monitoring & Optimization Testing Platform (MLRIT)
**Date:** April 2026
**Status:** Phase 2 In Progress

---

## *** WHAT THIS PROJECT ACTUALLY IS ***

This is a **performance engineering platform** disguised as a media gallery. The gallery is the test vehicle — not the product. The real product is the measurement and testing infrastructure underneath it.

**Think of it like this:**
- A wind tunnel doesn't sell aircraft — it measures how they perform
- This platform doesn't sell media — it measures how web optimization techniques perform

---

## System Architecture

```
┌───────────────────────────────────────────────────────┐
│              Browser (The Observer)                    │
│  - Watches: latency, cache status, payload size, TTFB  │
│  - Tools: Performance HUD, Redis Dashboard, Test Lab   │
└───────────────────┬───────────────────────────────────┘
                    │
                    ↓
┌───────────────────────────────────────────────────────┐
│           Next.js Server (The Experiment Layer)        │
│  /gallery       → serves media + collects telemetry    │
│  /test-lab      → controlled testing environment       │
│  /api/media     → Redis-cached media endpoint          │
│  /api/stats     → ring buffer metrics endpoint         │
│  /api/upload    → dynamic asset upload for testing     │
│  /api/test-asset→ single-asset performance test        │
└──────────┬────────────────────────┬───────────────────┘
           │                        │
           ↓                        ↓
┌──────────────────┐    ┌───────────────────────────────┐
│  Redis (Upstash) │    │   Cloudinary CDN               │
│  Cache Layer     │    │   Image/video optimization     │
│  Measurement:    │    │   Measurement:                 │
│  - Hit/miss rate │    │   - Delivery speed             │
│  - Latency (ms)  │    │   - Format optimization        │
│  - TTL behavior  │    │   - Bandwidth saved            │
└──────────────────┘    └───────────────────────────────┘
           │
           ↓ (on MISS)
┌──────────────────────┐
│  SQLite DB (Prisma)  │
│  Origin data store   │
│  Measurement:        │
│  - Query time        │
│  - Index performance │
└──────────────────────┘
```

---

## What We're Testing (By Phase)

### Phase 1 — DONE: Redis Cache Layer
- Redis vs DB response time (target: 10x improvement)
- Cache hit rate under real load
- Singleton connection pattern impact
- Ring buffer for memory-efficient tracking
- Sub-millisecond telemetry with `performance.now()`

### Phase 2 — IN PROGRESS: Controlled Testing Lab (/test-lab)
- Upload real assets of different sizes (thumbnail → 4K)
- Batch requests: 10 / 50 / 100 concurrent
- Cache warming: observe MISS → HIT transition
- CDN comparison: Cloudinary vs direct serving
- Side-by-side before/after metrics

### Phase 3 — NEXT: Infrastructure Testing
- Load balancer impact on response distribution
- CDN edge vs origin latency by geography
- Auto-scaling behavior under synthetic load
- Edge function vs server function performance
- Geographic distribution testing

---

## Key Files

```
src/
├── lib/
│   ├── redis.ts              # Singleton Redis + cacheGet/cacheSet
│   ├── telemetry.ts          # traceFetch() — sub-ms latency measurement
│   ├── media.ts              # Media DB queries
│   └── db.ts                 # Prisma singleton
├── app/
│   ├── api/
│   │   ├── media/route.ts    # Main endpoint: Redis caching + telemetry headers
│   │   ├── stats/route.ts    # Ring buffer metrics (last 100 requests)
│   │   ├── upload/route.ts   # Upload to Cloudinary + DB
│   │   └── test-asset/route.ts # Single-asset perf test endpoint
│   ├── gallery/
│   │   ├── page.tsx          # Server wrapper
│   │   └── GalleryClient.tsx # Gallery + all HUDs
│   └── test-lab/
│       └── page.tsx          # Performance testing lab UI
└── components/
    └── ui/
        ├── RedisMetricsDashboard.tsx  # Top: aggregate cache metrics
        ├── InfrastructureHUD.tsx      # Top-right: live health bar
        ├── PerformanceHUD.tsx         # Bottom: per-request telemetry
        └── PressureTestBench.tsx      # Test buttons (small/large × image/video)
```

---

## Telemetry Headers (Every API Response)

| Header | What It Measures |
|--------|-----------------|
| `X-Cache` | HIT (Redis) or MISS (Database) |
| `X-Response-Time` | Total server processing time (ms) |
| `X-Redis-Latency` | Redis-only round-trip (ms) |
| `X-Payload-Size` | Response body size (KB/MB) |
| `Content-Length` | Raw bytes |

---

## Performance Baselines

| Scenario | Expected Latency | Status |
|----------|-----------------|--------|
| Redis HIT (small image) | <5ms | Target |
| Redis HIT (large video metadata) | <15ms | Target |
| DB MISS (any) | 30–80ms | Baseline to beat |
| Batch 100 requests, 80%+ hit rate | <10ms avg | Phase 2 goal |

---

## Environment Variables

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=diigktj8x
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
UPSTASH_REDIS_REST_URL=https://assuring-gorilla-40099.upstash.io
UPSTASH_REDIS_REST_TOKEN=...
DATABASE_URL="file:./prisma/dev.db"
```

---

## How to Run

```bash
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
# Gallery: http://localhost:3000/gallery
# Test Lab: http://localhost:3000/test-lab
```

---

## Interview Answers (How to Present This)

**Q: What did you build?**
> "A web performance testing platform built on Next.js. The system measures the real-world impact of optimization techniques — Redis caching, CDN delivery, different rendering strategies — using a media gallery as the test load generator. I built sub-millisecond telemetry, a ring buffer for efficient metric tracking, and a real-time dashboard showing cache hit rates, latency, and system health."

**Q: What's the most interesting technical piece?**
> "The telemetry system. Every API response stamps custom headers — X-Cache, X-Redis-Latency, X-Response-Time — and the client reads them to plot real-time performance graphs. I use `performance.now()` instead of `Date.now()` because Redis queries often complete in under 5ms, and millisecond-level precision would show 0ms incorrectly."

**Q: What did you learn?**
> "That measuring performance is harder than optimizing it. The first version of my latency measurement was wrong by 10x because I was using the wrong precision timer. The cache hit rate dashboard revealed that cache warming takes 3-5 requests before you see consistent HITs — something you wouldn't know without measurement."

---

## Next Steps

1. Complete `/test-lab` with batch testing + CDN comparison metrics
2. Add Lighthouse CI integration for automated scoring
3. Plan Phase 3: load balancer + geographic CDN testing
4. Add INP/LCP/CLS measurement (Core Web Vitals)

---

*Owner: K. Sathvik | Last Updated: April 2026 | Status: Phase 2 active*
