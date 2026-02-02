"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

type PipelineStep = "idle" | "scan" | "detect" | "parse" | "embed" | "store"

const stepDescriptions: Record<PipelineStep | "indexing", { title: string; detail: string }> = {
    idle: { title: "Codebase Indexing Pipeline", detail: "Click to start or watch the animation" },
    scan: { title: "Scanning Files", detail: "Traversing directory tree, reading source files" },
    detect: { title: "Language Detection", detail: "Identifying file types via extensions and content analysis" },
    parse: { title: "AST Parsing & Chunking", detail: "Tree-sitter extracts semantic units (functions, classes, methods)" },
    embed: { title: "Embedding Generation", detail: "Neural encoder transforms code chunks into high-dimensional vectors" },
    store: { title: "Vector Storage", detail: "Embeddings stored in vector DB with file/line metadata" },
    indexing: { title: "Pipeline Running", detail: "Data flows through each stage sequentially" },
}

// Reusable Node component
function PipelineNode({
    x, y, width, height,
    label, sublabel, icon,
    color,
    isActive,
}: {
    x: number; y: number; width: number; height: number;
    label: string; sublabel?: string; icon?: string;
    color: string;
    isActive: boolean;
}) {
    return (
        <g>
            {/* Glow effect when active */}
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

            {/* Node background */}
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

            {/* Color accent bar */}
            <rect
                x={x}
                y={y}
                width={4}
                height={height}
                rx={2}
                fill={color}
                opacity={isActive ? 1 : 0.3}
            />

            {/* Icon (emoji) */}
            {icon && (
                <text
                    x={x + 16}
                    y={y + height / 2 + 1}
                    fontSize={14}
                    dominantBaseline="middle"
                >
                    {icon}
                </text>
            )}

            {/* Label */}
            <text
                x={x + (icon ? 34 : 14)}
                y={y + (sublabel ? height / 2 - 4 : height / 2)}
                fill="white"
                fontSize={11}
                fontWeight={600}
                fontFamily="system-ui, sans-serif"
                dominantBaseline={sublabel ? "auto" : "middle"}
            >
                {label}
            </text>

            {/* Sublabel */}
            {sublabel && (
                <text
                    x={x + (icon ? 34 : 14)}
                    y={y + height / 2 + 10}
                    fill="#6b7280"
                    fontSize={8}
                    fontFamily="system-ui, sans-serif"
                >
                    {sublabel}
                </text>
            )}
        </g>
    )
}

