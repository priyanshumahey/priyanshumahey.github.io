"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import {
    Braces,
    ChevronDown,
    Code2,
    FileCode,
    Hash,
    Pause,
    Play,
    RotateCcw,
    TreePine
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Sample code snippets to parse
const CODE_SAMPLES = [
    {
        name: "Python Class",
        language: "python",
        code: `class DataProcessor:
    """Process and transform data."""
    
    def __init__(self, config):
        self.config = config
        self.cache = {}
    
    def process(self, data):
        if data is None:
            raise ValueError("No data")
        
        for item in data:
            result = self._transform(item)
            self.cache[item.id] = result
        
        return self.cache
    
    def _transform(self, item):
        return item.value * 2`,
        ast: {
            id: "root",
            type: "module",
            name: "processor.py",
            line: 1,
            children: [
                {
                    id: "class-1",
                    type: "class",
                    name: "DataProcessor",
                    line: 1,
                    children: [
                        { id: "doc-1", type: "docstring", name: '"Process and transform..."', line: 2 },
                        {
                            id: "func-1",
                            type: "function",
                            name: "__init__",
                            line: 4,
                            children: [
                                { id: "param-1", type: "parameter", name: "self, config", line: 4 },
                                { id: "assign-1", type: "assignment", name: "self.config = config", line: 5 },
                                { id: "assign-2", type: "assignment", name: "self.cache = {}", line: 6 }
                            ]
                        },
                        {
                            id: "func-2",
                            type: "function",
                            name: "process",
                            line: 8,
                            children: [
                                { id: "param-2", type: "parameter", name: "self, data", line: 8 },
                                {
                                    id: "if-1",
                                    type: "if_statement",
                                    name: "if data is None",
                                    line: 9,
                                    children: [
                                        { id: "raise-1", type: "raise", name: 'ValueError("No data")', line: 10 }
                                    ]
                                },
                                {
                                    id: "for-1",
                                    type: "for_loop",
                                    name: "for item in data",
                                    line: 12,
                                    children: [
                                        { id: "assign-3", type: "assignment", name: "result = self._transform(item)", line: 13 },
                                        { id: "assign-4", type: "assignment", name: "self.cache[item.id] = result", line: 14 }
                                    ]
                                },
                                { id: "ret-1", type: "return", name: "self.cache", line: 16 }
                            ]
                        },
                        {
                            id: "func-3",
                            type: "function",
                            name: "_transform",
                            line: 18,
                            children: [
                                { id: "param-3", type: "parameter", name: "self, item", line: 18 },
                                { id: "ret-2", type: "return", name: "item.value * 2", line: 19 }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        name: "TypeScript React",
        language: "typescript",
        code: `import React, { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled }: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };
  
  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
    >
      {label}
    </button>
  );
}`,
        ast: {
            id: "root",
            type: "program",
            name: "Button.tsx",
            line: 1,
            children: [
                { id: "import-1", type: "import", name: "import React, { useState }", line: 1 },
                {
                    id: "iface-1",
                    type: "interface",
                    name: "ButtonProps",
                    line: 3,
                    children: [
                        { id: "prop-1", type: "property", name: "label: string", line: 4 },
                        { id: "prop-2", type: "property", name: "onClick: () => void", line: 5 },
                        { id: "prop-3", type: "property", name: "disabled?: boolean", line: 6 }
                    ]
                },
                {
                    id: "func-1",
                    type: "function",
                    name: "Button",
                    line: 9,
                    children: [
                        { id: "param-1", type: "parameter", name: "{ label, onClick, disabled }", line: 9 },
                        {
                            id: "var-1",
                            type: "variable",
                            name: "const [isHovered, setIsHovered]",
                            line: 10,
                            children: [
                                { id: "call-1", type: "call", name: "useState(false)", line: 10 }
                            ]
                        },
                        {
                            id: "arrow-1",
                            type: "arrow_function",
                            name: "handleClick",
                            line: 12,
                            children: [
                                {
                                    id: "if-1",
                                    type: "if_statement",
                                    name: "if (!disabled)",
                                    line: 13,
                                    children: [
                                        { id: "call-2", type: "call", name: "onClick()", line: 14 }
                                    ]
                                }
                            ]
                        },
                        {
                            id: "ret-1",
                            type: "return",
                            name: "<button>...</button>",
                            line: 18,
                            children: [
                                {
                                    id: "jsx-1",
                                    type: "jsx_element",
                                    name: "<button>",
                                    line: 19,
                                    children: [
                                        { id: "attr-1", type: "jsx_attribute", name: "onClick={handleClick}", line: 20 },
                                        { id: "attr-2", type: "jsx_attribute", name: "onMouseEnter={...}", line: 21 },
                                        { id: "expr-1", type: "jsx_expression", name: "{label}", line: 23 }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        name: "Rust Match",
        language: "rust",
        code: `enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
    Triangle { base: f64, height: f64 },
}

impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle { radius } => {
                std::f64::consts::PI * radius * radius
            }
            Shape::Rectangle { width, height } => {
                width * height
            }
            Shape::Triangle { base, height } => {
                0.5 * base * height
            }
        }
    }
}`,
        ast: {
            id: "root",
            type: "source_file",
            name: "shape.rs",
            line: 1,
            children: [
                {
                    id: "enum-1",
                    type: "enum",
                    name: "Shape",
                    line: 1,
                    children: [
                        { id: "var-1", type: "variant", name: "Circle { radius }", line: 2 },
                        { id: "var-2", type: "variant", name: "Rectangle { width, height }", line: 3 },
                        { id: "var-3", type: "variant", name: "Triangle { base, height }", line: 4 }
                    ]
                },
                {
                    id: "impl-1",
                    type: "impl",
                    name: "impl Shape",
                    line: 7,
                    children: [
                        {
                            id: "fn-1",
                            type: "function",
                            name: "area",
                            line: 8,
                            children: [
                                { id: "param-1", type: "parameter", name: "&self", line: 8 },
                                { id: "ret-type", type: "return_type", name: "-> f64", line: 8 },
                                {
                                    id: "match-1",
                                    type: "match",
                                    name: "match self",
                                    line: 9,
                                    children: [
                                        {
                                            id: "arm-1",
                                            type: "match_arm",
                                            name: "Shape::Circle",
                                            line: 10,
                                            children: [
                                                { id: "expr-1", type: "expression", name: "PI * radius * radius", line: 11 }
                                            ]
                                        },
                                        {
                                            id: "arm-2",
                                            type: "match_arm",
                                            name: "Shape::Rectangle",
                                            line: 13,
                                            children: [
                                                { id: "expr-2", type: "expression", name: "width * height", line: 14 }
                                            ]
                                        },
                                        {
                                            id: "arm-3",
                                            type: "match_arm",
                                            name: "Shape::Triangle",
                                            line: 16,
                                            children: [
                                                { id: "expr-3", type: "expression", name: "0.5 * base * height", line: 17 }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
];

interface ASTNode {
    id: string;
    type: string;
    name?: string;
    line?: number;
    children?: ASTNode[];
}

// Node type colors and icons
const NODE_STYLES: Record<string, { color: string; icon: typeof Code2; bg: string }> = {
    // File/module level
    module: { color: "#10b981", icon: FileCode, bg: "#10b98120" },
    program: { color: "#10b981", icon: FileCode, bg: "#10b98120" },
    source_file: { color: "#10b981", icon: FileCode, bg: "#10b98120" },

    // Type definitions
    class: { color: "#8b5cf6", icon: Braces, bg: "#8b5cf620" },
    interface: { color: "#8b5cf6", icon: Braces, bg: "#8b5cf620" },
    struct: { color: "#8b5cf6", icon: Braces, bg: "#8b5cf620" },
    enum: { color: "#8b5cf6", icon: Braces, bg: "#8b5cf620" },
    impl: { color: "#a855f7", icon: Braces, bg: "#a855f720" },
    variant: { color: "#c084fc", icon: Hash, bg: "#c084fc20" },

    // Functions
    function: { color: "#3b82f6", icon: Code2, bg: "#3b82f620" },
    arrow_function: { color: "#3b82f6", icon: Code2, bg: "#3b82f620" },

    // Control flow
    if_statement: { color: "#f97316", icon: Hash, bg: "#f9731620" },
    for_loop: { color: "#f97316", icon: Hash, bg: "#f9731620" },
    match: { color: "#f97316", icon: Hash, bg: "#f9731620" },
    match_arm: { color: "#fb923c", icon: Hash, bg: "#fb923c20" },

    // Declarations & expressions
    import: { color: "#eab308", icon: Hash, bg: "#eab30820" },
    variable: { color: "#22c55e", icon: Hash, bg: "#22c55e20" },
    assignment: { color: "#6b7280", icon: Hash, bg: "#6b728020" },
    expression: { color: "#6b7280", icon: Hash, bg: "#6b728020" },
    call: { color: "#14b8a6", icon: Hash, bg: "#14b8a620" },

    // Properties & parameters
    parameter: { color: "#64748b", icon: Hash, bg: "#64748b20" },
    property: { color: "#06b6d4", icon: Hash, bg: "#06b6d420" },
    field: { color: "#06b6d4", icon: Hash, bg: "#06b6d420" },

    // JSX
    jsx_element: { color: "#0ea5e9", icon: Braces, bg: "#0ea5e920" },
    jsx_attribute: { color: "#38bdf8", icon: Hash, bg: "#38bdf820" },
    jsx_expression: { color: "#7dd3fc", icon: Hash, bg: "#7dd3fc20" },

    // Return & types
    return: { color: "#ec4899", icon: Hash, bg: "#ec489920" },
    return_type: { color: "#f472b6", icon: Hash, bg: "#f472b620" },
    raise: { color: "#ef4444", icon: Hash, bg: "#ef444420" },

    // Misc
    docstring: { color: "#f59e0b", icon: Hash, bg: "#f59e0b20" },
};

// Flatten tree for animation order
function flattenTree(node: ASTNode): string[] {
    const result: string[] = [node.id];
    if (node.children) {
        for (const child of node.children) {
            result.push(...flattenTree(child));
        }
    }
    return result;
}

// Get animation index for a node
function getAnimationIndex(allIds: string[], nodeId: string): number {
    return allIds.indexOf(nodeId);
}

// Indented tree node component
function TreeNodeRow({
    node,
    depth = 0,
    visibleNodes,
    hoveredNode,
    onHover,
    onLineHover,
    allNodeIds,
    isLast = true,
    ancestorHasMore = [],
}: {
    node: ASTNode;
    depth?: number;
    visibleNodes: Set<string>;
    hoveredNode: string | null;
    onHover: (id: string | null) => void;
    onLineHover: (line: number | null) => void;
    allNodeIds: string[];
    isLast?: boolean;
    ancestorHasMore?: boolean[];
}) {
    const isVisible = visibleNodes.has(node.id);
    const isHovered = hoveredNode === node.id;
    const style = NODE_STYLES[node.type] || { color: "#6b7280", icon: Hash, bg: "#6b728020" };
    const Icon = style.icon;
    const animIndex = getAnimationIndex(allNodeIds, node.id);

    if (!isVisible) return null;

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: animIndex * 0.05 }}
                className={`flex items-center py-0.5 cursor-pointer transition-colors group ${isHovered ? "bg-zinc-700/40" : "hover:bg-zinc-800/30"
                    }`}
                style={{ paddingLeft: 4 }}
                onMouseEnter={() => {
                    onHover(node.id);
                    if (node.line) onLineHover(node.line);
                }}
                onMouseLeave={() => {
                    onHover(null);
                    onLineHover(null);
                }}
            >
                {/* Tree connector lines */}
                <div className="flex items-center flex-shrink-0">
                    {/* Ancestor continuation lines */}
                    {ancestorHasMore.map((hasMore, i) => (
                        <div key={i} className="w-5 h-7 flex justify-center">
                            {hasMore && <div className="w-px h-full bg-zinc-700" />}
                        </div>
                    ))}

                    {/* Current level connector */}
                    {depth > 0 && (
                        <div className="w-5 h-7 relative">
                            {/* Vertical line (goes up to connect to parent) */}
                            <div
                                className="absolute left-1/2 -translate-x-1/2 top-0 w-px bg-zinc-700"
                                style={{ height: isLast ? '50%' : '100%' }}
                            />
                            {/* Horizontal line (connects to node) */}
                            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 h-px bg-zinc-700 w-2" />
                        </div>
                    )}
                </div>

                {/* Node badge */}
                <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all"
                    style={{
                        backgroundColor: style.bg,
                        borderColor: isHovered ? style.color : style.color + "40",
                    }}
                >
                    <Icon className="w-3 h-3 flex-shrink-0" style={{ color: style.color }} />
                    <span className="text-[11px] font-medium text-zinc-200 truncate max-w-[120px]">
                        {node.name || node.type}
                    </span>
                    <span className="text-[9px] px-1 py-0.5 rounded text-zinc-400 bg-zinc-800/80">
                        {node.type}
                    </span>
                </div>

                {/* Line indicator on hover */}
                {node.line && (
                    <span className="text-[10px] text-zinc-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        L{node.line}
                    </span>
                )}
            </motion.div>

            {/* Render children */}
            {node.children?.map((child, i) => {
                const childIsLast = i === node.children!.length - 1;
                // Track which ancestors still have siblings below
                const newAncestorHasMore = depth > 0
                    ? [...ancestorHasMore, !isLast]
                    : [];

                return (
                    <TreeNodeRow
                        key={child.id}
                        node={child}
                        depth={depth + 1}
                        visibleNodes={visibleNodes}
                        hoveredNode={hoveredNode}
                        onHover={onHover}
                        onLineHover={onLineHover}
                        allNodeIds={allNodeIds}
                        isLast={childIsLast}
                        ancestorHasMore={newAncestorHasMore}
                    />
                );
            })}
        </div>
    );
}

export function ASTVisualizerDemo() {
    const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(new Set());
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
    const animationRef = useRef<NodeJS.Timeout | null>(null);

    const sample = CODE_SAMPLES[selectedSampleIndex];
    const allNodeIds = flattenTree(sample.ast);
    const totalNodes = allNodeIds.length;
    const visibleCount = visibleNodeIds.size;

    // Reset when sample changes
    useEffect(() => {
        setVisibleNodeIds(new Set());
        setIsAnimating(false);
        if (animationRef.current) {
            clearInterval(animationRef.current);
        }
    }, [selectedSampleIndex]);

    const startAnimation = useCallback(() => {
        setIsAnimating(true);
        setVisibleNodeIds(new Set());

        let index = 0;
        animationRef.current = setInterval(() => {
            if (index < allNodeIds.length) {
                setVisibleNodeIds(prev => new Set([...prev, allNodeIds[index]]));
                index++;
            } else {
                setIsAnimating(false);
                if (animationRef.current) clearInterval(animationRef.current);
            }
        }, 200);
    }, [allNodeIds]);

    const pauseAnimation = useCallback(() => {
        setIsAnimating(false);
        if (animationRef.current) {
            clearInterval(animationRef.current);
        }
    }, []);

    const resetAnimation = useCallback(() => {
        setIsAnimating(false);
        setVisibleNodeIds(new Set());
        if (animationRef.current) {
            clearInterval(animationRef.current);
        }
    }, []);

    const showAll = useCallback(() => {
        setVisibleNodeIds(new Set(allNodeIds));
        setIsAnimating(false);
        if (animationRef.current) {
            clearInterval(animationRef.current);
        }
    }, [allNodeIds]);

    const codeLines = sample.code.split("\n");

    return (
        <div className="w-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-zinc-800">
            {/* Controls */}
            <div className="p-3 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-3 flex-wrap">
                {/* Sample selector */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors text-sm"
                    >
                        <span className="text-zinc-300">{sample.name}</span>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden min-w-[160px]"
                            >
                                {CODE_SAMPLES.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSelectedSampleIndex(i);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-700/50 transition-colors ${i === selectedSampleIndex ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-300"
                                            }`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Animation controls */}
                <div className="flex items-center gap-1">
                    {isAnimating ? (
                        <button
                            onClick={pauseAnimation}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                            title="Pause"
                        >
                            <Pause className="w-4 h-4 text-zinc-300" />
                        </button>
                    ) : (
                        <button
                            onClick={startAnimation}
                            className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
                            title="Play animation"
                        >
                            <Play className="w-4 h-4 text-emerald-400" />
                        </button>
                    )}
                    <button
                        onClick={resetAnimation}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                        title="Reset"
                    >
                        <RotateCcw className="w-4 h-4 text-zinc-300" />
                    </button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 ml-auto">
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-500"
                            animate={{ width: `${(visibleCount / totalNodes) * 100}%` }}
                            transition={{ duration: 0.2 }}
                        />
                    </div>
                    <span className="text-[11px] text-zinc-500 tabular-nums">
                        {visibleCount}/{totalNodes}
                    </span>
                    {visibleCount === 0 && (
                        <button
                            onClick={showAll}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                        >
                            Show all
                        </button>
                    )}
                </div>
            </div>

            {/* Main content - responsive grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Source code */}
                <div className="border-b lg:border-b-0 lg:border-r border-zinc-800">
                    <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs font-medium text-zinc-400">Source Code</span>
                        <span className="text-[10px] text-zinc-600 ml-auto">{sample.language}</span>
                    </div>

                    <ScrollArea className="h-[300px] lg:h-[380px]">
                        <div className="p-3 font-mono text-[11px] leading-relaxed">
                            {codeLines.map((line, i) => {
                                const lineNum = i + 1;
                                const isHighlighted = highlightedLine === lineNum;

                                return (
                                    <div
                                        key={i}
                                        className={`flex rounded transition-colors ${isHighlighted ? "bg-emerald-500/20 -mx-1 px-1" : ""
                                            }`}
                                    >
                                        <span className="w-6 text-right pr-2 text-zinc-600 select-none flex-shrink-0">
                                            {lineNum}
                                        </span>
                                        <span className="text-zinc-300 whitespace-pre">{line || " "}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* AST tree */}
                <div>
                    <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
                        <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-medium text-zinc-400">Abstract Syntax Tree</span>
                        <span className="text-[10px] text-zinc-500 ml-auto">
                            {visibleCount > 0 && `${visibleCount} nodes`}
                        </span>
                    </div>

                    <ScrollArea className="h-[300px] lg:h-[380px]">
                        <div className="p-2">
                            {visibleCount > 0 ? (
                                <TreeNodeRow
                                    node={sample.ast}
                                    visibleNodes={visibleNodeIds}
                                    hoveredNode={hoveredNode}
                                    onHover={setHoveredNode}
                                    onLineHover={setHighlightedLine}
                                    allNodeIds={allNodeIds}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[280px] text-zinc-500">
                                    <TreePine className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-xs">Press play to watch parsing</p>
                                    <button
                                        onClick={showAll}
                                        className="text-xs text-emerald-400 hover:text-emerald-300 mt-1.5 underline"
                                    >
                                        or show complete tree
                                    </button>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Legend */}
            <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/30">
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
                    {[
                        { type: "module", label: "file" },
                        { type: "class", label: "class/struct" },
                        { type: "function", label: "function" },
                        { type: "if_statement", label: "control flow" },
                        { type: "variable", label: "variable" },
                        { type: "property", label: "property" },
                        { type: "return", label: "return" },
                        { type: "jsx_element", label: "JSX" },
                    ].map(({ type, label }) => {
                        const s = NODE_STYLES[type];
                        if (!s) return null;
                        return (
                            <div key={type} className="flex items-center gap-1">
                                <div
                                    className="w-2.5 h-2.5 rounded"
                                    style={{ backgroundColor: s.bg, border: `1px solid ${s.color}50` }}
                                />
                                <span className="text-[10px] text-zinc-500">{label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
