"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Code2, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types for query demo data
interface QueryResult {
  rank: number;
  id: string;
  score: number;
  file_path: string;
  file_name: string;
  start_line: number;
  end_line: number;
  chunk_type: string;
  language: string;
  name: string;
  signature: string;
  snippet: string;
  position_2d: [number, number, number];
}

interface Query {
  text: string;
  embedding_2d: [number, number, number];
  results: QueryResult[];
}

interface QueryDemoData {
  metadata: {
    workspace: string;
    embedding_model: string;
    embedding_dim: number;
    total_chunks: number;
    reduction_method: string;
    reduction_dim: number;
  };
  queries: Query[];
}

// Color palette for languages
const LANGUAGE_COLORS: Record<string, string> = {
  typescript: "#3178c6",
  python: "#3572A5",
  rust: "#dea584",
  json: "#292929",
  protobuf: "#65b895",
  yaml: "#cb171e",
  toml: "#9c4221",
  markdown: "#083fa1",
  css: "#563d7c",
  shell: "#89e051",
  xml: "#0060ac",
  cpp: "#f34b7d",
  unknown: "#6b7280",
};

const CHUNK_TYPE_COLORS: Record<string, string> = {
  file: "#10b981",
  function: "#3b82f6",
  class: "#8b5cf6",
  method: "#f59e0b",
  other: "#6b7280",
};

/**
 * SemanticSearchDemo - Interactive visualization of how semantic code search works
 * Shows query embedding and its nearest neighbors in the code embedding space
 */