// Animated connection with flowing particle
function PipelineConnection({
    path,
    isActive,
    color,
    dashed = false,
}: {
    path: string;
    isActive: boolean;
    color: string;
    dashed?: boolean;
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
                strokeDasharray={dashed ? "4 3" : undefined}
            />

            {/* Active glow */}
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
                    {/* Flowing particle */}
                    <motion.circle
                        r={4}
                        fill={color}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <animateMotion
                            dur="1.5s"
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

// Arrow marker for connections
function ArrowMarker({ id, color }: { id: string; color: string }) {
    return (
        <marker
            id={id}
            markerWidth={8}
            markerHeight={8}
            refX={6}
            refY={3}
            orient="auto"
            markerUnits="strokeWidth"
        >
            <path d="M0,0 L0,6 L6,3 z" fill={color} />
        </marker>
    )
}

export function IndexingPipelineDemo() {
    const [activeSteps, setActiveSteps] = useState<Set<PipelineStep>>(new Set())
    const [currentStep, setCurrentStep] = useState<PipelineStep | "indexing">("idle")
    const [isAnimating, setIsAnimating] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const runAnimation = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)

        const sequence: { step: PipelineStep; delay: number }[] = [
            { step: "scan", delay: 1000 },
            { step: "detect", delay: 1000 },
            { step: "parse", delay: 1200 },
            { step: "embed", delay: 1200 },
            { step: "store", delay: 1500 },
        ]

        let accumulated = new Set<PipelineStep>()

        const runStep = (index: number) => {
            if (index >= sequence.length) {
                // Hold full state then reset
                timeoutRef.current = setTimeout(() => {
                    setActiveSteps(new Set())
                    setCurrentStep("idle")
                    timeoutRef.current = setTimeout(() => {
                        setIsAnimating(false)
                        runAnimation()
                    }, 2000)
                }, 2000)
                return
            }

            const step = sequence[index].step
            accumulated = new Set([...accumulated, step])
            setActiveSteps(new Set(accumulated))
            setCurrentStep(index < sequence.length - 1 ? step : "indexing")

            timeoutRef.current = setTimeout(() => {
                runStep(index + 1)
            }, sequence[index].delay)
        }

        runStep(0)
    }, [isAnimating])

    // Auto-run on mount
    useEffect(() => {
        const startDelay = setTimeout(() => {
            runAnimation()
        }, 1000)

        return () => {
            clearTimeout(startDelay)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const description = stepDescriptions[currentStep]

    return (
        <div className="w-full bg-[#08080c] rounded-xl border border-[#1a1a24] overflow-hidden">
            {/* Main diagram */}
            <div className="p-3 sm:p-4">
                <svg viewBox="0 0 600 200" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <ArrowMarker id="arrow-green" color="#22c55e" />
                        <ArrowMarker id="arrow-blue" color="#3b82f6" />
                        <ArrowMarker id="arrow-orange" color="#f59e0b" />
                        <ArrowMarker id="arrow-purple" color="#8b5cf6" />
                        <ArrowMarker id="arrow-pink" color="#ec4899" />
                    </defs>

                    {/* Pipeline stages background */}
                    <rect x={5} y={15} width={590} height={170} rx={8} fill="#0a0a12" stroke="#15152a" strokeDasharray="4 2" opacity={0.5} />

                    {/* Stage 1: Local Codebase */}
                    <PipelineNode
                        x={15} y={75}
                        width={95} height={50}
                        label="Codebase"
                        sublabel=".ts, .py, .rs..."
                        color="#22c55e"
                        isActive={activeSteps.has("scan")}
                    />

                    {/* Connection: Codebase → Language Detection */}
                    <PipelineConnection
                        path="M 110 100 L 135 100"
                        isActive={activeSteps.has("scan") || activeSteps.has("detect")}
                        color="#22c55e"
                    />

                    {/* Stage 2: Language Detection */}
                    <PipelineNode
                        x={135} y={75}
                        width={100} height={50}
                        label="Detection"
                        sublabel="Identify language"
                        color="#3b82f6"
                        isActive={activeSteps.has("detect")}
                    />

                    {/* Connection: Detection → Parsing */}
                    <PipelineConnection
                        path="M 235 100 L 260 100"
                        isActive={activeSteps.has("detect") || activeSteps.has("parse")}
                        color="#3b82f6"
                    />

                    {/* Stage 3: AST Parsing & Chunking */}
                    <PipelineNode
                        x={260} y={75}
                        width={100} height={50}
                        label="Chunking"
                        sublabel="Tree-sitter AST"
                        color="#f59e0b"
                        isActive={activeSteps.has("parse")}
                    />

                    {/* Connection: Parsing → Embedding */}
                    <PipelineConnection
                        path="M 360 100 L 385 100"
                        isActive={activeSteps.has("parse") || activeSteps.has("embed")}
                        color="#f59e0b"
                    />

                    {/* Stage 4: Embedding Generation */}
                    <PipelineNode
                        x={385} y={75}
                        width={100} height={50}
                        label="Embedding"
                        sublabel="Code → vectors"
                        color="#8b5cf6"
                        isActive={activeSteps.has("embed")}
                    />

                    {/* Connection: Embedding → Vector DB */}
                    <PipelineConnection
                        path="M 485 100 L 510 100"
                        isActive={activeSteps.has("embed") || activeSteps.has("store")}
                        color="#8b5cf6"
                    />

                    {/* Stage 5: Vector Database */}
                    <PipelineNode
                        x={510} y={75}
                        width={80} height={50}
                        label="Vector DB"
                        sublabel="Store & index"
                        color="#ec4899"
                        isActive={activeSteps.has("store")}
                    />

                    {/* Data annotations - small labels showing what flows between stages */}
                    <text x={122} y={68} fill="#4b5563" fontSize={7} textAnchor="middle">files</text>
                    <text x={247} y={68} fill="#4b5563" fontSize={7} textAnchor="middle">typed files</text>
                    <text x={372} y={68} fill="#4b5563" fontSize={7} textAnchor="middle">chunks</text>
                    <text x={497} y={68} fill="#4b5563" fontSize={7} textAnchor="middle">vectors</text>

                    {/* Example data visualization - small file icons flowing */}
                    {activeSteps.has("scan") && (
                        <g>
                            <motion.text
                                x={50} y={145}
                                fontSize={8}
                                fill="#6b7280"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                auth.ts, db.py, api.rs
                            </motion.text>
                        </g>
                    )}

                    {activeSteps.has("parse") && (
                        <g>
                            <motion.text
                                x={260} y={145}
                                fontSize={8}
                                fill="#6b7280"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                fn login(), class User
                            </motion.text>
                        </g>
                    )}

                    {activeSteps.has("embed") && (
                        <g>
                            <motion.text
                                x={385} y={145}
                                fontSize={8}
                                fill="#6b7280"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                [0.23, -0.87, 0.12...]
                            </motion.text>
                        </g>
                    )}

                    {/* Legend */}
                    <g transform="translate(15, 175)">
                        <text fill="#4b5563" fontSize={8} fontWeight={500}>PIPELINE:</text>
                        {[
                            { color: "#22c55e", label: "Scan" },
                            { color: "#3b82f6", label: "Detect" },
                            { color: "#f59e0b", label: "Parse" },
                            { color: "#8b5cf6", label: "Embed" },
                            { color: "#ec4899", label: "Store" },
                        ].map((item, i) => (
                            <g key={item.label} transform={`translate(${60 + i * 55}, 0)`}>
                                <circle cx={0} cy={-3} r={3} fill={item.color} opacity={activeSteps.has(item.label.toLowerCase() as PipelineStep) ? 1 : 0.3} />
                                <text x={6} y={0} fill={activeSteps.has(item.label.toLowerCase() as PipelineStep) ? "#a1a1aa" : "#4b5563"} fontSize={8}>{item.label}</text>
                            </g>
                        ))}
                    </g>
                </svg>
            </div>

            {/* Status bar */}
            <div className="px-4 py-3 bg-[#0a0a10] border-t border-[#1a1a24] flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeSteps.size === 0 ? "bg-zinc-600" : "bg-emerald-500 animate-pulse"}`} />
                <div className="min-w-0">
                    <span className="text-sm text-zinc-300 font-medium">{description.title}</span>
                    <span className="text-sm text-zinc-500 hidden sm:inline"> — {description.detail}</span>
                </div>
            </div>
        </div>
    )
}
