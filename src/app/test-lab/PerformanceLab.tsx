"use client";

import { useState, useRef } from "react";

interface TestResult {
  id: string;
  type: "image" | "video";
  size: "small" | "medium" | "large";
  timestamp: number;
  metrics: {
    redisLatency: number;
    apiResponseTime: number;
    cacheStatus: "HIT" | "MISS";
    payloadSize: number;
    ttfb: number;
    loadTime: number;
  };
}

interface UploadedAsset {
  id: string;
  publicId: string;
  type: "image" | "video";
  size: string;
  url: string;
  uploadedAt: number;
}

export function PerformanceLab() {
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload handler
  const handleUpload = async (file: File, sizeCategory: "small" | "medium" | "large") => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sizeCategory", sizeCategory);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      setUploadedAssets(prev => [...prev, {
        id: data.id,
        publicId: data.publicId,
        type: file.type.startsWith("video") ? "video" : "image",
        size: sizeCategory,
        url: data.url,
        uploadedAt: Date.now(),
      }]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Test runner
  const runTest = async (assetId: string, iterations: number = 1) => {
    setIsTesting(true);
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(`/api/test-asset?id=${assetId}`, {
          method: "GET",
        });

        const ttfb = performance.now() - startTime;
        const data = await response.json();
        const totalTime = performance.now() - startTime;

        const result: TestResult = {
          id: `test-${Date.now()}-${i}`,
          type: data.type,
          size: data.size,
          timestamp: Date.now(),
          metrics: {
            redisLatency: data.redisLatency || 0,
            apiResponseTime: totalTime,
            cacheStatus: data.cacheStatus,
            payloadSize: data.payloadSize || 0,
            ttfb,
            loadTime: totalTime,
          },
        };

        setTestResults(prev => [result, ...prev].slice(0, 100));
      } catch (error) {
        console.error("Test failed:", error);
      }

      // Small delay between iterations
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setIsTesting(false);
  };

  // Calculate aggregate metrics
  const aggregateMetrics = testResults.length > 0 ? {
    avgLatency: testResults.reduce((sum, r) => sum + r.metrics.apiResponseTime, 0) / testResults.length,
    avgRedisLatency: testResults.reduce((sum, r) => sum + r.metrics.redisLatency, 0) / testResults.length,
    cacheHitRate: (testResults.filter(r => r.metrics.cacheStatus === "HIT").length / testResults.length) * 100,
    slowOps: testResults.filter(r => r.metrics.apiResponseTime > 10).length,
  } : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e8e8ea]">
      {/* Header */}
      <div className="border-b border-[#2a2a35] bg-[#12121a]">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#00ff88] mb-1">
                Performance Lab
              </h1>
              <p className="text-sm text-[#8a8a95]">
                Real-time media performance testing & optimization
              </p>
            </div>
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-[#1a1a25] rounded-lg border border-[#2a2a35]">
                <div className="text-xs text-[#8a8a95]">Tests Run</div>
                <div className="text-2xl font-bold text-[#00ff88]">{testResults.length}</div>
              </div>
              <div className="px-4 py-2 bg-[#1a1a25] rounded-lg border border-[#2a2a35]">
                <div className="text-xs text-[#8a8a95]">Assets</div>
                <div className="text-2xl font-bold text-[#00ff88]">{uploadedAssets.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-[#12121a] border border-[#2a2a35] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#00ff88]">
                📤 Upload Assets
              </h2>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const sizeMB = file.size / (1024 * 1024);
                    const category = sizeMB < 0.1 ? "small" : sizeMB < 1 ? "medium" : "large";
                    handleUpload(file, category);
                  }
                }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-3 bg-[#00ff88] text-[#0a0a0f] rounded-lg font-semibold hover:bg-[#00dd77] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Choose File"}
              </button>

              <div className="mt-6 space-y-2">
                <div className="text-xs text-[#8a8a95] mb-2">Size Categories:</div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Small: &lt;100KB</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Medium: ~500KB</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Large: &gt;2MB</span>
                </div>
              </div>

              {/* Uploaded Assets */}
              {uploadedAssets.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-semibold mb-3">Uploaded Assets</div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {uploadedAssets.map(asset => (
                      <div
                        key={asset.id}
                        className="p-3 bg-[#1a1a25] rounded-lg border border-[#2a2a35] hover:border-[#00ff88] transition-colors cursor-pointer"
                        onClick={() => runTest(asset.id, 1)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-[#00ff88]">
                            {asset.type === "video" ? "🎥" : "🖼️"} {asset.size}
                          </span>
                          <span className="text-xs text-[#8a8a95]">
                            {new Date(asset.uploadedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-xs text-[#8a8a95] truncate">
                          {asset.publicId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Test Controls */}
            {uploadedAssets.length > 0 && (
              <div className="mt-6 bg-[#12121a] border border-[#2a2a35] rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 text-[#00ff88]">
                  🧪 Batch Tests
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => runTest(uploadedAssets[0].id, 10)}
                    disabled={isTesting}
                    className="w-full py-2 bg-[#1a1a25] border border-[#2a2a35] rounded-lg hover:border-[#00ff88] transition-colors disabled:opacity-50"
                  >
                    Run 10 Requests
                  </button>
                  <button
                    onClick={() => runTest(uploadedAssets[0].id, 50)}
                    disabled={isTesting}
                    className="w-full py-2 bg-[#1a1a25] border border-[#2a2a35] rounded-lg hover:border-[#00ff88] transition-colors disabled:opacity-50"
                  >
                    Run 50 Requests
                  </button>
                  <button
                    onClick={() => runTest(uploadedAssets[0].id, 100)}
                    disabled={isTesting}
                    className="w-full py-2 bg-[#1a1a25] border border-[#2a2a35] rounded-lg hover:border-[#00ff88] transition-colors disabled:opacity-50"
                  >
                    Run 100 Requests
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Metrics & Results */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Aggregate Metrics */}
            {aggregateMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#12121a] border border-[#2a2a35] rounded-xl p-4">
                  <div className="text-xs text-[#8a8a95] mb-1">Avg Latency</div>
                  <div className={`text-2xl font-bold ${aggregateMetrics.avgLatency < 10 ? "text-green-500" : aggregateMetrics.avgLatency < 50 ? "text-yellow-500" : "text-red-500"}`}>
                    {aggregateMetrics.avgLatency.toFixed(1)}ms
                  </div>
                </div>
                <div className="bg-[#12121a] border border-[#2a2a35] rounded-xl p-4">
                  <div className="text-xs text-[#8a8a95] mb-1">Redis Latency</div>
                  <div className="text-2xl font-bold text-[#00ff88]">
                    {aggregateMetrics.avgRedisLatency.toFixed(1)}ms
                  </div>
                </div>
                <div className="bg-[#12121a] border border-[#2a2a35] rounded-xl p-4">
                  <div className="text-xs text-[#8a8a95] mb-1">Cache Hit Rate</div>
                  <div className="text-2xl font-bold text-[#00ff88]">
                    {aggregateMetrics.cacheHitRate.toFixed(0)}%
                  </div>
                </div>
                <div className="bg-[#12121a] border border-[#2a2a35] rounded-xl p-4">
                  <div className="text-xs text-[#8a8a95] mb-1">Slow Ops (&gt;10ms)</div>
                  <div className={`text-2xl font-bold ${aggregateMetrics.slowOps === 0 ? "text-green-500" : "text-red-500"}`}>
                    {aggregateMetrics.slowOps}
                  </div>
                </div>
              </div>
            )}

            {/* Test Results */}
            <div className="bg-[#12121a] border border-[#2a2a35] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#00ff88]">
                📊 Test Results
              </h2>
              
              {testResults.length === 0 ? (
                <div className="text-center py-12 text-[#8a8a95]">
                  No tests run yet. Upload an asset and click to test.
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {testResults.map(result => (
                    <div
                      key={result.id}
                      className={`p-4 rounded-lg border ${
                        result.metrics.apiResponseTime > 10
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-[#1a1a25] border-[#2a2a35]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono px-2 py-1 bg-[#2a2a35] rounded">
                            {result.type === "video" ? "🎥" : "🖼️"} {result.size}
                          </span>
                          <span className={`text-xs font-mono px-2 py-1 rounded ${
                            result.metrics.cacheStatus === "HIT"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {result.metrics.cacheStatus}
                          </span>
                        </div>
                        <span className="text-xs text-[#8a8a95]">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-[#8a8a95]">API Time</div>
                          <div className={`font-mono ${
                            result.metrics.apiResponseTime < 10 ? "text-green-400" :
                            result.metrics.apiResponseTime < 50 ? "text-yellow-400" :
                            "text-red-400"
                          }`}>
                            {result.metrics.apiResponseTime.toFixed(2)}ms
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[#8a8a95]">Redis</div>
                          <div className="font-mono text-[#00ff88]">
                            {result.metrics.redisLatency.toFixed(2)}ms
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[#8a8a95]">TTFB</div>
                          <div className="font-mono">
                            {result.metrics.ttfb.toFixed(2)}ms
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
