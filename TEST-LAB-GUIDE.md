# Performance Lab - Quick Start Guide

## 🎯 What Is This?

This is **NOT** a simple gallery. This is a **performance measurement system** for testing real-world media delivery optimization.

## 🚀 Access

Navigate to: **http://localhost:3000/test-lab**

## 📋 Features

### 1. Upload System
- Upload real images/videos
- Automatic size categorization:
  - **Small**: <100KB (green)
  - **Medium**: ~500KB (yellow)
  - **Large**: >2MB (red)
- Stores in Cloudinary + Database

### 2. Dynamic Testing
- Click any uploaded asset to test once
- Batch testing buttons:
  - Run 10 Requests
  - Run 50 Requests
  - Run 100 Requests

### 3. Real-Time Metrics
- **API Response Time** - Total request latency
- **Redis Latency** - Cache layer performance
- **Cache Status** - HIT (green) or MISS (yellow)
- **TTFB** - Time to First Byte
- **Payload Size** - Response size in bytes

### 4. Aggregate Analytics
- Average Latency (color-coded: <10ms green, <50ms yellow, >50ms red)
- Average Redis Latency
- Cache Hit Rate %
- Slow Operations Count (>10ms)

## 🎨 Design Philosophy

### Dark Experimental UI
- Background: `#0a0a0f` (deep black)
- Primary: `#00ff88` (neon green)
- Borders: `#2a2a35` (subtle gray)
- Cards: `#12121a` (dark gray)

### Performance-First
- Real-time updates
- Visual feedback for slow operations (red highlight)
- Clear metrics hierarchy
- No decorative fluff

## 🔬 How to Use

### Step 1: Upload Assets
1. Click "Choose File"
2. Select an image or video
3. System auto-categorizes by size
4. Asset appears in "Uploaded Assets" list

### Step 2: Run Single Test
- Click any asset card
- Metrics appear in "Test Results"
- Watch for cache HIT/MISS

### Step 3: Run Batch Tests
- Use "Run 10/50/100 Requests" buttons
- Observe cache warming (MISS → HIT)
- Watch aggregate metrics update

### Step 4: Analyze Results
- Check average latency
- Monitor cache hit rate
- Identify slow operations (>10ms)
- Compare small vs large assets

## 📊 What to Look For

### Good Performance
- ✅ Avg latency <10ms
- ✅ Cache hit rate >80%
- ✅ Redis latency <5ms
- ✅ Zero slow operations

### Performance Issues
- ❌ Latency >50ms
- ❌ Cache hit rate <50%
- ❌ Many slow operations
- ❌ High Redis latency

## 🔧 Technical Details

### API Endpoints
- `POST /api/upload` - Upload to Cloudinary + DB
- `GET /api/test-asset?id={id}` - Test asset with metrics

### Caching Strategy
- First request: MISS (queries database)
- Subsequent requests: HIT (from Redis)
- TTL: 5 minutes
- Cache key: `test-asset:{id}`

### Metrics Calculation
- Uses `performance.now()` for sub-millisecond precision
- Tracks last 100 test results
- Real-time aggregate calculations

## 🎯 Goals

### Target Metrics
- **<50ms INP** (Interaction to Next Paint)
- **95+ Lighthouse Score**
- **Near-zero perceived latency**

### Optimization Path
1. Test different asset sizes
2. Measure real-world performance
3. Identify bottlenecks
4. Optimize based on data
5. Iterate

## 🚨 Important Notes

- This is a **measurement tool**, not production gallery
- Upload real assets to get real data
- Run multiple tests to see cache warming
- Compare results across different sizes
- Use data to inform optimization decisions

## 🔮 Future Enhancements

- [ ] Lighthouse integration
- [ ] INP measurement
- [ ] Network throttling simulation
- [ ] Adaptive media format testing (WebP, AVIF)
- [ ] Video HLS streaming tests
- [ ] Edge function performance
- [ ] Geographic latency testing

---

**Remember**: This is about **measuring and learning**, not just displaying media. Every test teaches us something about optimal media delivery.
