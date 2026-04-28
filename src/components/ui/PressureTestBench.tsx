"use client";

/**
 * Pressure Test Bench
 * 
 * Upload and test different file sizes to see Redis pressure:
 * - Small images (~100KB)
 * - Large images (~2MB)
 * - Small videos (~5MB)
 * - Large videos (~50MB)
 */

import { useState } from "react";
import { traceFetch, TelemetryPulse } from "@/lib/telemetry";

interface TestResult {
  fileName: string;
  fileSize: string;
  type: "image" | "video";
  pulse: TelemetryPulse;
  timestamp: string;
}

export function PressureTestBench() {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runTest = async (size: "small" | "large", type: "image" | "video") => {
    setTesting(true);
    
    try {
      // Simulate different payload sizes by fetching with different filters
      const url = type === "image" 
        ? `/api/media?type=image&category=${size === "small" ? "campus" : "all"}`
        : `/api/media?type=video`;

      const { data, pulse } = await traceFetch<any>(url);
      
      const result: TestResult = {
        fileName: `${size}-${type}-test`,
        fileSize: pulse.payloadSize,
        type,
        pulse,
        timestamp: new Date().toLocaleTimeString(),
      };

      setResults(prev => [result, ...prev].slice(0, 10)); // Keep last 10
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setTesting(false);
    }
  };

  const getLatencyColor = (ms: number | null) => {
    if (!ms || ms < 0) return "text-gray-400";
    if (ms <= 5) return "text-green-500";
    if (ms <= 10) return "text-yellow-500";
    return "text-amber-500";
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg font-mono text-sm transition-all"
      >
        {isOpen ? "CLOSE TEST BENCH ▼" : "REDIS TEST BENCH ▲"}
      </button>

      {/* Test Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-sm text-white p-6 rounded-lg shadow-2xl border border-white/20 w-[500px] max-h-[600px] overflow-auto">
          <h3 className="text-lg font-bold mb-4 text-purple-400">Redis Pressure Test Bench</h3>
          
          {/* Test Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => runTest("small", "image")}
              disabled={testing}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-3 rounded text-sm font-semibold transition-all"
            >
              📷 Small Image
              <div className="text-xs opacity-70">~10KB</div>
            </button>
            
            <button
              onClick={() => runTest("large", "image")}
              disabled={testing}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-4 py-3 rounded text-sm font-semibold transition-all"
            >
              📷 Large Image
              <div className="text-xs opacity-70">~50KB</div>
            </button>
            
            <button
              onClick={() => runTest("small", "video")}
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-3 rounded text-sm font-semibold transition-all"
            >
              🎥 Small Video
              <div className="text-xs opacity-70">~5KB metadata</div>
            </button>
            
            <button
              onClick={() => runTest("large", "video")}
              disabled={testing}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-3 rounded text-sm font-semibold transition-all"
            >
              🎥 Large Video
              <div className="text-xs opacity-70">~10KB metadata</div>
            </button>
          </div>

          {testing && (
            <div className="text-center py-4 text-purple-400 animate-pulse">
              Testing pressure...
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2 text-white/70">Test Results (Last 10)</h4>
              <div className="space-y-2 font-mono text-xs">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 p-3 rounded border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-white">
                        {result.type === "image" ? "📷" : "🎥"} {result.fileName}
                      </span>
                      <span className="text-white/50">{result.timestamp}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-white/70">
                      <div>
                        <span className="text-white/50">Source:</span>{" "}
                        <span className={result.pulse.source.includes("Redis") ? "text-green-400" : "text-yellow-400"}>
                          {result.pulse.source}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/50">Payload:</span>{" "}
                        <span className="text-white">{result.fileSize}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Total:</span>{" "}
                        <span className="text-white">{result.pulse.latency}ms</span>
                      </div>
                      <div>
                        <span className="text-white/50">Redis:</span>{" "}
                        <span className={getLatencyColor(result.pulse.redisLatencyMs)}>
                          {result.pulse.redisLatencyMs !== null && result.pulse.redisLatencyMs >= 0
                            ? `${result.pulse.redisLatencyMs}ms`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/50">
            <div className="font-semibold mb-1">Color Guide:</div>
            <div className="space-y-1">
              <div><span className="text-green-500">●</span> Excellent (&lt;5ms)</div>
              <div><span className="text-yellow-500">●</span> Good (5-10ms)</div>
              <div><span className="text-amber-500">●</span> Pressure (&gt;10ms)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
