"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    Braces,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Code2,
    FileCode,
    Hash,
    Layers,
    Scissors,
    Search,
    Sparkles,
    Target,
    TreePine
} from "lucide-react";
import { useMemo, useState } from "react";

// Sample Python code to demonstrate parsing
const SAMPLE_CODE = `import numpy as np
from typing import List, Optional

class DataProcessor:
    """Handles data processing operations."""
    
    def __init__(self, config: dict):
        self.config = config
        self.cache = {}
    
    def normalize(self, data: List[float]) -> np.ndarray:
        """Normalize data to [0, 1] range."""
        arr = np.array(data)
        min_val, max_val = arr.min(), arr.max()
        return (arr - min_val) / (max_val - min_val)
    
    def transform(self, data: List[float], 
                  scale: float = 1.0) -> np.ndarray:
        """Apply transformation to data."""
        normalized = self.normalize(data)
        return normalized * scale

def calculate_stats(values: List[float]) -> dict:
    """Calculate basic statistics."""
    arr = np.array(values)
    return {
        "mean": float(arr.mean()),
        "std": float(arr.std()),
        "min": float(arr.min()),
        "max": float(arr.max())
    }`;

// Simulated AST structure (what tree-sitter would produce)
interface ASTNode {
    id: string;
    type: string;
    name?: string;
    startLine: number;
    endLine: number;
    children?: ASTNode[];
    isChunkable?: boolean; // Can this be extracted as a semantic chunk?
}

const AST_TREE: ASTNode = {
    id: "root",
    type: "module",
    name: "data_processor.py",
    startLine: 1,
    endLine: 32,
    children: [
        {
            id: "import-1",
            type: "import_statement",
            name: "import numpy",
            startLine: 1,
            endLine: 1,
        },
        {
            id: "import-2",
            type: "import_from_statement",
            name: "from typing import",
            startLine: 2,
            endLine: 2,
        },
        {
            id: "class-1",
            type: "class_definition",
            name: "DataProcessor",
            startLine: 4,
            endLine: 22,
            isChunkable: true,
            children: [
                {
                    id: "docstring-1",
                    type: "expression_statement",
                    name: "docstring",
                    startLine: 5,
                    endLine: 5,
                },
                {
                    id: "method-1",
                    type: "function_definition",
                    name: "__init__",
                    startLine: 7,
                    endLine: 9,
                    isChunkable: true,
                },
                {
                    id: "method-2",
                    type: "function_definition",
                    name: "normalize",
                    startLine: 11,
                    endLine: 16,
                    isChunkable: true,
                },
                {
                    id: "method-3",
                    type: "function_definition",
                    name: "transform",
                    startLine: 18,
                    endLine: 22,
                    isChunkable: true,
                },
            ],
        },
        {
            id: "func-1",
            type: "function_definition",
            name: "calculate_stats",
            startLine: 24,
            endLine: 32,
            isChunkable: true,
        },
    ],
};

// Naive chunking (character/line based)
const NAIVE_CHUNKS = [
    { id: "naive-1", startLine: 1, endLine: 10, label: "Chunk 1 (lines 1-10)" },
    { id: "naive-2", startLine: 11, endLine: 20, label: "Chunk 2 (lines 11-20)" },
    { id: "naive-3", startLine: 21, endLine: 32, label: "Chunk 3 (lines 21-32)" },
];

// Tree-sitter aware chunks (semantic boundaries)
const SEMANTIC_CHUNKS = [
    { id: "sem-1", startLine: 1, endLine: 2, label: "Imports", type: "imports", nodeId: "import-1" },
    { id: "sem-2", startLine: 4, endLine: 9, label: "DataProcessor.__init__", type: "method", nodeId: "method-1" },
    { id: "sem-3", startLine: 11, endLine: 16, label: "DataProcessor.normalize", type: "method", nodeId: "method-2" },
    { id: "sem-4", startLine: 18, endLine: 22, label: "DataProcessor.transform", type: "method", nodeId: "method-3" },
    { id: "sem-5", startLine: 24, endLine: 32, label: "calculate_stats", type: "function", nodeId: "func-1" },
];

