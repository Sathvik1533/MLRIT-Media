# Performance Lab Guide — /test-lab

## What This Is

A controlled performance testing environment. Not a gallery. Every interaction here generates measurable data about web optimization techniques.

Access: **http://localhost:3000/test-lab**

---

## Phase 2 Features (Current)

### Upload System
- Upload real images/videos of any size
- Auto-categorized on arrival:
  - **Small** <100KB — baseline, thumbnail-range
  - **Medium** ~500KB — typical web image
  - **Large** >2MB — high-res / video range
- Stored in Cloudinary + SQLite DB
- Each asset gets a unique test ID for repeated measurement

### Single Asset Testing
- Click any uploaded asset to run one fetch
- Measures:
  - API response time (ms)
  - Redis latency (ms)
  - Cache status: HIT / MISS
  - TTFB (Time to First Byte)
  - Payload size (bytes)

### Batch Request Testing
| Button | Requests | What It Tests |
|--------|----------|---------------|
| Run 10 | 10 sequential | Cache warming — watch MISS → HIT |
| Run 50 | 50 sequential | Steady-state hit rate |
| Run 100 | 100 sequential | Sustained load + memory pressure |

### Aggregate Metrics Panel
- Average latency (color: green <10ms, yellow <50ms, red >50ms)
- Average Redis latency
- Cache hit rate %
- Slow operation count (>10ms threshold)
- P95 latency (95th percentile)

---

## What to Look for When Testing

### Cache Warming Pattern
```
Request 1:  MISS — 45ms (DB query)
Request 2:  HIT  —  4ms (Redis)
Request 3:  HIT  —  3ms (Redis)
...
Request 10: HIT  —  3ms (Redis)
```
This is the proof that caching works. The transition from MISS to HIT is the story.

### Size Impact on Latency
```
Small image (10KB):   Redis HIT  → ~3ms
Large image (500KB):  Redis HIT  → ~8ms  (more bytes to transfer)
Video metadata (2MB): Redis HIT  → ~15ms (payload serialization cost)
```
Even cached responses have payload cost — bigger = slower, even from Redis.

### What Good Looks Like
- Avg latency: <10ms after warm-up
- Cache hit rate: >80% after 10+ requests
- Redis latency: <5ms
- Zero operations >50ms in steady state

### What Bad Looks Like
- Latency >50ms consistently (cache not working)
- Hit rate <50% (TTL too short, keys not matching)
- Redis latency >20ms (connection overhead, geographic distance)

---

## API Endpoints Used by Test Lab

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | Upload asset to Cloudinary + DB |
| `/api/test-asset?id={id}` | GET | Fetch single asset with full telemetry |
| `/api/stats` | GET | Aggregate metrics from ring buffer |

### Response Headers (Every test-asset response)
```
X-Cache: HIT | MISS
X-Response-Time: 4.23ms
X-Redis-Latency: 2.11ms
X-Payload-Size: 14.8KB
Content-Length: 15155
```

---

## Phase 3 Testing Plan (Infrastructure)

### CDN Comparison (Next)
**Goal**: Measure Cloudinary vs Cloudflare R2 vs direct serving

Test matrix:
- Same image, 3 delivery origins
- Metrics: TTFB, total transfer time, cache headers
- Tool: run 50 requests to each, compare distribution

### Load Balancer Testing (Future)
**Goal**: Measure how load distribution affects latency variance

What to measure:
- P50 / P95 / P99 latency under concurrent load
- Which requests get routed to cold instances
- Cold start penalty (first request after idle)

### Geographic Distribution (Future)
**Goal**: Measure CDN edge vs origin latency by region

Method:
- Deploy to Vercel (global edge network)
- Measure response time from different regions via synthetic monitoring
- Compare edge-cached vs origin response times

### Auto-scaling Impact (Future)
**Goal**: Measure how scale-up events affect user experience

What to look for:
- Latency spike during scale-up (new instances cold)
- Warm-up time before new instances are efficient
- How cache hit rate recovers after new instances join

---

## UI Design Spec (Dark Experimental Theme)

```
Background:    #0a0a0f  (deep black — not gray)
Primary:       #00ff88  (neon green — performance positive)
Warning:       #ffaa00  (amber — borderline)
Danger:        #ff4444  (red — slow / failed)
Surface:       #12121a  (dark card bg)
Border:        #2a2a35  (subtle separator)
Text:          #ffffff primary / #888888 secondary
```

Layout priority:
1. Metrics (largest, most prominent)
2. Controls (upload, test buttons)
3. Results list (scrollable, secondary)

No decorative elements. Every pixel should show data or enable testing.

---

## Core Concepts Behind the Tests

**Why batch testing reveals the truth:**
A single test can be a fluke (cold cache, GC pause, network blip). 50+ requests give you a distribution — and the distribution tells you how the system behaves, not just how it behaved once.

**Why payload size matters even on cache hits:**
Redis stores serialized JSON. A 2MB video record serialized = 2MB transferred from Redis → server → browser. Caching eliminates DB query time, but not transfer time. This is why large payloads still show higher latency even on HITs.

**Why P95 matters more than average:**
Average latency of 5ms sounds great. But if 1 in 20 requests spikes to 200ms (P95), real users notice. The test lab exposes this — averages hide spikes.

---

## How to Read Your Results

| Metric | What it means |
|--------|--------------|
| API Response Time | Everything: DB/Redis + serialization + network |
| Redis Latency | Redis only — isolates cache layer cost |
| TTFB | Time from request sent to first byte received |
| Cache Status | HIT = Redis served it, MISS = DB query happened |
| Payload Size | Bytes transferred — affects even cached responses |

---

*Remember: Every test is data. Every MISS is a question: why didn't the cache have this? Every slow HIT is a question: what's the payload cost? The lab exists to ask and answer these questions.*
