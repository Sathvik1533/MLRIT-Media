"use client";

/**
 * Redis Metrics Dashboard
 * 
 * Comprehensive Redis tracking section at the top of the page
 * Shows all core metrics and measures in real-time with realistic animations
 */

import { useState, useEffect, useRef } from "react";

interface RedisStats {
  status: string;
  db: {
    totalMedia: number;
    connected: boolean;
  };
  cache: {
    configured: boolean;
    provider: string;
    hitRatePct: number;
    hitCount: number;
    missCount: number;
    sampledFrom: number;
  };
  load: {
    requestsPerMinute: number;
    avgLatencyMs: number;
    avgRedisLatencyMs: number | null;
    avgPayloadBytes: number;
    avgPayloadKB: string;
    lastCheckedMs: number;
  };
  timestamp: string;
}

export function RedisMetricsDashboard() {
  const [stats, setStats] = useState<RedisStats | null>(null);
  const [prevStats, setPrevStats] = useState<RedisStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const latencyHistory = useRef<number[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setPrevStats(stats);
        setStats(data);
        
        // Track latency history for sparkline
        if (data.load.avgRedisLatencyMs !== null && data.load.avgRedisLatencyMs >= 0) {
          latencyHistory.current.push(data.load.avgRedisLatencyMs);
          if (latencyHistory.current.length > 20) latencyHistory.current.shift();
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [stats]);

  // Animation helper for value changes
  const getValueChange = (current: number, previous: number | undefined) => {
    if (!previous || previous === current) return null;
    const diff = current - previous;
    return diff > 0 ? "↑" : "↓";
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-slate-700/50 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 animate-pulse"></div>
        <div className="max-w-7xl mx-auto text-white text-center relative z-10">
          <div className="inline-flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Initializing Redis metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const getHealthColor = () => {
    if (!stats.cache.configured) return "bg-gray-500";
    if (stats.cache.hitRatePct >= 80) return "bg-green-500";
    if (stats.cache.hitRatePct >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLatencyColor = (ms: number | null) => {
    if (ms === null || ms < 0) return "text-gray-400";
    if (ms <= 5) return "text-green-400";
    if (ms <= 10) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-slate-700/50 shadow-2xl relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
      
      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl animate-pulse">⚡</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Redis Infrastructure Metrics
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              Real-time cache performance and system health monitoring
              <span className="text-slate-500">• Updates every 2s</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700/50">
              <div className={`w-3 h-3 rounded-full ${getHealthColor()} ${stats.cache.configured ? 'animate-pulse' : ''}`}></div>
              <span className="text-white font-semibold">
                {stats.cache.configured ? "🟢 Redis Active" : "🔴 Redis Offline"}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Last sync: {new Date(stats.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Cache Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Cache Provider</div>
              <div className="text-2xl group-hover:scale-110 transition-transform">🗄️</div>
            </div>
            <div className="text-white text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
              {stats.cache.provider}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stats.cache.configured ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`}></div>
              <div className="text-slate-500 text-xs">
                {stats.cache.configured ? "Connected & Ready" : "Not Configured"}
              </div>
            </div>
          </div>

          {/* Hit Rate */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Cache Hit Rate</div>
              <div className="text-2xl group-hover:scale-110 transition-transform">🎯</div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-white text-3xl font-bold group-hover:text-green-400 transition-colors">
                {stats.cache.hitRatePct}%
              </div>
              {prevStats && getValueChange(stats.cache.hitRatePct, prevStats.cache.hitRatePct) && (
                <span className={`text-sm ${stats.cache.hitRatePct > prevStats.cache.hitRatePct ? 'text-green-400' : 'text-red-400'} animate-pulse`}>
                  {getValueChange(stats.cache.hitRatePct, prevStats.cache.hitRatePct)}
                </span>
              )}
            </div>
            <div className="flex gap-3 text-xs mb-3">
              <span className="text-green-400 font-semibold">✓ {stats.cache.hitCount}</span>
              <span className="text-red-400 font-semibold">✗ {stats.cache.missCount}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${getHealthColor()} relative`}
                style={{ width: `${stats.cache.hitRatePct}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Redis Latency */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Redis Latency</div>
              <div className="text-2xl group-hover:scale-110 transition-transform">⚡</div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <div className={`text-3xl font-bold transition-colors ${getLatencyColor(stats.load.avgRedisLatencyMs)}`}>
                {stats.load.avgRedisLatencyMs !== null && stats.load.avgRedisLatencyMs >= 0
                  ? `${stats.load.avgRedisLatencyMs}ms`
                  : "N/A"}
              </div>
              {prevStats && stats.load.avgRedisLatencyMs !== null && prevStats.load.avgRedisLatencyMs !== null && 
               getValueChange(stats.load.avgRedisLatencyMs, prevStats.load.avgRedisLatencyMs) && (
                <span className={`text-sm ${stats.load.avgRedisLatencyMs < prevStats.load.avgRedisLatencyMs ? 'text-green-400' : 'text-red-400'} animate-pulse`}>
                  {getValueChange(stats.load.avgRedisLatencyMs, prevStats.load.avgRedisLatencyMs)}
                </span>
              )}
            </div>
            <div className="text-slate-500 text-xs mb-2">Round-trip time</div>
            {/* Mini sparkline */}
            {latencyHistory.current.length > 1 && (
              <div className="h-8 flex items-end gap-0.5">
                {latencyHistory.current.slice(-15).map((val, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all ${getLatencyColor(val).replace('text-', 'bg-')}`}
                    style={{ height: `${(val / Math.max(...latencyHistory.current)) * 100}%` }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {/* Total Latency */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Total Latency</div>
              <div className="text-2xl group-hover:scale-110 transition-transform">⏱️</div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-white text-3xl font-bold group-hover:text-cyan-400 transition-colors">
                {stats.load.avgLatencyMs}ms
              </div>
              {prevStats && getValueChange(stats.load.avgLatencyMs, prevStats.load.avgLatencyMs) && (
                <span className={`text-sm ${stats.load.avgLatencyMs < prevStats.load.avgLatencyMs ? 'text-green-400' : 'text-red-400'} animate-pulse`}>
                  {getValueChange(stats.load.avgLatencyMs, prevStats.load.avgLatencyMs)}
                </span>
              )}
            </div>
            <div className="text-slate-500 text-xs">Server processing</div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Requests Per Minute */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 hover:border-blue-500/30 transition-all">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>📊</span> Requests/Min
            </div>
            <div className="text-white text-xl font-bold">{stats.load.requestsPerMinute}</div>
          </div>

          {/* Payload Size */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 hover:border-purple-500/30 transition-all">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>📦</span> Avg Payload
            </div>
            <div className="text-white text-xl font-bold">{stats.load.avgPayloadKB} KB</div>
          </div>

          {/* Sample Size */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 hover:border-green-500/30 transition-all">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>🔢</span> Sample Size
            </div>
            <div className="text-white text-xl font-bold">{stats.cache.sampledFrom}</div>
            <div className="text-slate-500 text-xs mt-1">Last 20 requests</div>
          </div>

          {/* Total Media */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 hover:border-cyan-500/30 transition-all">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>🎬</span> Total Assets
            </div>
            <div className="text-white text-xl font-bold">{stats.db.totalMedia}</div>
          </div>

          {/* Last Updated */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 hover:border-yellow-500/30 transition-all">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>⏰</span> Last Check
            </div>
            <div className="text-white text-xl font-bold">{stats.load.lastCheckedMs}ms</div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="mt-6 flex items-center justify-between text-xs bg-slate-800/20 rounded-lg p-3 border border-slate-700/30">
          <div className="flex gap-6 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Excellent: &lt;5ms
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              Good: 5-10ms
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Pressure: &gt;10ms
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span>Live • {new Date(stats.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