// Sample queries with simulated match scores for each chunking approach
interface QueryMatch {
    query: string;
    description: string;
    naiveResults: { chunkId: string; score: number; issue?: string }[];
    semanticResults: { chunkId: string; score: number; benefit?: string }[];
}

const SAMPLE_QUERIES: QueryMatch[] = [
    {
        query: "normalize data to a range",
        description: "Find the normalization function",
        naiveResults: [
            { chunkId: "naive-2", score: 0.72, issue: "Partial match - chunk starts mid-function, missing class context" },
            { chunkId: "naive-1", score: 0.31, issue: "Low relevance - only contains imports and class header" },
        ],
        semanticResults: [
            { chunkId: "sem-3", score: 0.94, benefit: "Complete function with docstring and full implementation" },
            { chunkId: "sem-4", score: 0.67, benefit: "Related transform method that calls normalize" },
        ],
    },
    {
        query: "calculate mean and standard deviation",
        description: "Find statistics calculation",
        naiveResults: [
            { chunkId: "naive-3", score: 0.68, issue: "Partial - chunk includes unrelated transform() ending" },
        ],
        semanticResults: [
            { chunkId: "sem-5", score: 0.91, benefit: "Exact function match with complete stats logic" },
        ],
    },
    {
        query: "initialize processor with config",
        description: "Find the constructor",
        naiveResults: [
            { chunkId: "naive-1", score: 0.58, issue: "Mixed content - includes imports diluting relevance" },
        ],
        semanticResults: [
            { chunkId: "sem-2", score: 0.89, benefit: "Focused __init__ method with class context" },
        ],
    },
];

// Node type colors
const NODE_COLORS: Record<string, string> = {
    module: "#10b981",
    class_definition: "#8b5cf6",
    function_definition: "#3b82f6",
    import_statement: "#f59e0b",
    import_from_statement: "#f59e0b",
    expression_statement: "#6b7280",
};

const NODE_ICONS: Record<string, typeof Code2> = {
    module: FileCode,
    class_definition: Braces,
    function_definition: Code2,
    import_statement: Hash,
    import_from_statement: Hash,
    expression_statement: Code2,
};

