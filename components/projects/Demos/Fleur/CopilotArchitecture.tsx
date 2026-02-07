"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

type FlowStep = "chat" | "tauri" | "copilot" | "llm" | "tools" | "stream" | "persist" | "diff"

type DescriptionKey = "idle" | "request" | "agentic" | "tool-loop" | "streaming" | "approval" | "persist"

const stepDescriptions: Record<DescriptionKey, string> = {
    idle: "AI copilot — agentic tool-calling loop",
    request: "User message flowing through Tauri IPC to CopilotService",
    agentic: "Agentic loop — LLM calls tools autonomously (up to 20 iterations)",
    "tool-loop": "Tool results fed back to LLM for next iteration",
    streaming: "Streaming response chunks back to the chat panel",
    approval: "File-modifying tools deferred — shown as diffs for approval",
    persist: "Conversation persisted to SQLite with full tool call metadata",
}

function Node({
    x, y, width, height,
    label, sublabel,
    color,
    isActive,
}: {
    x: number; y: number; width: number; height: number
    label: string; sublabel?: string
    color: string
    isActive: boolean
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

function Connection({
    path,
    isActive,
    color,
}: {
    path: string
    isActive: boolean
    color: string
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

export function CopilotArchitecture() {
    const [activeSteps, setActiveSteps] = useState<Set<FlowStep>>(new Set())
    const [currentDescription, setCurrentDescription] = useState<DescriptionKey>("idle")
    const [isAnimating, setIsAnimating] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Consistent timing constants (matched to CodeIndexingArchitecture pacing)
    const STEP = 800    // time between stacking steps
    const HOLD = 2000   // time a phase stays visible
    const IDLE = 1500   // pause between animation cycles

    const runAnimation = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)

        // Phase 1: Request stacks forward through the pipeline
        const requestSteps: FlowStep[] = ["chat", "tauri", "copilot"]
        setCurrentDescription("request")
        let accumulated = new Set<FlowStep>()

        const runRequestStep = (index: number) => {
            if (index >= requestSteps.length) {
                timeoutRef.current = setTimeout(runAgenticPhase, STEP)
                return
            }

            accumulated = new Set([...accumulated, requestSteps[index]])
            setActiveSteps(new Set(accumulated))
            timeoutRef.current = setTimeout(() => runRequestStep(index + 1), STEP)
        }

        const runAgenticPhase = () => {
            // Phase 2: CopilotService calls LLM with tool definitions
            setCurrentDescription("agentic")
            setActiveSteps(new Set<FlowStep>(["copilot", "llm"]))

            timeoutRef.current = setTimeout(() => {
                // Phase 3: LLM returns tool_calls → Tool Executor runs
                setActiveSteps(new Set<FlowStep>(["copilot", "llm", "tools"]))

                timeoutRef.current = setTimeout(runToolLoopPhase, HOLD)
            }, HOLD)
        }

        const runToolLoopPhase = () => {
            // Phase 4: Tool results feed back to CopilotService (the loop)
            setCurrentDescription("tool-loop")
            setActiveSteps(new Set<FlowStep>(["tools", "copilot"]))

            timeoutRef.current = setTimeout(() => {
                // Phase 5: CopilotService calls LLM again with tool results
                setCurrentDescription("agentic")
                setActiveSteps(new Set<FlowStep>(["copilot", "llm"]))

                timeoutRef.current = setTimeout(runStreamingPhase, HOLD)
            }, HOLD)
        }

        const runStreamingPhase = () => {
            // Phase 6: Final response streams back to the chat panel
            setCurrentDescription("streaming")
            setActiveSteps(new Set<FlowStep>(["copilot", "stream", "chat"]))

            timeoutRef.current = setTimeout(runApprovalPhase, HOLD)
        }

        const runApprovalPhase = () => {
            // Phase 7: File-modifying tool proposals shown as diffs
            setCurrentDescription("approval")
            setActiveSteps(new Set<FlowStep>(["tools", "diff"]))

            timeoutRef.current = setTimeout(runPersistPhase, HOLD)
        }

        const runPersistPhase = () => {
            // Phase 8: Conversation + tool call metadata persisted
            setCurrentDescription("persist")
            setActiveSteps(new Set<FlowStep>(["copilot", "persist"]))

            timeoutRef.current = setTimeout(() => {
                setActiveSteps(new Set())
                setCurrentDescription("idle")

                timeoutRef.current = setTimeout(() => {
                    setIsAnimating(false)
                    runAnimation()
                }, IDLE)
            }, HOLD)
        }

        // Start the sequence
        runRequestStep(0)
    }, [isAnimating])

    // Auto-run animation on mount
    useEffect(() => {
        const startDelay = setTimeout(() => runAnimation(), 800)

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
                <svg viewBox="0 0 680 290" className="w-full h-auto">
                    {/* Section backgrounds */}
                    <rect x={10} y={25} width={155} height={210} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={185} y={25} width={145} height={145} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={350} y={25} width={320} height={210} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />

                    {/* Section labels */}
                    <text x={20} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>FRONTEND</text>
                    <text x={195} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>TAURI BRIDGE</text>
                    <text x={360} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>PYTHON BACKEND</text>

                    {/* gRPC label in the gap between Tauri and Python sections */}
                    <g transform="translate(340, 165)">
                        <rect x={-16} y={-8} width={32} height={16} rx={4} fill="#0a0a12" stroke="#22c55e40" strokeWidth={1} />
                        <text x={0} y={4} fill="#22c55e" fontSize={8} fontFamily="monospace" textAnchor="middle" fontWeight={500}>gRPC</text>
                    </g>

                    {/* Loop iteration counter */}
                    <g transform="translate(455, 160)">
                        <rect x={-24} y={-8} width={48} height={16} rx={4} fill="#0a0a12" stroke="#06b6d440" strokeWidth={1} />
                        <text x={0} y={4} fill="#06b6d4" fontSize={7} fontFamily="monospace" textAnchor="middle" fontWeight={500}>≤20 iter</text>
                    </g>

                    {/* === Connections === */}

                    {/* 1. Chat Panel → Tauri Command */}
                    <Connection
                        path="M 160 75 L 195 75"
                        isActive={activeSteps.has("chat") && activeSteps.has("tauri")}
                        color="#f59e0b"
                    />

                    {/* 2. Tauri Command → gRPC Client */}
                    <Connection
                        path="M 257 95 L 257 110"
                        isActive={activeSteps.has("tauri")}
                        color="#22c55e"
                    />

                    {/* 3. gRPC Client → CopilotService (curves through section gap) */}
                    <Connection
                        path="M 325 130 Q 360 130 360 75"
                        isActive={activeSteps.has("tauri") && activeSteps.has("copilot")}
                        color="#22c55e"
                    />

                    {/* 4. CopilotService → LLM Client */}
                    <Connection
                        path="M 495 75 L 510 75"
                        isActive={activeSteps.has("copilot") && activeSteps.has("llm")}
                        color="#444ce7"
                    />

                    {/* 5. LLM Client → Tool Executor */}
                    <Connection
                        path="M 585 95 L 585 115"
                        isActive={activeSteps.has("llm") && activeSteps.has("tools")}
                        color="#8b5cf6"
                    />

                    {/* 6. Tool Executor → CopilotService (the agentic loop) */}
                    <Connection
                        path="M 510 135 Q 425 160 425 95"
                        isActive={activeSteps.has("tools") && activeSteps.has("copilot") && !activeSteps.has("llm")}
                        color="#06b6d4"
                    />

                    {/* 7. Response stream: CopilotService → Event Listener (U-curve below diagram) */}
                    <Connection
                        path="M 360 85 C 360 245, 87 245, 87 150"
                        isActive={activeSteps.has("stream")}
                        color="#10b981"
                    />

                    {/* 8. Event Listener → Chat Panel (upward) */}
                    <Connection
                        path="M 87 110 L 87 95"
                        isActive={activeSteps.has("stream") && activeSteps.has("chat")}
                        color="#10b981"
                    />

                    {/* 9. CopilotService → SQLite */}
                    <Connection
                        path="M 425 95 L 425 175"
                        isActive={activeSteps.has("persist")}
                        color="#ef4444"
                    />

                    {/* 10. Tool Executor → Diff Viewer (deferred approval, curves below) */}
                    <Connection
                        path="M 585 155 C 585 265, 87 265, 87 205"
                        isActive={activeSteps.has("diff")}
                        color="#ec4899"
                    />

                    {/* === Nodes === */}

                    {/* Frontend */}
                    <Node x={20} y={55} width={135} height={40} label="Chat Panel" sublabel="React UI" color="#f59e0b" isActive={activeSteps.has("chat")} />
                    <Node x={20} y={110} width={135} height={40} label="Event Listener" sublabel="Streaming events" color="#22c55e" isActive={activeSteps.has("stream")} />
                    <Node x={20} y={165} width={135} height={40} label="Diff Viewer" sublabel="File approval" color="#ec4899" isActive={activeSteps.has("diff")} />

                    {/* Tauri Bridge */}
                    <Node x={195} y={55} width={125} height={40} label="Tauri Command" sublabel="grpc_chat" color="#22c55e" isActive={activeSteps.has("tauri")} />
                    <Node x={195} y={110} width={125} height={40} label="gRPC Client" sublabel="Streaming RPC" color="#22c55e" isActive={activeSteps.has("tauri")} />

                    {/* Python Backend */}
                    <Node x={360} y={55} width={130} height={40} label="CopilotService" sublabel="Agentic loop" color="#444ce7" isActive={activeSteps.has("copilot")} />
                    <Node x={510} y={55} width={150} height={40} label="LLM Client" sublabel="GPT-5.2 / Grok 3" color="#8b5cf6" isActive={activeSteps.has("llm")} />
                    <Node x={510} y={115} width={150} height={40} label="Tool Executor" sublabel="6 tools" color="#06b6d4" isActive={activeSteps.has("tools")} />
                    <Node x={360} y={175} width={130} height={40} label="SQLite" sublabel="Conversations" color="#ef4444" isActive={activeSteps.has("persist")} />

                    {/* Legend */}
                    <g transform="translate(610, 248)">
                        <circle cx={0} cy={0} r={4} fill="#f59e0b" />
                        <text x={8} y={3} fill="#6b7280" fontSize={8}>Request</text>
                        <circle cx={0} cy={14} r={4} fill="#06b6d4" />
                        <text x={8} y={17} fill="#6b7280" fontSize={8}>Loop</text>
                        <circle cx={0} cy={28} r={4} fill="#10b981" />
                        <text x={8} y={31} fill="#6b7280" fontSize={8}>Stream</text>
                    </g>
                </svg>
            </div>

            {/* Status bar */}
            <div className="px-5 py-3 bg-[#0a0a10] border-t border-[#1a1a24] flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activeSteps.size === 0 ? "bg-zinc-600" : "bg-[#444ce7] animate-pulse"}`} />
                <span className="text-sm text-zinc-400">{stepDescriptions[currentDescription]}</span>
            </div>
        </div>
    )
}
