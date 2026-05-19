/**
 * Results Day Load Test
 *
 * Simulates 500 concurrent users hitting the media API for ~2 minutes.
 * Models real traffic shape: ramp up → peak → ramp down.
 *
 * Success criteria:
 *   - p95 response time < 200ms
 *   - error rate < 1%
 *
 * Run: k6 run load-tests/results-day.js
 */

import http from "k6/http";
import { sleep, check } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");
const BASE = "http://localhost:3000";

export const options = {
  stages: [
    { duration: "30s", target: 500 }, // students start arriving
    { duration: "60s", target: 500 }, // peak — results published
    { duration: "30s", target: 0   }, // traffic subsides
  ],
  thresholds: {
    // p95 latency must stay under 200ms
    http_req_duration: ["p(95)<200"],
    // error rate must stay under 1%
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const rand = Math.random();
  let res;

  // Weighted endpoint distribution — mirrors real Results Day browse pattern
  if (rand < 0.50) {
    // 50% — homepage media load
    res = http.get(`${BASE}/api/media`);
  } else if (rand < 0.85) {
    // 35% — filtered by events category (most common Results Day search)
    res = http.get(`${BASE}/api/media?category=events`);
  } else {
    // 15% — dashboard/HUD stats polling
    res = http.get(`${BASE}/api/stats`);
  }

  const ok = check(res, {
    "status 200": (r) => r.status === 200,
    "has body":   (r) => r.body && r.body.length > 0,
  });

  errorRate.add(!ok);

  // 1s think time between requests — models real browser pacing.
  // Without this, VUs hammer at full speed and don't reflect real user behavior.
  sleep(1);
}