// Tree node component
function TreeNode({
    node,
    depth = 0,
    selectedNode,
    hoveredNode,
    onSelect,
    onHover,
    expandedNodes,
    toggleExpand
}: {
    node: ASTNode;
    depth?: number;
    selectedNode: string | null;
    hoveredNode: string | null;
    onSelect: (id: string | null) => void;
    onHover: (id: string | null) => void;
    expandedNodes: Set<string>;
    toggleExpand: (id: string) => void;
}) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;
    const isHovered = hoveredNode === node.id;
    const color = NODE_COLORS[node.type] || "#6b7280";
    const Icon = NODE_ICONS[node.type] || Code2;

    return (
        <div className="select-none">
            <div
                className={`flex items-center gap-1 py-1 px-1 rounded cursor-pointer transition-all ${isSelected
                        ? "bg-emerald-500/20 ring-1 ring-emerald-500/50"
                        : isHovered
                            ? "bg-zinc-700/50"
                            : "hover:bg-zinc-800/50"
                    }`}
                style={{ paddingLeft: `${depth * 16 + 4}px` }}
                onClick={() => {
                    onSelect(isSelected ? null : node.id);
                    if (hasChildren) toggleExpand(node.id);
                }}
                onMouseEnter={() => onHover(node.id)}
                onMouseLeave={() => onHover(null)}
            >
                {hasChildren ? (
                    <span className="w-4 h-4 flex items-center justify-center text-zinc-500">
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </span>
                ) : (
                    <span className="w-4" />
                )}

                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />

                <span className="text-xs text-zinc-400">{node.type}</span>

                {node.name && (
                    <span className="text-xs font-medium text-zinc-200 truncate">
                        {node.name}
                    </span>
                )}

                <span className="text-[10px] text-zinc-600 ml-auto flex-shrink-0">
                    L{node.startLine}{node.endLine !== node.startLine && `-${node.endLine}`}
                </span>

                {node.isChunkable && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="Chunkable" />
                )}
            </div>

            <AnimatePresence>
                {hasChildren && isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                    >
                        {node.children!.map((child) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                depth={depth + 1}
                                selectedNode={selectedNode}
                                hoveredNode={hoveredNode}
                                onSelect={onSelect}
                                onHover={onHover}
                                expandedNodes={expandedNodes}
                                toggleExpand={toggleExpand}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Find all lines covered by a node and its children
function getNodeLines(node: ASTNode): Set<number> {
    const lines = new Set<number>();
    for (let i = node.startLine; i <= node.endLine; i++) {
        lines.add(i);
    }
    return lines;
}

// Visual tree diagram node component
function VisualTreeNode({
    node,
    selectedNode,
    hoveredNode,
    onSelect,
    onHover,
    isRoot = false,
}: {
    node: ASTNode;
    selectedNode: string | null;
    hoveredNode: string | null;
    onSelect: (id: string | null) => void;
    onHover: (id: string | null) => void;
    isRoot?: boolean;
}) {
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode === node.id;
    const isHovered = hoveredNode === node.id;
    const color = NODE_COLORS[node.type] || "#6b7280";
    const Icon = NODE_ICONS[node.type] || Code2;

    // Get display name
    const displayName = node.name || node.type;
    const shortType = node.type.replace("_definition", "").replace("_statement", "");

    return (
        <div className="flex flex-col items-center">
            {/* Node box */}
            <motion.div
                className={`relative px-2 py-1.5 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                        ? "ring-2 ring-offset-2 ring-offset-zinc-900"
                        : isHovered
                            ? "scale-105"
                            : ""
                    }`}
                style={{
                    borderColor: color,
                    backgroundColor: isSelected || isHovered ? color + "30" : color + "15",
                    // @ts-expect-error ringColor is a valid CSS property via Tailwind
                    "--tw-ring-color": isSelected ? color : undefined,
                }}
                onClick={() => onSelect(isSelected ? null : node.id)}
                onMouseEnter={() => onHover(node.id)}
                onMouseLeave={() => onHover(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3" style={{ color }} />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-zinc-200 leading-tight max-w-[80px] truncate">
                            {displayName}
                        </span>
                        <span className="text-[8px] text-zinc-500 leading-tight">{shortType}</span>
                    </div>
                </div>

                {/* Chunkable indicator */}
                {node.isChunkable && (
                    <div
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-900"
                        title="Can be extracted as a chunk"
                    />
                )}
            </motion.div>

            {/* Children container with connecting lines */}
            {hasChildren && (
                <div className="flex flex-col items-center">
                    {/* Vertical line down from parent */}
                    <div className="w-px h-4 bg-zinc-700" />

                    {/* Horizontal connector and children */}
                    <div className="relative flex items-start">
                        {/* Horizontal line spanning all children */}
                        {node.children!.length > 1 && (
                            <div
                                className="absolute top-0 h-px bg-zinc-700"
                                style={{
                                    left: '50%',
                                    right: '50%',
                                    transform: 'translateX(-50%)',
                                    width: `calc(100% - 40px)`,
                                }}
                            />
                        )}

                        {/* Children nodes */}
                        <div className="flex gap-2">
                            {node.children!.map((child, i) => (
                                <div key={child.id} className="flex flex-col items-center">
                                    {/* Vertical line down to child */}
                                    <div className="w-px h-4 bg-zinc-700" />
                                    <VisualTreeNode
                                        node={child}
                                        selectedNode={selectedNode}
                                        hoveredNode={hoveredNode}
                                        onSelect={onSelect}
                                        onHover={onHover}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Full visual tree with scroll
function VisualTreeDiagram({
    root,
    selectedNode,
    hoveredNode,
    onSelect,
    onHover,
}: {
    root: ASTNode;
    selectedNode: string | null;
    hoveredNode: string | null;
    onSelect: (id: string | null) => void;
    onHover: (id: string | null) => void;
}) {
    return (
        <div className="w-full overflow-x-auto overflow-y-auto p-4">
            <div className="min-w-max flex justify-center">
                <VisualTreeNode
                    node={root}
                    selectedNode={selectedNode}
                    hoveredNode={hoveredNode}
                    onSelect={onSelect}
                    onHover={onHover}
                    isRoot
                />
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap gap-3 justify-center">
                {Object.entries(NODE_COLORS).slice(0, 4).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-3 rounded border-2"
                            style={{ borderColor: color, backgroundColor: color + "30" }}
                        />
                        <span className="text-[10px] text-zinc-500">{type.replace("_", " ")}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-zinc-500">chunkable</span>
                </div>
            </div>
        </div>
    );
}

// Find node by ID
function findNode(root: ASTNode, id: string): ASTNode | null {
    if (root.id === id) return root;
    if (root.children) {
        for (const child of root.children) {
            const found = findNode(child, id);
            if (found) return found;
        }
    }
    return null;
}

export function TreeSitterDemo() {
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [hoveredLine, setHoveredLine] = useState<number | null>(null);
    const [chunkingMode, setChunkingMode] = useState<"naive" | "semantic">("semantic");
    const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
    const [showSearchDemo, setShowSearchDemo] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
        new Set(["root", "class-1"])
    );

    const toggleExpand = (id: string) => {
        setExpandedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Get highlighted lines based on selection
    const highlightedLines = useMemo(() => {
        const activeId = selectedNode || hoveredNode;
        if (!activeId) return new Set<number>();
        const node = findNode(AST_TREE, activeId);
        if (!node) return new Set<number>();
        return getNodeLines(node);
    }, [selectedNode, hoveredNode]);

    // Find which node contains a given line
    const findNodeForLine = (line: number): ASTNode | null => {
        const findDeepest = (node: ASTNode): ASTNode | null => {
            if (line < node.startLine || line > node.endLine) return null;

            if (node.children) {
                for (const child of node.children) {
                    const found = findDeepest(child);
                    if (found) return found;
                }
            }
            return node;
        };
        return findDeepest(AST_TREE);
    };

    // Get current chunks based on mode
    const currentChunks = chunkingMode === "naive" ? NAIVE_CHUNKS : SEMANTIC_CHUNKS;

    // Code lines with line numbers
    const codeLines = SAMPLE_CODE.split("\n");

    return (
        <div className="w-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-zinc-800">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <TreePine className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs sm:text-sm font-medium text-zinc-200">Tree-sitter Code Parsing</span>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-500">
                    Tree-sitter parses code into an Abstract Syntax Tree (AST), enabling semantic understanding of code structure.
                    <span className="hidden sm:inline"> Click on AST nodes or code lines to see the connection.</span>
                </p>
            </div>

            {/* Main content */}
            <div className="flex flex-col lg:flex-row">
                {/* Source code panel */}
                <div className="lg:flex-1 border-b lg:border-b-0 lg:border-r border-zinc-800">
                    <div className="p-1.5 sm:p-2 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
                        <Code2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-zinc-400" />
                        <span className="text-[10px] sm:text-xs font-medium text-zinc-400">data_processor.py</span>
                    </div>

                    <ScrollArea className="h-[220px] sm:h-[280px] lg:h-[360px]">
                        <div className="p-1.5 sm:p-2 font-mono text-[10px] sm:text-[11px] leading-relaxed overflow-x-auto">
                            {codeLines.map((line, i) => {
                                const lineNum = i + 1;
                                const isHighlighted = highlightedLines.has(lineNum);
                                const isHoveredLine = hoveredLine === lineNum;

                                // Find which chunk this line belongs to
                                const chunk = currentChunks.find(
                                    (c) => lineNum >= c.startLine && lineNum <= c.endLine
                                );

                                // Determine chunk color
                                let chunkColor = "transparent";
                                if (chunk) {
                                    if (chunkingMode === "naive") {
                                        const idx = NAIVE_CHUNKS.indexOf(chunk);
                                        chunkColor = ["#ef4444", "#f59e0b", "#10b981"][idx] + "15";
                                    } else {
                                        chunkColor = "#10b98115";
                                    }
                                }

                                return (
                                    <div
                                        key={i}
                                        className={`flex transition-all duration-100 rounded-sm ${isHighlighted && chunkingMode === "semantic"
                                                ? "bg-emerald-500/20"
                                                : isHoveredLine
                                                    ? "bg-zinc-700/30"
                                                    : ""
                                            }`}
                                        style={{
                                            borderLeft: chunk ? `2px solid ${chunkColor.replace("15", "60")}` : "2px solid transparent",
                                            backgroundColor: (isHighlighted && chunkingMode === "semantic") ? undefined : chunkColor,
                                        }}
                                        onMouseEnter={() => {
                                            setHoveredLine(lineNum);
                                            if (chunkingMode === "semantic") {
                                                const node = findNodeForLine(lineNum);
                                                if (node) setHoveredNode(node.id);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredLine(null);
                                            if (chunkingMode === "semantic") {
                                                setHoveredNode(null);
                                            }
                                        }}
                                        onClick={() => {
                                            if (chunkingMode === "semantic") {
                                                const node = findNodeForLine(lineNum);
                                                if (node) {
                                                    setSelectedNode(selectedNode === node.id ? null : node.id);
                                                    // Expand parent if needed
                                                    if (!expandedNodes.has("root")) toggleExpand("root");
                                                    if (lineNum >= 4 && lineNum <= 22 && !expandedNodes.has("class-1")) {
                                                        toggleExpand("class-1");
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <span className="w-6 sm:w-8 text-right pr-2 sm:pr-3 text-zinc-600 select-none flex-shrink-0 text-[9px] sm:text-[11px]">
                                            {lineNum}
                                        </span>
                                        <span className="text-zinc-300 whitespace-pre">
                                            {line || " "}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right sidebar - changes based on mode */}
                <div className="lg:w-80 flex flex-col">
                    <div className="p-1.5 sm:p-2 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
                        {chunkingMode === "semantic" ? (
                            <>
                                <TreePine className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
                                <span className="text-[10px] sm:text-xs font-medium text-zinc-400">Abstract Syntax Tree</span>
                            </>
                        ) : (
                            <>
                                <Layers className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-400" />
                                <span className="text-[10px] sm:text-xs font-medium text-zinc-400">Fixed-Size Chunks</span>
                            </>
                        )}
                    </div>

                    <ScrollArea className="h-[160px] sm:h-[180px] lg:h-[360px]">
                        <div className="p-2">
                            {chunkingMode === "semantic" ? (
                                <TreeNode
                                    node={AST_TREE}
                                    selectedNode={selectedNode}
                                    hoveredNode={hoveredNode}
                                    onSelect={setSelectedNode}
                                    onHover={setHoveredNode}
                                    expandedNodes={expandedNodes}
                                    toggleExpand={toggleExpand}
                                />
                            ) : (
                                <div className="space-y-2">
                                    {NAIVE_CHUNKS.map((chunk, idx) => {
                                        const colors = ["#ef4444", "#f59e0b", "#10b981"];
                                        const color = colors[idx];
                                        const isHovered = hoveredLine !== null &&
                                            hoveredLine >= chunk.startLine &&
                                            hoveredLine <= chunk.endLine;

                                        return (
                                            <div
                                                key={chunk.id}
                                                className={`p-3 rounded-lg border transition-all cursor-pointer ${isHovered
                                                        ? "ring-1 ring-offset-1 ring-offset-zinc-900"
                                                        : ""
                                                    }`}
                                                style={{
                                                    backgroundColor: color + "15",
                                                    borderColor: color + "40",
                                                    ...(isHovered ? { ringColor: color } : {}),
                                                }}
                                                onMouseEnter={() => {
                                                    // Highlight all lines in this chunk
                                                    setHoveredLine(chunk.startLine);
                                                }}
                                                onMouseLeave={() => setHoveredLine(null)}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <span className="text-xs font-medium" style={{ color }}>
                                                        Chunk {idx + 1}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-zinc-500 mb-2">
                                                    Lines {chunk.startLine}–{chunk.endLine} ({chunk.endLine - chunk.startLine + 1} lines)
                                                </div>
                                                <div className="text-[10px] text-zinc-400 font-mono bg-zinc-800/50 rounded p-1.5 line-clamp-3">
                                                    {codeLines.slice(chunk.startLine - 1, chunk.endLine).join("\n")}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="mt-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                                        <div className="text-[10px] text-red-400 flex items-start gap-1.5">
                                            <span className="mt-0.5">⚠</span>
                                            <span>
                                                Notice how Chunk 2 starts in the middle of <code className="bg-zinc-800 px-1 rounded">normalize()</code> and
                                                ends mid-way through <code className="bg-zinc-800 px-1 rounded">transform()</code>.
                                                This breaks semantic context.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Chunking comparison section */}
            <div className="border-t border-zinc-800">
                <div className="p-2 sm:p-3 bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <Scissors className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-zinc-400" />
                        <span className="text-[10px] sm:text-xs font-medium text-zinc-300">Chunking Strategy:</span>
                    </div>

                    <div className="flex gap-1 flex-1">
                        <button
                            onClick={() => setChunkingMode("naive")}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium transition-colors ${chunkingMode === "naive"
                                    ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                }`}
                        >
                            <span className="flex items-center gap-1 sm:gap-1.5">
                                <Layers className="w-3 h-3" />
                                <span className="hidden xs:inline">Naive</span> Fixed
                            </span>
                        </button>
                        <button
                            onClick={() => setChunkingMode("semantic")}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium transition-colors ${chunkingMode === "semantic"
                                    ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                }`}
                        >
                            <span className="flex items-center gap-1 sm:gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                Semantic
                            </span>
                        </button>
                    </div>

                    {/* Toggle search demo */}
                    <button
                        onClick={() => setShowSearchDemo(!showSearchDemo)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium transition-colors flex items-center gap-1 sm:gap-1.5 self-start sm:self-auto ${showSearchDemo
                                ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            }`}
                    >
                        <Search className="w-3 h-3" />
                        <span className="hidden sm:inline">{showSearchDemo ? "Hide" : "Show"}</span> Search
                    </button>
                </div>

                {/* Chunk visualization */}
                <div className="p-2 sm:p-3 border-t border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <span className="text-[10px] sm:text-xs text-zinc-500">Generated Chunks:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <AnimatePresence mode="popLayout">
                            {currentChunks.map((chunk) => (
                                <motion.div
                                    key={chunk.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded text-[9px] sm:text-xs font-mono ${chunkingMode === "naive"
                                            ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                        }`}
                                    onMouseEnter={() => {
                                        if (chunkingMode === "semantic" && "nodeId" in chunk) {
                                            setHoveredNode(chunk.nodeId as string);
                                        }
                                    }}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    {chunk.label}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Explanation */}
                    <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 rounded bg-zinc-800/30 border border-zinc-700/50">
                        {chunkingMode === "naive" ? (
                            <div className="text-[10px] sm:text-xs text-zinc-400">
                                <span className="text-red-400 font-medium">⚠ Problem:</span> Naive chunking splits at arbitrary line boundaries.
                                <span className="hidden sm:inline"> Chunk 2 cuts through the middle of the <code className="text-zinc-300">normalize</code> method,
                                losing context and creating incomplete embeddings.</span>
                            </div>
                        ) : (
                            <div className="text-[10px] sm:text-xs text-zinc-400">
                                <span className="text-emerald-400 font-medium">✓ Better:</span> Tree-sitter identifies semantic boundaries.
                                <span className="hidden sm:inline"> Each chunk contains a complete function or method with its docstring,
                                making embeddings more meaningful for search.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Impact Demo */}
                <AnimatePresence>
                    {showSearchDemo && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-zinc-800"
                        >
                            <div className="p-2 sm:p-3 bg-zinc-900/30">
                                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                    <Target className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-400" />
                                    <span className="text-xs sm:text-sm font-medium text-zinc-200">Search Quality Comparison</span>
                                </div>

                                {/* Query selector */}
                                <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
                                    {SAMPLE_QUERIES.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedQueryIndex(i)}
                                            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs transition-all flex-shrink-0 text-left ${i === selectedQueryIndex
                                                    ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50"
                                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                                }`}
                                        >
                                            <div className="font-medium whitespace-nowrap">&quot;{q.query}&quot;</div>
                                            <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5 whitespace-nowrap">{q.description}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* Results comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                                    {/* Naive results */}
                                    <div className="p-2 sm:p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                            <Layers className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-400" />
                                            <span className="text-[10px] sm:text-xs font-medium text-red-400">Naive Chunking Results</span>
                                        </div>
                                        <div className="space-y-1.5 sm:space-y-2">
                                            {SAMPLE_QUERIES[selectedQueryIndex].naiveResults.map((result, i) => {
                                                const chunk = NAIVE_CHUNKS.find(c => c.id === result.chunkId);
                                                return (
                                                    <div key={i} className="p-1.5 sm:p-2 rounded bg-zinc-800/50 border border-zinc-700/50">
                                                        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                                                            <span className="text-[10px] sm:text-xs font-mono text-zinc-300">{chunk?.label}</span>
                                                            <span className={`text-[10px] sm:text-xs font-bold tabular-nums ${result.score >= 0.8 ? "text-emerald-400" :
                                                                    result.score >= 0.6 ? "text-yellow-400" : "text-red-400"
                                                                }`}>
                                                                {(result.score * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex items-start gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-red-400/80">
                                                            <AlertTriangle className="w-2.5 sm:w-3 h-2.5 sm:h-3 flex-shrink-0 mt-0.5" />
                                                            <span className="line-clamp-2">{result.issue}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {SAMPLE_QUERIES[selectedQueryIndex].naiveResults.length === 0 && (
                                                <div className="text-[10px] sm:text-xs text-zinc-500 italic">No relevant matches</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Semantic results */}
                                    <div className="p-2 sm:p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                            <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400" />
                                            <span className="text-[10px] sm:text-xs font-medium text-emerald-400">Tree-sitter Chunking Results</span>
                                        </div>
                                        <div className="space-y-1.5 sm:space-y-2">
                                            {SAMPLE_QUERIES[selectedQueryIndex].semanticResults.map((result, i) => {
                                                const chunk = SEMANTIC_CHUNKS.find(c => c.id === result.chunkId);
                                                return (
                                                    <div key={i} className="p-1.5 sm:p-2 rounded bg-zinc-800/50 border border-zinc-700/50">
                                                        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                                                            <span className="text-[10px] sm:text-xs font-mono text-zinc-300">{chunk?.label}</span>
                                                            <span className={`text-[10px] sm:text-xs font-bold tabular-nums ${result.score >= 0.8 ? "text-emerald-400" :
                                                                    result.score >= 0.6 ? "text-yellow-400" : "text-red-400"
                                                                }`}>
                                                                {(result.score * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex items-start gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-emerald-400/80">
                                                            <CheckCircle2 className="w-2.5 sm:w-3 h-2.5 sm:h-3 flex-shrink-0 mt-0.5" />
                                                            <span className="line-clamp-2">{result.benefit}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="mt-3 sm:mt-4 p-1.5 sm:p-2 rounded bg-blue-500/10 border border-blue-500/20">
                                    <div className="text-[10px] sm:text-xs text-blue-300">
                                        <span className="font-medium">Key insight:</span> Semantic chunking produces{" "}
                                        <span className="font-bold text-emerald-400">
                                            +{((SAMPLE_QUERIES[selectedQueryIndex].semanticResults[0]?.score || 0) * 100 -
                                                (SAMPLE_QUERIES[selectedQueryIndex].naiveResults[0]?.score || 0) * 100).toFixed(0)}%
                                        </span>{" "}
                                        higher scores<span className="hidden sm:inline"> because chunks contain complete, contextual code units</span>.
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