export function SemanticSearchDemo() {
  const [data, setData] = useState<QueryDemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
  const [animationStep, setAnimationStep] = useState<"idle" | "searching" | "found">("idle");
  const [visibleResults, setVisibleResults] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  // Load query demo data
  useEffect(() => {
    fetch("/projects/fleur/query_demo_data_fleur_clean.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load demo data");
        return res.json();
      })
      .then((data: QueryDemoData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const selectedQuery = data?.queries[selectedQueryIndex];

  // Animate the search process
  const runSearch = useCallback((instant = false) => {
    if (!selectedQuery) return;

    if (instant) {
      // Skip animation, show results immediately
      setAnimationStep("found");
      setVisibleResults(selectedQuery.results.length);
      return;
    }

    setAnimationStep("searching");
    setVisibleResults(0);

    // Simulate search time
    setTimeout(() => {
      setAnimationStep("found");

      // Reveal results one by one
      const results = selectedQuery.results || [];
      results.forEach((_, i) => {
        setTimeout(() => {
          setVisibleResults((v) => Math.min(v + 1, results.length));
        }, 100 * (i + 1));
      });
    }, 500);
  }, [selectedQuery]);

  // Auto-run search when query changes or on first load
  useEffect(() => {
    if (!data || !selectedQuery) return;

    if (isFirstLoad.current) {
      // On first load, show results instantly
      isFirstLoad.current = false;
      runSearch(true);
    } else {
      // On query change, animate
      runSearch(false);
    }
  }, [data, selectedQueryIndex, selectedQuery, runSearch]);

  // Canvas visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !data || !selectedQuery) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Get all positions for normalization (use first two dimensions of 3D)
    const allPositions: [number, number][] = [];
    data.queries.forEach((q) => {
      allPositions.push([q.embedding_2d[0], q.embedding_2d[1]]);
      q.results.forEach((r) => {
        allPositions.push([r.position_2d[0], r.position_2d[1]]);
      });
    });

    // Calculate bounds with padding
    const padding = 40;
    const minX = Math.min(...allPositions.map((p) => p[0]));
    const maxX = Math.max(...allPositions.map((p) => p[0]));
    const minY = Math.min(...allPositions.map((p) => p[1]));
    const maxY = Math.max(...allPositions.map((p) => p[1]));

    const scaleX = (width - padding * 2) / (maxX - minX);
    const scaleY = (height - padding * 2) / (maxY - minY);
    const scale = Math.min(scaleX, scaleY);

    const toScreen = (x: number, y: number): [number, number] => {
      const sx = padding + (x - minX) * scale + (width - padding * 2 - (maxX - minX) * scale) / 2;
      const sy = padding + (y - minY) * scale + (height - padding * 2 - (maxY - minY) * scale) / 2;
      return [sx, sy];
    };

    // Animation frame
    let animationId: number;
    let time = 0;

    const draw = () => {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw all code embeddings as faint dots (background context)
      data.queries.forEach((q) => {
        q.results.forEach((r) => {
          if (q !== selectedQuery || animationStep === "idle") {
            const [sx, sy] = toScreen(r.position_2d[0], r.position_2d[1]);
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(100, 100, 100, 0.2)";
            ctx.fill();
          }
        });
      });

      const queryPos = toScreen(selectedQuery.embedding_2d[0], selectedQuery.embedding_2d[1]);

      // Draw connections to results when found
      if (animationStep === "found") {
        selectedQuery.results.slice(0, visibleResults).forEach((result, i) => {
          const resultPos = toScreen(result.position_2d[0], result.position_2d[1]);

          // Draw line from query to result
          const gradient = ctx.createLinearGradient(queryPos[0], queryPos[1], resultPos[0], resultPos[1]);
          gradient.addColorStop(0, `rgba(16, 185, 129, ${0.6 - i * 0.05})`);
          gradient.addColorStop(1, `rgba(16, 185, 129, ${0.2 - i * 0.02})`);

          ctx.beginPath();
          ctx.moveTo(queryPos[0], queryPos[1]);
          ctx.lineTo(resultPos[0], resultPos[1]);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = Math.max(1, 3 - i * 0.3);
          ctx.stroke();

          // Draw result point
          const color = LANGUAGE_COLORS[result.language] || LANGUAGE_COLORS.unknown;
          ctx.beginPath();
          ctx.arc(resultPos[0], resultPos[1], 8 - i * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          // Draw rank label
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${i + 1}`, resultPos[0], resultPos[1]);
        });
      }

      // Draw query point (always visible when not idle)
      if (animationStep !== "idle") {
        // Pulsing effect during search
        const pulseScale = animationStep === "searching" ? 1 + Math.sin(time * 0.1) * 0.3 : 1;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          queryPos[0],
          queryPos[1],
          0,
          queryPos[0],
          queryPos[1],
          30 * pulseScale
        );
        glowGradient.addColorStop(0, "rgba(16, 185, 129, 0.4)");
        glowGradient.addColorStop(1, "rgba(16, 185, 129, 0)");
        ctx.beginPath();
        ctx.arc(queryPos[0], queryPos[1], 30 * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Query point
        ctx.beginPath();
        ctx.arc(queryPos[0], queryPos[1], 12 * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = "#10b981";
        ctx.fill();

        // Query icon
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Q", queryPos[0], queryPos[1]);

        // Searching animation - expanding rings
        if (animationStep === "searching") {
          const numRings = 3;
          for (let i = 0; i < numRings; i++) {
            const ringProgress = ((time * 2 + i * 30) % 100) / 100;
            const ringRadius = 20 + ringProgress * 100;
            const ringAlpha = (1 - ringProgress) * 0.3;

            ctx.beginPath();
            ctx.arc(queryPos[0], queryPos[1], ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(16, 185, 129, ${ringAlpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [data, selectedQuery, animationStep, visibleResults]);

  if (loading) {
    return (
      <div className="w-full aspect-video bg-[#0a0a0a] rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-zinc-400 text-sm">Loading demo data...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full aspect-video bg-[#0a0a0a] rounded-xl flex items-center justify-center">
        <span className="text-red-400 text-sm">{error || "Failed to load data"}</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-zinc-800">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-zinc-200">Semantic Code Search</span>
          <span className="text-xs text-zinc-500 ml-auto">
            {data.metadata.total_chunks} code chunks indexed
          </span>
        </div>

        {/* Query selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-emerald-400 text-sm">Q:</span>
              <span className="text-zinc-200 text-sm truncate">{selectedQuery?.text}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden"
              >
                <ScrollArea className="max-h-[240px]">
                  {data.queries.map((query, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedQueryIndex(i);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left text-sm hover:bg-zinc-700/50 transition-colors flex items-center gap-2 ${i === selectedQueryIndex ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-300"
                        }`}
                    >
                      <span className="text-zinc-500 text-xs w-4">{i + 1}.</span>
                      {query.text}
                    </button>
                  ))}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Visualization area */}
      <div className="flex flex-col lg:flex-row">
        {/* Canvas */}
        <div ref={containerRef} className="relative h-[300px] lg:h-[400px] lg:flex-1">
          <canvas ref={canvasRef} className="absolute inset-0" />

          {/* Legend overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur px-2 py-1 rounded">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">Query</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur px-2 py-1 rounded">
              <div className="w-3 h-3 rounded-full bg-zinc-500" />
              <span className="text-zinc-400">Code chunks</span>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900/30 flex flex-col">
          <div className="p-3 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Search Results</span>
              <span className="text-xs text-zinc-500 ml-auto">
                {visibleResults} / {selectedQuery?.results.length}
              </span>
            </div>
          </div>

          <ScrollArea className="h-[200px] lg:h-[352px]">
            <div className="divide-y divide-zinc-800/50 pr-3">
              {selectedQuery?.results.slice(0, visibleResults).map((result, i) => (
                <motion.div
                  key={result.id || i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-2 py-2.5 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                >
                  {/* Header row with rank and file name */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-mono text-xs text-zinc-200 truncate flex-1 min-w-0" title={result.file_name}>
                      {result.file_name}
                    </span>
                    <span className="flex-shrink-0 text-xs font-semibold text-emerald-400 tabular-nums">
                      {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Function/class name if available */}
                  {result.name && result.name !== "(unnamed)" && (
                    <div className="text-xs text-zinc-300 mb-1.5 truncate ml-7 min-w-0">
                      {result.name}
                    </div>
                  )}

                  {/* Tags row */}
                  <div className="flex flex-wrap gap-1 ml-7 mb-1.5">
                    <span
                      className="px-1.5 py-0.5 text-[10px] rounded"
                      style={{
                        backgroundColor: (LANGUAGE_COLORS[result.language] || LANGUAGE_COLORS.unknown) + "30",
                        color: LANGUAGE_COLORS[result.language] || LANGUAGE_COLORS.unknown,
                      }}
                    >
                      {result.language}
                    </span>
                    <span
                      className="px-1.5 py-0.5 text-[10px] rounded"
                      style={{
                        backgroundColor: (CHUNK_TYPE_COLORS[result.chunk_type] || CHUNK_TYPE_COLORS.other) + "30",
                        color: CHUNK_TYPE_COLORS[result.chunk_type] || CHUNK_TYPE_COLORS.other,
                      }}
                    >
                      {result.chunk_type}
                    </span>
                  </div>

                  {/* Code snippet */}
                  <div className="ml-7 p-1.5 bg-zinc-800/50 rounded text-[10px] font-mono text-zinc-400 break-all line-clamp-2 overflow-hidden border border-zinc-700/50">
                    {result.snippet}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Footer with explanation */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <ArrowRight className="w-3 h-3" />
          <span>
            The query is embedded into the same vector space as code, then nearest neighbors are found using cosine similarity.
          </span>
        </div>
      </div>
    </div>
  );
}
