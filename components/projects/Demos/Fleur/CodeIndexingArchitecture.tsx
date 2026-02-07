"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

// Now using a set of active steps to allow stacking
type FlowStep = "idle" | "input" | "chunk" | "embed" | "store" | "query"

const stepDescriptions: Record<FlowStep | "indexing", string> = {
    idle: "Semantic code search pipeline",
    input: "File watcher detects code changes and streams events via gRPC",
    chunk: "Tree-sitter parses AST and extracts semantic code chunks",
    embed: "Jina Code model generates 768-dimensional embeddings",
    store: "Vectors stored in ChromaDB, metadata cached in Redis",
    query: "Semantic search finds similar code by embedding distance",
    indexing: "Indexing pipeline running — data flows continuously through all stages",
}

// Node component
function Node({
    x, y, width, height,
    label, sublabel,
    color,
    isActive,
}: {
    x: number; y: number; width: number; height: number;
    label: string; sublabel?: string;
    color: string;
    isActive: boolean;
}) {
    return (
        <g>
            {/* Glow when active */}
            {isActive && (
                <motion.rect
                    x={x - 3}
                    y={y - 3}
                    width={width + 6}
                    height={height + 6}
                    rx={11}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}

            {/* Background */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={8}
                fill="#0c0c14"
                stroke={isActive ? color : "#1f1f2e"}
                strokeWidth={isActive ? 2 : 1}
            />

            {/* Color accent */}
            <rect
                x={x}
                y={y}
                width={4}
                height={height}
                rx={2}
                fill={color}
                opacity={isActive ? 1 : 0.3}
            />

            {/* Label */}
            <text
                x={x + 14}
                y={y + (sublabel ? height / 2 - 4 : height / 2)}
                fill="white"
                fontSize={12}
                fontWeight={600}
                fontFamily="system-ui, sans-serif"
                dominantBaseline={sublabel ? "auto" : "middle"}
            >
                {label}
            </text>

            {/* Sublabel */}
            {sublabel && (
                <text
                    x={x + 14}
                    y={y + height / 2 + 10}
                    fill="#6b7280"
                    fontSize={9}
                    fontFamily="system-ui, sans-serif"
                >
                    {sublabel}
                </text>
            )}
        </g>
    )
}

// Animated connection
function Connection({
    path,
    isActive,
    color,
}: {
    path: string;
    isActive: boolean;
    color: string;
}) {
    return (
        <g>
            {/* Base line */}
            <path
                d={path}
                fill="none"
                stroke="#1a1a28"
                strokeWidth={2}
                strokeLinecap="round"
            />

            {/* Active state */}
            {isActive && (
                <>
                    <motion.path
                        d={path}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0.5 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    <motion.circle
                        r={4}
                        fill={color}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <animateMotion
                            dur="1.2s"
                            repeatCount="indefinite"
                            path={path}
                            keyPoints="0;1"
                            keyTimes="0;1"
                            calcMode="spline"
                            keySplines="0.4 0 0.2 1"
                        />
                    </motion.circle>
                </>
            )}
        </g>
    )
}

export function CodeIndexingArchitecture() {
    const [activeSteps, setActiveSteps] = useState<Set<FlowStep>>(new Set())
    const [currentDescription, setCurrentDescription] = useState<FlowStep | "indexing">("idle")
    const [isAnimating, setIsAnimating] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const runAnimation = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)

        // For indexing pipeline: stack up the steps, don't clear previous ones
        // For query: reset and show query flow

        // Phase 1: Indexing pipeline - steps stack up progressively
        const indexingSequence: { step: FlowStep; delay: number }[] = [
            { step: "input", delay: 0 },
            { step: "chunk", delay: 800 },
            { step: "embed", delay: 800 },
            { step: "store", delay: 800 },
        ]

        // Start indexing phase
        setCurrentDescription("indexing")
        let accumulated = new Set<FlowStep>()

        const runIndexingStep = (index: number) => {
            if (index >= indexingSequence.length) {
                // Hold the full indexing state for a moment, then move to query
                timeoutRef.current = setTimeout(() => {
                    runQueryPhase()
                }, 2000)
                return
            }

            const step = indexingSequence[index].step
            accumulated = new Set([...accumulated, step])
            setActiveSteps(new Set(accumulated))

            timeoutRef.current = setTimeout(() => {
                runIndexingStep(index + 1)
            }, indexingSequence[index].delay || 800)
        }

        const runQueryPhase = () => {
            // Clear and switch to query mode
            setActiveSteps(new Set(["query" as FlowStep]))
            setCurrentDescription("query")

            timeoutRef.current = setTimeout(() => {
                // Back to idle, then loop
                setActiveSteps(new Set())
                setCurrentDescription("idle")

                timeoutRef.current = setTimeout(() => {
                    setIsAnimating(false)
                    runAnimation()
                }, 1500)
            }, 2000)
        }

        // Start the sequence
        runIndexingStep(0)
    }, [isAnimating])

    // Auto-run animation on mount
    useEffect(() => {
        const startDelay = setTimeout(() => {
            runAnimation()
        }, 800) // Small delay before starting

        return () => {
            clearTimeout(startDelay)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return (
        <div className="w-full bg-[#08080c] rounded-2xl border border-[#1a1a24] overflow-hidden">
            {/* Diagram */}
            <div className="p-4">
                <svg viewBox="0 0 620 240" className="w-full h-auto">
                    {/* Section backgrounds */}
                    <rect x={10} y={25} width={165} height={145} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={195} y={25} width={165} height={200} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={380} y={25} width={165} height={145} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />

                    {/* Section labels */}
                    <text x={20} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>CLIENT</text>
                    <text x={205} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>PROCESSING</text>
                    <text x={390} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>STORAGE</text>

                    {/* gRPC label - positioned in the gap between Client and Processing sections */}
                    <g transform="translate(185, 162)">
                        <rect x={-14} y={-7} width={28} height={14} rx={3} fill="#0a0a12" stroke="#22c55e30" strokeWidth={1} />
                        <text x={0} y={3} fill="#22c55e" fontSize={7} fontFamily="monospace" textAnchor="middle" fontWeight={500}>gRPC</text>
                    </g>

                    {/* Connections */}
                    {/* File Watcher → Chunker */}
                    <Connection
                        path="M 165 75 L 205 75"
                        isActive={activeSteps.has("input") || activeSteps.has("chunk")}
                        color="#22c55e"
                    />

                    {/* Chunker → Embedder */}
                    <Connection
                        path="M 277 95 L 277 115"
                        isActive={activeSteps.has("chunk") || activeSteps.has("embed")}
                        color="#f59e0b"
                    />

                    {/* Embedder → Model */}
                    <Connection
                        path="M 277 155 L 277 175"
                        isActive={activeSteps.has("embed")}
                        color="#444ce7"
                    />

                    {/* Model → ChromaDB */}
                    <Connection
                        path="M 350 195 Q 400 195 400 125 L 400 95"
                        isActive={activeSteps.has("store")}
                        color="#8b5cf6"
                    />

                    {/* Embedder → Redis */}
                    <Connection
                        path="M 350 135 L 390 135"
                        isActive={activeSteps.has("store")}
                        color="#ef4444"
                    />

                    {/* Editor → Embedder (query) */}
                    <Connection
                        path="M 165 125 Q 185 125 185 135 L 205 135"
                        isActive={activeSteps.has("query")}
                        color="#06b6d4"
                    />

                    {/* Embedder → ChromaDB (query) */}
                    <Connection
                        path="M 350 125 L 390 95"
                        isActive={activeSteps.has("query")}
                        color="#ec4899"
                    />

                    {/* Nodes */}
                    <Node x={20} y={55} width={140} height={40} label="File Watcher" sublabel="Tauri events" color="#22c55e" isActive={activeSteps.has("input")} />
                    <Node x={20} y={105} width={140} height={40} label="Editor UI" sublabel="Search interface" color="#06b6d4" isActive={activeSteps.has("query")} />

                    <Node x={205} y={55} width={140} height={40} label="Chunker" sublabel="tree-sitter AST" color="#f59e0b" isActive={activeSteps.has("chunk")} />
                    <Node x={205} y={115} width={140} height={40} label="Embedder" sublabel="llama.cpp" color="#444ce7" isActive={activeSteps.has("embed") || activeSteps.has("query")} />
                    <Node x={205} y={175} width={140} height={40} label="Jina Code v2" sublabel="1.5B params" color="#8b5cf6" isActive={activeSteps.has("embed")} />

                    <Node x={390} y={55} width={140} height={40} label="ChromaDB" sublabel="Vector store" color="#ec4899" isActive={activeSteps.has("store") || activeSteps.has("query")} />
                    <Node x={390} y={115} width={140} height={40} label="Redis" sublabel="Metadata" color="#ef4444" isActive={activeSteps.has("store")} />

                    {/* Legend */}
                    <g transform="translate(560, 200)">
                        <circle cx={0} cy={0} r={4} fill="#22c55e" />
                        <text x={8} y={3} fill="#6b7280" fontSize={8}>Index</text>
                        <circle cx={0} cy={14} r={4} fill="#06b6d4" />
                        <text x={8} y={17} fill="#6b7280" fontSize={8}>Query</text>
                    </g>
                </svg>
            </div>

            {/* Status */}
            <div className="px-5 py-3 bg-[#0a0a10] border-t border-[#1a1a24] flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activeSteps.size === 0 ? "bg-zinc-600" : "bg-[#444ce7] animate-pulse"}`} />
                <span className="text-sm text-zinc-400">{stepDescriptions[currentDescription]}</span>
            </div>
        </div>
    )
}

