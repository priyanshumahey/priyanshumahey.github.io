"use client";

import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

// Types for embedding data
interface EmbeddingPoint {
  id: string;
  x: number;
  y: number;
  file_path: string;
  filename: string;
  chunk_type: "file" | "function" | "class" | "method" | "other";
  language: string;
  name: string;
  signature: string;
  start_line: number;
  end_line: number;
  snippet: string;
}

interface EmbeddingData {
  embeddings: EmbeddingPoint[];
  stats: {
    total_count: number;
    languages: string[];
    chunk_types: string[];
  };
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

// Color palette for chunk types
const CHUNK_TYPE_COLORS: Record<string, string> = {
  file: "#10b981",
  function: "#3b82f6",
  class: "#8b5cf6",
  method: "#f59e0b",
  other: "#6b7280",
};

type ColorMode = "language" | "chunk_type";
type FilterType = "all" | string;

/**
 * FleurDemo Component - Interactive code embedding visualization
 * Shows code chunks as points in a 2D embedding space
 */
export function FleurDemo() {
  const [data, setData] = useState<EmbeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<EmbeddingPoint | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>("language");
  const [languageFilter, setLanguageFilter] = useState<FilterType>("all");
  const [chunkTypeFilter, setChunkTypeFilter] = useState<FilterType>("all");
  const [hoveredPoint, setHoveredPoint] = useState<EmbeddingPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load embedding data
  useEffect(() => {
    fetch("/projects/fleur/embeddings.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load embeddings");
        return res.json();
      })
      .then((data: EmbeddingData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter and group embeddings for the scatterplot
  const scatterData = useMemo(() => {
    if (!data) return [];

    const filtered = data.embeddings.filter((point) => {
      if (languageFilter !== "all" && point.language !== languageFilter) {
        return false;
      }
      if (chunkTypeFilter !== "all" && point.chunk_type !== chunkTypeFilter) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          point.filename.toLowerCase().includes(query) ||
          point.name.toLowerCase().includes(query) ||
          point.snippet.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Group by the colorMode
    if (colorMode === "language") {
      const groups: Record<string, { id: string; data: { x: number; y: number; point: EmbeddingPoint }[] }> = {};
      filtered.forEach((point) => {
        const key = point.language;
        if (!groups[key]) {
          groups[key] = { id: key, data: [] };
        }
        groups[key].data.push({ x: point.x, y: point.y, point });
      });
      return Object.values(groups);
    } else {
      const groups: Record<string, { id: string; data: { x: number; y: number; point: EmbeddingPoint }[] }> = {};
      filtered.forEach((point) => {
        const key = point.chunk_type;
        if (!groups[key]) {
          groups[key] = { id: key, data: [] };
        }
        groups[key].data.push({ x: point.x, y: point.y, point });
      });
      return Object.values(groups);
    }
  }, [data, colorMode, languageFilter, chunkTypeFilter, searchQuery]);

  // Get color for a series
  const getColor = useCallback(
    (node: { serieId: string | number }) => {
      const serieId = String(node.serieId);
      if (colorMode === "language") {
        return LANGUAGE_COLORS[serieId] || LANGUAGE_COLORS.unknown;
      }
      return CHUNK_TYPE_COLORS[serieId] || CHUNK_TYPE_COLORS.other;
    },
    [colorMode]
  );

  if (loading) {
    return (
      <div className="w-full aspect-video bg-[#0a0a0a] rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-zinc-400 text-sm">Loading embeddings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-[#0a0a0a] rounded-xl flex items-center justify-center">
        <span className="text-red-400 text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0a0a0a] rounded-xl overflow-hidden">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-zinc-800">
        {/* Color mode toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Color by:</span>
          <button
            onClick={() => setColorMode("language")}
            className={`px-2 py-1 text-xs rounded transition-colors ${colorMode === "language"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
          >
            Language
          </button>
          <button
            onClick={() => setColorMode("chunk_type")}
            className={`px-2 py-1 text-xs rounded transition-colors ${colorMode === "chunk_type"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
          >
            Type
          </button>
        </div>

        {/* Language filter */}
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Languages</option>
          {data?.stats.languages.sort().map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        {/* Chunk type filter */}
        <select
          value={chunkTypeFilter}
          onChange={(e) => setChunkTypeFilter(e.target.value)}
          className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Types</option>
          {data?.stats.chunk_types.sort().map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search code..."
          className="flex-1 min-w-[120px] bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700 focus:outline-none focus:border-emerald-500"
        />

        {/* Stats */}
        <div className="text-xs text-zinc-500">
          {scatterData.reduce((acc, s) => acc + s.data.length, 0)} / {data?.stats.total_count} chunks
        </div>
      </div>

      {/* Chart container */}
      <div className="relative h-[400px] md:h-[500px]">
        <ResponsiveScatterPlot
          data={scatterData}
          margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
          xScale={{ type: "linear", min: "auto", max: "auto" }}
          yScale={{ type: "linear", min: "auto", max: "auto" }}
          colors={getColor}
          blendMode="normal"
          nodeSize={8}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Embedding Dimension 1",
            legendPosition: "middle",
            legendOffset: 46,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Embedding Dimension 2",
            legendPosition: "middle",
            legendOffset: -50,
          }}
          theme={{
            background: "#0a0a0a",
            text: {
              fill: "#71717a",
            },
            axis: {
              domain: {
                line: {
                  stroke: "#27272a",
                },
              },
              ticks: {
                line: {
                  stroke: "#27272a",
                },
                text: {
                  fill: "#52525b",
                },
              },
              legend: {
                text: {
                  fill: "#71717a",
                  fontSize: 11,
                },
              },
            },
            grid: {
              line: {
                stroke: "#18181b",
              },
            },
            tooltip: {
              container: {
                background: "#18181b",
                color: "#e4e4e7",
                fontSize: 12,
                borderRadius: 6,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              },
            },
          }}
          useMesh={true}
          onClick={(node) => {
            const pointData = node.data as { x: number; y: number; point: EmbeddingPoint };
            setSelectedPoint(pointData.point);
          }}
          onMouseEnter={(node) => {
            const pointData = node.data as { x: number; y: number; point: EmbeddingPoint };
            setHoveredPoint(pointData.point);
          }}
          onMouseLeave={() => {
            setHoveredPoint(null);
          }}
          tooltip={({ node }) => {
            const pointData = node.data as { x: number; y: number; point: EmbeddingPoint };
            const point = pointData.point;
            return (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 min-w-[240px] shadow-xl">
                <div className="font-mono text-sm text-emerald-400 mb-1 break-all">{point.filename}</div>
                {point.name && <div className="text-zinc-300 text-sm font-medium">{point.name}</div>}
                <div className="flex gap-2 mt-2">
                  <span
                    className="px-1.5 py-0.5 text-xs rounded whitespace-nowrap"
                    style={{ backgroundColor: LANGUAGE_COLORS[point.language] + "30", color: LANGUAGE_COLORS[point.language] }}
                  >
                    {point.language}
                  </span>
                  <span
                    className="px-1.5 py-0.5 text-xs rounded whitespace-nowrap"
                    style={{ backgroundColor: CHUNK_TYPE_COLORS[point.chunk_type] + "30", color: CHUNK_TYPE_COLORS[point.chunk_type] }}
                  >
                    {point.chunk_type}
                  </span>
                </div>
              </div>
            );
          }}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 0,
              translateY: 0,
              itemWidth: 100,
              itemHeight: 12,
              itemsSpacing: 4,
              symbolSize: 8,
              symbolShape: "circle",
              itemTextColor: "#71717a",
            },
          ]}
        />

        {/* Selected point details panel */}
        <AnimatePresence>
          {selectedPoint && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 w-80 bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-lg p-4 shadow-xl"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-mono text-sm text-emerald-400">{selectedPoint.filename}</div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ✕
                </button>
              </div>

              {selectedPoint.name && (
                <div className="text-zinc-200 font-medium mb-2">{selectedPoint.name}</div>
              )}

              <div className="flex gap-2 mb-3">
                <span
                  className="px-2 py-0.5 text-xs rounded"
                  style={{ backgroundColor: LANGUAGE_COLORS[selectedPoint.language] + "30", color: LANGUAGE_COLORS[selectedPoint.language] }}
                >
                  {selectedPoint.language}
                </span>
                <span
                  className="px-2 py-0.5 text-xs rounded"
                  style={{ backgroundColor: CHUNK_TYPE_COLORS[selectedPoint.chunk_type] + "30", color: CHUNK_TYPE_COLORS[selectedPoint.chunk_type] }}
                >
                  {selectedPoint.chunk_type}
                </span>
                <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400">
                  L{selectedPoint.start_line}-{selectedPoint.end_line}
                </span>
              </div>

              <div className="text-xs text-zinc-500 mb-2">Path: {selectedPoint.file_path}</div>

              {selectedPoint.signature && (
                <div className="font-mono text-xs text-blue-400 mb-2 p-2 bg-zinc-800/50 rounded">
                  {selectedPoint.signature}
                </div>
              )}

              <div className="font-mono text-xs text-zinc-400 p-2 bg-zinc-800/50 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                {selectedPoint.snippet}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-500 mb-2">
          {colorMode === "language" ? "Languages" : "Chunk Types"}:
        </div>
        <div className="flex flex-wrap gap-2">
          {colorMode === "language"
            ? Object.entries(LANGUAGE_COLORS)
              .filter(([lang]) => data?.stats.languages.includes(lang))
              .map(([lang, color]) => (
                <button
                  key={lang}
                  onClick={() => setLanguageFilter(languageFilter === lang ? "all" : lang)}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-all ${languageFilter === lang
                      ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-zinc-900"
                      : "opacity-70 hover:opacity-100"
                    }`}
                  style={{ backgroundColor: color + "20", color }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {lang}
                </button>
              ))
            : Object.entries(CHUNK_TYPE_COLORS)
              .filter(([type]) => data?.stats.chunk_types.includes(type))
              .map(([type, color]) => (
                <button
                  key={type}
                  onClick={() => setChunkTypeFilter(chunkTypeFilter === type ? "all" : type)}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-all ${chunkTypeFilter === type
                      ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-zinc-900"
                      : "opacity-70 hover:opacity-100"
                    }`}
                  style={{ backgroundColor: color + "20", color }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {type}
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}
