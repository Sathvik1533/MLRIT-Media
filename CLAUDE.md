# MLRIT Media - Project Memory

## Project Overview
Next.js media gallery application with Redis caching, Cloudflare/Cloudinary integration, and real-time performance monitoring.

## Current Phase: Redis Pressure Integration & Monitoring

### Today's Active Task (Step 1)
**Goal**: Implement Redis pressure monitoring with real-time visibility into cache performance.

### Architecture Decisions

#### 1. The Singleton Pattern (Redis Connection)
**File**: `src/lib/redis.ts`
**Why**: Prevents connection leaks during bulk uploads
- ONE Redis connection opened at server startup
- All requests share the same connection
- Without this: 50 concurrent users = 50 connections = server crash
- Implementation: Module-level `const redis = makeRedis()` runs once, Node.js caches it

#### 2. Telemetry System
**Files**: 
- `src/lib/telemetry.ts` - The stopwatch that reads response headers
- `src/app/api/media/route.ts` - Stamps headers on every response
- `src/app/api/stats/route.ts` - Ring buffer tracking last 100 requests

**Headers Exposed**:
- `X-Cache`: HIT (Redis) or MISS (Database)
- `X-Response-Time`: Total server processing time (ms)
- `X-Redis-Latency`: Redis-only round-trip time (ms)
- `X-Payload-Size`: Response size in KB/MB
- `Content-Length`: Raw bytes

#### 3. Infrastructure Health Monitoring
**Component**: `src/components/ui/InfrastructureHUD.tsx`
**Location**: Top-right corner of gallery
**Features**:
- Color-coded health bar (Green → Amber at >10ms latency)
- Real-time Redis latency display
- Payload size tracking
- Cache hit/miss status
- Uses `content-visibility: auto` for zero-lag rendering

#### 4. Performance Tracking
**Component**: `src/components/ui/PerformanceHUD.tsx`
**Location**: Bottom bar
**Metrics**:
- Round-trip latency
- Server processing time
- Cache source indicator
- Payload size

### API Endpoints

#### `/api/media`
Main media fetching endpoint with Redis caching
- Tries Redis first (pantry)
- Falls back to Prisma DB (kitchen)
- Caches results for 5 minutes
- Returns telemetry headers

#### `/api/stats`
Real-time infrastructure health metrics
- Requests per minute
- Average latency (last 5 requests)
- Average Redis latency
- Cache hit rate (last 20 requests)
- Average payload size
- Ring buffer: last 100 requests in memory

### Data Flow: "Miss Path" vs "Hit Path"

**Miss Path** (First Load):
1. Browser → `/api/media`
2. Redis check → NULL
3. Prisma DB query → Results
4. Cache results in Redis (TTL: 5min)
5. Return to browser with `X-Cache: MISS`

**Hit Path** (Subsequent Loads):
1. Browser → `/api/media`
2. Redis check → Found!
3. Return cached data with `X-Cache: HIT`
4. No DB query needed

### Testing Strategy

**Comparative Stress Test**:
- Small images (thumbnails ~10KB) → Low latency baseline
- Large images (high-res ~500KB) → Medium pressure
- Small videos (clips ~2MB) → Higher latency
- Large videos (4K ~50MB) → Maximum pressure spike

**Success Criteria**:
- ✅ `X-Cache: HIT` on second page load
- ✅ Health bar shows <5ms for small images
- ✅ Health bar turns amber for >10ms latency
- ✅ Payload size accurately reported
- ✅ No UI lag from monitoring components

### Performance Optimizations

1. **Content Visibility**: `content-visibility: auto` on HUD components
2. **Ring Buffer**: Only last 100 requests kept in memory
3. **Singleton Connection**: Single Redis client prevents connection overhead
4. **Selective Caching**: 5-minute TTL balances freshness vs. load

### Next Steps (After Today)

1. **Focal Resolution Optimization**: Handle 4K video metadata efficiently
2. **Bulk Upload Testing**: Stress test with 50+ concurrent uploads
3. **Memory Profiling**: Monitor Redis memory usage under load
4. **Cache Invalidation**: Implement smart cache clearing on uploads

### Key Files Reference

```
src/
├── lib/
│   ├── redis.ts              # Singleton connection + cacheGet/cacheSet
│   ├── telemetry.ts          # traceFetch() - reads all headers
│   └── media.ts              # Media fetching logic
├── app/
│   ├── api/
│   │   ├── media/route.ts    # Main endpoint with Redis caching
│   │   └── stats/route.ts    # Infrastructure health metrics
│   └── gallery/
│       ├── page.tsx          # Server component wrapper
│       └── GalleryClient.tsx # Client component with HUDs
└── components/
    ├── ui/
    │   ├── InfrastructureHUD.tsx  # Redis pressure health bar
    │   └── PerformanceHUD.tsx     # Bottom telemetry bar
    └── media/
        └── MediaGrid.tsx          # Gallery grid display
```

### Environment Variables Required

```env
# Upstash Redis (for caching)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Database
DATABASE_URL=...

# Media providers
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
CLOUDINARY_CLOUD_NAME=...
```

### Teacher Mode Notes

**The Pantry Analogy**:
- Redis = Pantry (fast, nearby storage)
- Database = Kitchen (slower, requires cooking)
- Singleton = One pantry door for all waiters
- Cache Miss = Go to kitchen, then stock pantry
- Cache Hit = Grab from pantry, skip kitchen

**Why Global Variables Here**:
In Node.js, module-level variables are safe for singletons because:
- Modules execute once on first import
- Subsequent imports get the cached module
- The connection lives for the entire server process
- No race conditions (single-threaded event loop)

**Measuring Latency**:
```typescript
const t0 = Date.now();
const result = await redis.get(key);
const latency = Date.now() - t0;  // This is the "stopwatch"
```

---

## Status: Complete

All files implemented and tested. See README.md for setup instructions.

*Last Updated: April 8, 2026*
