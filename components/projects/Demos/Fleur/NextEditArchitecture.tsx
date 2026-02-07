"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

type FlowStep = "idle" | "editor" | "tauri" | "grpc" | "prompt" | "model" | "response"

const stepDescriptions: Record<FlowStep | "request" | "inference", string> = {
    idle: "Next-edit prediction pipeline",
    editor: "Editor triggers prediction request on typing pause",
    tauri: "Tauri command invokes gRPC client",
    grpc: "NextEditService receives prediction request",
    prompt: "Prompt builder formats context and diffs",
    model: "Sweep Next-Edit 1.5B generates prediction via llama.cpp",
    response: "Predicted content returned to editor",
    request: "Request flowing through the stack",
    inference: "Model inference in progress",
}

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
            <rect
                x={x}
                y={y}
                width={4}
                height={height}
                rx={2}
                fill={color}
                opacity={isActive ? 1 : 0.3}
            />
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
            <path
                d={path}
                fill="none"
                stroke="#1a1a28"
                strokeWidth={2}
                strokeLinecap="round"
            />
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

export function NextEditArchitecture() {
    const [activeSteps, setActiveSteps] = useState<Set<FlowStep>>(new Set())
    const [currentDescription, setCurrentDescription] = useState<FlowStep | "request" | "inference">("idle")
    const [isAnimating, setIsAnimating] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const runAnimation = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)

        // Phase 1: Request flows forward, stacking up
        const requestSequence: FlowStep[] = ["editor", "tauri", "grpc", "prompt", "model"]

        setCurrentDescription("request")
        let accumulated = new Set<FlowStep>()

        const runRequestStep = (index: number) => {
            if (index >= requestSequence.length) {
                // Phase 2: Inference - only model is lit (processing)
                setCurrentDescription("inference")
                setActiveSteps(new Set<FlowStep>(["model"]))

                timeoutRef.current = setTimeout(() => {
                    runResponsePhase()
                }, 1200)
                return
            }

            const step = requestSequence[index]
            accumulated = new Set([...accumulated, step])
            setActiveSteps(new Set(accumulated))

            timeoutRef.current = setTimeout(() => {
                runRequestStep(index + 1)
            }, 700)
        }

        const runResponsePhase = () => {
            // Phase 3: Response flows from Model back to Editor
            setCurrentDescription("response")

            // First: Model sends response, connection starts animating
            setActiveSteps(new Set<FlowStep>(["model", "response"]))

            timeoutRef.current = setTimeout(() => {
                // After connection animation completes, editor lights up
                setActiveSteps(new Set<FlowStep>(["model", "response", "editor"]))

                timeoutRef.current = setTimeout(() => {
                    // Reset everything
                    setActiveSteps(new Set())
                    setCurrentDescription("idle")

                    timeoutRef.current = setTimeout(() => {
                        setIsAnimating(false)
                        runAnimation()
                    }, 1500)
                }, 1500)
            }, 1200)
        }

        // Start the sequence
        runRequestStep(0)
    }, [isAnimating])

    // Auto-run animation on mount
    useEffect(() => {
        const startDelay = setTimeout(() => {
            runAnimation()
        }, 800)

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
                <svg viewBox="0 0 620 280" className="w-full h-auto">
                    {/* Section backgrounds */}
                    <rect x={10} y={25} width={165} height={165} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={195} y={25} width={165} height={165} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={380} y={25} width={165} height={210} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />

                    {/* Section labels */}
                    <text x={20} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>FRONTEND</text>
                    <text x={205} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>TAURI BRIDGE</text>
                    <text x={390} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>PYTHON SERVER</text>

                    {/* gRPC label - between Tauri Bridge and Python Server */}
                    <g transform="translate(370, 118)">
                        <rect x={-16} y={-8} width={32} height={16} rx={4} fill="#0a0a12" stroke="#22c55e40" strokeWidth={1} />
                        <text x={0} y={4} fill="#22c55e" fontSize={8} fontFamily="monospace" textAnchor="middle" fontWeight={500}>gRPC</text>
                    </g>

                    {/* Connections - Request flow */}
                    {/* Editor → Tauri Command - lights when editor is active (data flowing out) */}
                    <Connection
                        path="M 165 75 L 205 75"
                        isActive={activeSteps.has("editor") && !activeSteps.has("response")}
                        color="#f59e0b"
                    />

                    {/* Tauri Command → gRPC Client */}
                    <Connection
                        path="M 277 95 L 277 115"
                        isActive={activeSteps.has("tauri")}
                        color="#22c55e"
                    />

                    {/* gRPC Client → NextEditService */}
                    <Connection
                        path="M 350 135 L 390 135"
                        isActive={activeSteps.has("tauri")}
                        color="#22c55e"
                    />

                    {/* NextEditService → Prompt Builder */}
                    <Connection
                        path="M 452 95 L 452 115"
                        isActive={activeSteps.has("grpc")}
                        color="#444ce7"
                    />

                    {/* Prompt Builder → Model */}
                    <Connection
                        path="M 452 155 L 452 175"
                        isActive={activeSteps.has("prompt")}
                        color="#8b5cf6"
                    />

                    {/* Response flow - Model → Editor (clean curve below) */}
                    <Connection
                        path="M 390 195 L 200 195 Q 165 195 165 155 L 165 75 L 160 75"
                        isActive={activeSteps.has("response")}
                        color="#ec4899"
                    />

                    {/* Nodes - Frontend */}
                    <Node x={20} y={55} width={140} height={40} label="Monaco Editor" sublabel="InlineCompletions" color="#f59e0b" isActive={activeSteps.has("editor")} />
                    <Node x={20} y={105} width={140} height={40} label="Diff Tracker" sublabel="Recent changes" color="#06b6d4" isActive={activeSteps.has("editor")} />

                    {/* Nodes - Tauri Bridge */}
                    <Node x={205} y={55} width={140} height={40} label="Tauri Command" sublabel="grpc_predict" color="#22c55e" isActive={activeSteps.has("tauri")} />
                    <Node x={205} y={115} width={140} height={40} label="gRPC Client" sublabel="Rust tonic" color="#22c55e" isActive={activeSteps.has("tauri")} />

                    {/* Nodes - Python Server */}
                    <Node x={390} y={55} width={140} height={40} label="NextEditService" sublabel=":50051" color="#444ce7" isActive={activeSteps.has("grpc")} />
                    <Node x={390} y={115} width={140} height={40} label="Prompt Builder" sublabel="Sweep format" color="#444ce7" isActive={activeSteps.has("prompt")} />
                    <Node x={390} y={175} width={140} height={40} label="Next-Edit 1.5B" sublabel="llama.cpp Metal" color="#8b5cf6" isActive={activeSteps.has("model")} />

                    {/* Legend */}
                    <g transform="translate(560, 230)">
                        <circle cx={0} cy={0} r={4} fill="#22c55e" />
                        <text x={8} y={3} fill="#6b7280" fontSize={8}>Request</text>
                        <circle cx={0} cy={14} r={4} fill="#ec4899" />
                        <text x={8} y={17} fill="#6b7280" fontSize={8}>Response</text>
                    </g>
                </svg>
            </div>

            {/* Status */}
            <div className="px-5 py-3 bg-[#0a0a10] border-t border-[#1a1a24] flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activeSteps.size === 0 ? "bg-zinc-600" : "bg-[#8b5cf6] animate-pulse"}`} />
                <span className="text-sm text-zinc-400">{stepDescriptions[currentDescription]}</span>
            </div>
        </div>
    )
}
