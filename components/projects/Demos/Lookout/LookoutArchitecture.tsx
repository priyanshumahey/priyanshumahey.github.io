"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

type FlowStep =
    | "follower1"
    | "follower2"
    | "follower3"
    | "ingest"
    | "store"
    | "query"
    | "http"
    | "ui"
    | "playback"

type DescriptionKey = "idle" | "ingest" | "query" | "playback"

const stepDescriptions: Record<DescriptionKey, string> = {
    idle: "Distributed video RAG — three processes, one QUIC mesh",
    ingest: "Followers embed on-device and push tiny vectors to the leader over iroh QUIC",
    query: "Operator asks a natural-language question — leader embeds, retrieves, synthesizes",
    playback: "UI requests a raw clip — leader dials the originating follower on demand",
}

function Node({
    x, y, width, height, label, sublabel, color, isActive,
}: {
    x: number; y: number; width: number; height: number
    label: string; sublabel?: string
    color: string; isActive: boolean
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
            <rect x={x} y={y} width={width} height={height} rx={8}
                fill="#0c0c14"
                stroke={isActive ? color : "#1f1f2e"}
                strokeWidth={isActive ? 2 : 1} />
            <rect x={x} y={y} width={4} height={height} rx={2}
                fill={color} opacity={isActive ? 1 : 0.3} />
            <text x={x + 14} y={y + (sublabel ? height / 2 - 4 : height / 2)}
                fill="white" fontSize={12} fontWeight={600}
                fontFamily="system-ui, sans-serif"
                dominantBaseline={sublabel ? "auto" : "middle"}>
                {label}
            </text>
            {sublabel && (
                <text x={x + 14} y={y + height / 2 + 10}
                    fill="#6b7280" fontSize={9}
                    fontFamily="system-ui, sans-serif">
                    {sublabel}
                </text>
            )}
        </g>
    )
}

function Connection({ path, isActive, color, dashed = false }: {
    path: string; isActive: boolean; color: string; dashed?: boolean
}) {
    return (
        <g>
            <path d={path} fill="none" stroke="#1a1a28" strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={dashed ? "4 4" : undefined} />
            {isActive && (
                <>
                    <motion.path
                        d={path} fill="none" stroke={color} strokeWidth={2}
                        strokeLinecap="round"
                        strokeDasharray={dashed ? "4 4" : undefined}
                        initial={{ pathLength: 0, opacity: 0.5 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }} />
                    <motion.circle r={4} fill={color}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}>
                        <animateMotion dur="1.2s" repeatCount="indefinite"
                            path={path} keyPoints="0;1" keyTimes="0;1"
                            calcMode="spline" keySplines="0.4 0 0.2 1" />
                    </motion.circle>
                </>
            )}
        </g>
    )
}

export function LookoutArchitecture() {
    const [activeSteps, setActiveSteps] = useState<Set<FlowStep>>(new Set())
    const [currentDescription, setCurrentDescription] = useState<DescriptionKey>("idle")
    const [isAnimating, setIsAnimating] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const STEP = 650
    const HOLD = 1600
    const IDLE = 1200

    const runAnimation = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)

        const setSteps = (steps: FlowStep[]) => setActiveSteps(new Set(steps))

        const runIngestPhase = () => {
            setCurrentDescription("ingest")
            // All three cameras wake together — they're independent edge devices.
            setSteps(["follower1", "follower2", "follower3"])
            timeoutRef.current = setTimeout(() => {
                // Vectors flow into the iroh endpoint on the leader.
                setSteps(["follower1", "follower2", "follower3", "ingest"])
                timeoutRef.current = setTimeout(() => {
                    // Leader persists into ChromaDB.
                    setSteps(["follower1", "follower2", "follower3", "ingest", "store"])
                    timeoutRef.current = setTimeout(runQueryPhase, HOLD)
                }, STEP)
            }, STEP)
        }

        const runQueryPhase = () => {
            setCurrentDescription("query")
            // UI asks leader, leader reads from ChromaDB — show the full path lit.
            setSteps(["ui", "http", "query", "store"])
            timeoutRef.current = setTimeout(runPlaybackPhase, HOLD)
        }

        const runPlaybackPhase = () => {
            setCurrentDescription("playback")
            // Stage 1: UI kicks off a clip request — the UI→iroh dashed arc lights up.
            setSteps(["ui", "playback"])
            timeoutRef.current = setTimeout(() => {
                // Stage 2: request reaches the originating follower and the clip streams back.
                // We intentionally don't add `ingest` here — it would re-trigger the solid
                // ingest arrows from the other cameras. The dashed arcs already carry the
                // particle visibly through the iroh endpoint.
                setSteps(["ui", "playback", "follower1"])
                timeoutRef.current = setTimeout(() => {
                    setActiveSteps(new Set())
                    setCurrentDescription("idle")
                    timeoutRef.current = setTimeout(() => {
                        setIsAnimating(false)
                        runAnimation()
                    }, IDLE)
                }, HOLD)
            }, STEP)
        }

        runIngestPhase()
    }, [isAnimating])

    useEffect(() => {
        const t = setTimeout(() => runAnimation(), 600)
        return () => {
            clearTimeout(t)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    return (
        <div className="w-full bg-[#08080c] rounded-2xl border border-[#1a1a24] overflow-hidden">
            <div className="p-4">
                <svg viewBox="0 0 720 300" className="w-full h-auto">
                    {/* Section backgrounds */}
                    <rect x={10} y={25} width={180} height={260} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={260} y={25} width={300} height={260} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={580} y={25} width={130} height={260} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />

                    <text x={20} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>EDGE DEVICES</text>
                    <text x={270} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>LEADER</text>
                    <text x={590} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>BROWSER</text>

                    {/* QUIC label */}
                    <g transform="translate(225, 155)">
                        <rect x={-20} y={-8} width={40} height={16} rx={4} fill="#0a0a12" stroke="#22c55e40" strokeWidth={1} />
                        <text x={0} y={4} fill="#22c55e" fontSize={8} fontFamily="monospace" textAnchor="middle" fontWeight={500}>iroh QUIC</text>
                    </g>

                    {/* HTTP label */}
                    <g transform="translate(570, 155)">
                        <rect x={-16} y={-8} width={32} height={16} rx={4} fill="#0a0a12" stroke="#f59e0b40" strokeWidth={1} />
                        <text x={0} y={4} fill="#f59e0b" fontSize={8} fontFamily="monospace" textAnchor="middle" fontWeight={500}>HTTP</text>
                    </g>

                    {/* Follower → iroh ingest */}
                    <Connection path="M 175 80 L 270 95" isActive={activeSteps.has("follower1") && activeSteps.has("ingest")} color="#22c55e" />
                    <Connection path="M 175 140 L 270 115" isActive={activeSteps.has("follower2") && activeSteps.has("ingest")} color="#22c55e" />
                    <Connection path="M 175 200 L 270 135" isActive={activeSteps.has("follower3") && activeSteps.has("ingest")} color="#22c55e" />

                    {/* iroh → ChromaDB */}
                    <Connection path="M 330 135 L 330 175" isActive={activeSteps.has("store")} color="#8b5cf6" />

                    {/* ChromaDB → Query */}
                    <Connection path="M 400 195 L 440 195" isActive={activeSteps.has("query")} color="#ec4899" />

                    {/* Query → HTTP */}
                    <Connection path="M 490 175 L 490 145" isActive={activeSteps.has("query") && activeSteps.has("http")} color="#ec4899" />

                    {/* HTTP → UI */}
                    <Connection path="M 545 125 L 595 125" isActive={activeSteps.has("http") && activeSteps.has("ui")} color="#f59e0b" />

                    {/* UI → iroh (playback request, dashed) */}
                    <Connection path="M 595 205 Q 500 255 330 235 L 330 145" dashed isActive={activeSteps.has("playback")} color="#06b6d4" />

                    {/* iroh → Follower (raw MP4, dashed) */}
                    <Connection path="M 270 95 L 175 80" dashed isActive={activeSteps.has("playback") && activeSteps.has("follower1")} color="#06b6d4" />

                    {/* Edge nodes */}
                    <Node x={20} y={60} width={155} height={45} label="Follower · cam-lab-1" sublabel="webcam + Gemma on Cactus" color="#22c55e" isActive={activeSteps.has("follower1")} />
                    <Node x={20} y={120} width={155} height={45} label="Follower · cam-lab-2" sublabel="webcam + Gemma on Cactus" color="#22c55e" isActive={activeSteps.has("follower2")} />
                    <Node x={20} y={180} width={155} height={45} label="Follower · cam-door" sublabel="webcam + Gemma on Cactus" color="#22c55e" isActive={activeSteps.has("follower3")} />

                    {/* Leader nodes */}
                    <Node x={270} y={85} width={130} height={45} label="iroh Endpoint" sublabel="ALPN: lookout/ingest/v1" color="#22c55e" isActive={activeSteps.has("ingest")} />
                    <Node x={270} y={175} width={130} height={45} label="ChromaDB" sublabel="per-modality vectors" color="#8b5cf6" isActive={activeSteps.has("store")} />
                    <Node x={440} y={175} width={110} height={45} label="Query / RAG" sublabel="Gemma synthesis" color="#ec4899" isActive={activeSteps.has("query")} />
                    <Node x={420} y={100} width={130} height={45} label="axum :8080" sublabel="/api/cameras · /api/query" color="#f59e0b" isActive={activeSteps.has("http")} />

                    {/* Browser */}
                    <Node x={595} y={105} width={105} height={45} label="React UI" sublabel="live tiles · chat" color="#f59e0b" isActive={activeSteps.has("ui")} />
                    <Node x={595} y={185} width={105} height={45} label="Clip Playback" sublabel="lazy MP4 pull" color="#06b6d4" isActive={activeSteps.has("playback")} />

                    {/* Legend */}
                    <g transform="translate(20, 260)">
                        <circle cx={0} cy={0} r={4} fill="#22c55e" />
                        <text x={8} y={3} fill="#6b7280" fontSize={8}>Ingest</text>
                        <circle cx={60} cy={0} r={4} fill="#ec4899" />
                        <text x={68} y={3} fill="#6b7280" fontSize={8}>Query</text>
                        <circle cx={120} cy={0} r={4} fill="#06b6d4" />
                        <text x={128} y={3} fill="#6b7280" fontSize={8}>Playback</text>
                    </g>
                </svg>
            </div>

            <div className="px-5 py-3 bg-[#0a0a10] border-t border-[#1a1a24] flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activeSteps.size === 0 ? "bg-zinc-600" : "bg-[#22c55e] animate-pulse"}`} />
                <span className="text-sm text-zinc-400">{stepDescriptions[currentDescription]}</span>
            </div>
        </div>
    )
}
