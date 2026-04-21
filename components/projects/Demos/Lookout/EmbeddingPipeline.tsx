"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

type FlowStep =
    | "cam"
    | "mic"
    | "buffer"
    | "sample"
    | "gemma"
    | "emb"
    | "caption"
    | "jpeg"
    | "chunk"
    | "iroh"
    | "spool"

type DescriptionKey = "idle" | "capture" | "embed" | "package" | "ship" | "disconnect"

const stepDescriptions: Record<DescriptionKey, string> = {
    idle: "Follower pipeline — capture, embed, ship",
    capture: "Sliding window over webcam + microphone",
    embed: "Gemma 4 on Cactus produces a multimodal vector + one-sentence caption",
    package: "Vector, caption, and a representative JPEG are bundled into a chunk",
    ship: "Chunk pushed over iroh QUIC on a long-lived bidirectional stream",
    disconnect: "On disconnect, chunks spool to a bounded ring buffer and replay on reconnect",
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
                <motion.rect x={x - 3} y={y - 3} width={width + 6} height={height + 6} rx={11}
                    fill="none" stroke={color} strokeWidth={2}
                    initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }} />
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
                    <motion.path d={path} fill="none" stroke={color} strokeWidth={2}
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

export function EmbeddingPipeline() {
    const [activeSteps, setActiveSteps] = useState<Set<FlowStep>>(new Set())
    const [currentDescription, setCurrentDescription] = useState<DescriptionKey>("idle")
    const [isAnimating, setIsAnimating] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const STEP = 700
    const HOLD = 1600
    const IDLE = 1500

    const runAnimation = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)

        let accumulated = new Set<FlowStep>()

        const capture = () => {
            setCurrentDescription("capture")
            const steps: FlowStep[] = ["cam", "mic", "buffer", "sample"]
            accumulated = new Set()
            const next = (i: number) => {
                if (i >= steps.length) {
                    timeoutRef.current = setTimeout(embed, STEP)
                    return
                }
                accumulated = new Set([...accumulated, steps[i]])
                setActiveSteps(new Set(accumulated))
                timeoutRef.current = setTimeout(() => next(i + 1), STEP)
            }
            next(0)
        }

        const embed = () => {
            setCurrentDescription("embed")
            accumulated = new Set([...accumulated, "gemma"])
            setActiveSteps(new Set(accumulated))
            timeoutRef.current = setTimeout(() => {
                accumulated = new Set([...accumulated, "emb", "caption"])
                setActiveSteps(new Set(accumulated))
                timeoutRef.current = setTimeout(pkg, HOLD)
            }, STEP)
        }

        const pkg = () => {
            setCurrentDescription("package")
            accumulated = new Set([...accumulated, "jpeg", "chunk"])
            setActiveSteps(new Set(accumulated))
            timeoutRef.current = setTimeout(ship, HOLD)
        }

        const ship = () => {
            setCurrentDescription("ship")
            accumulated = new Set([...accumulated, "iroh"])
            setActiveSteps(new Set(accumulated))
            timeoutRef.current = setTimeout(disconnect, HOLD)
        }

        const disconnect = () => {
            setCurrentDescription("disconnect")
            setActiveSteps(new Set<FlowStep>(["chunk", "spool"]))
            timeoutRef.current = setTimeout(() => {
                setActiveSteps(new Set<FlowStep>(["spool", "iroh"]))
                timeoutRef.current = setTimeout(() => {
                    setActiveSteps(new Set())
                    setCurrentDescription("idle")
                    timeoutRef.current = setTimeout(() => {
                        setIsAnimating(false)
                        runAnimation()
                    }, IDLE)
                }, HOLD)
            }, HOLD)
        }

        capture()
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
                <svg viewBox="0 0 720 320" className="w-full h-auto">
                    {/* Section backgrounds */}
                    <rect x={10} y={25} width={165} height={180} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={195} y={25} width={200} height={260} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={415} y={25} width={170} height={180} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={605} y={25} width={105} height={260} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />

                    <text x={20} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>CAPTURE</text>
                    <text x={205} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>INFERENCE</text>
                    <text x={425} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>PACKAGE</text>
                    <text x={615} y={40} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>TRANSPORT</text>

                    {/* Capture → buffer */}
                    <Connection path="M 165 85 L 205 115" isActive={activeSteps.has("cam")} color="#22c55e" />
                    <Connection path="M 165 145 L 205 135" isActive={activeSteps.has("mic")} color="#22c55e" />

                    {/* Buffer → sample */}
                    <Connection path="M 295 145 L 295 170" isActive={activeSteps.has("sample")} color="#f59e0b" />

                    {/* Sample → Gemma */}
                    <Connection path="M 295 210 L 295 230" isActive={activeSteps.has("gemma")} color="#444ce7" />

                    {/* Gemma → Emb */}
                    <Connection path="M 380 245 Q 420 245 420 100" isActive={activeSteps.has("emb")} color="#8b5cf6" />

                    {/* Gemma → Caption */}
                    <Connection path="M 380 260 Q 420 260 420 160" isActive={activeSteps.has("caption")} color="#ec4899" />

                    {/* Sample → JPEG */}
                    <Connection path="M 380 185 L 425 185" isActive={activeSteps.has("jpeg")} color="#06b6d4" />

                    {/* Emb/Caption/JPEG → Chunk merged arrow (visual cue) */}
                    <Connection path="M 500 100 L 500 120" isActive={activeSteps.has("chunk")} color="#8b5cf6" />
                    <Connection path="M 500 180 L 500 130" isActive={activeSteps.has("chunk")} color="#06b6d4" />

                    {/* Chunk → iroh */}
                    <Connection path="M 505 135 L 615 135" isActive={activeSteps.has("iroh")} color="#22c55e" />

                    {/* iroh → spool (on disconnect, dashed down) */}
                    <Connection path="M 655 160 L 655 220" dashed isActive={activeSteps.has("spool")} color="#ef4444" />

                    {/* spool → iroh (on reconnect, dashed up) */}
                    <Connection path="M 670 220 L 670 160" dashed isActive={activeSteps.has("spool") && activeSteps.has("iroh")} color="#ef4444" />

                    {/* Capture nodes */}
                    <Node x={20} y={65} width={140} height={40} label="Webcam" sublabel="1080p @ 15fps" color="#22c55e" isActive={activeSteps.has("cam")} />
                    <Node x={20} y={125} width={140} height={40} label="Microphone" sublabel="16kHz mono" color="#22c55e" isActive={activeSteps.has("mic")} />

                    {/* Buffer + sampler */}
                    <Node x={205} y={105} width={180} height={40} label="Frame buffer" sublabel="10s sliding window" color="#f59e0b" isActive={activeSteps.has("buffer")} />
                    <Node x={205} y={170} width={180} height={40} label="Sample K frames" sublabel="every 5s + audio segment" color="#f59e0b" isActive={activeSteps.has("sample")} />
                    <Node x={205} y={230} width={180} height={40} label="Gemma 4 · Cactus" sublabel="vision + audio tower" color="#444ce7" isActive={activeSteps.has("gemma")} />

                    {/* Package nodes */}
                    <Node x={425} y={60} width={135} height={40} label="Embedding" sublabel="L2-normalized" color="#8b5cf6" isActive={activeSteps.has("emb")} />
                    <Node x={425} y={120} width={135} height={40} label="Chunk" sublabel="{emb, caption, jpeg}" color="#8b5cf6" isActive={activeSteps.has("chunk")} />
                    <Node x={425} y={165} width={135} height={40} label="JPEG q60" sublabel="middle frame" color="#06b6d4" isActive={activeSteps.has("jpeg")} />

                    {/* Transport nodes */}
                    <Node x={615} y={115} width={85} height={40} label="iroh QUIC" sublabel="ingest/v1" color="#22c55e" isActive={activeSteps.has("iroh")} />
                    <Node x={615} y={220} width={85} height={40} label="Disk spool" sublabel="ring buffer" color="#ef4444" isActive={activeSteps.has("spool")} />

                    {/* Legend */}
                    <g transform="translate(20, 260)">
                        <circle cx={0} cy={0} r={4} fill="#22c55e" />
                        <text x={8} y={3} fill="#6b7280" fontSize={8}>Capture</text>
                        <circle cx={70} cy={0} r={4} fill="#444ce7" />
                        <text x={78} y={3} fill="#6b7280" fontSize={8}>Inference</text>
                        <circle cx={20} cy={14} r={4} fill="#8b5cf6" />
                        <text x={28} y={17} fill="#6b7280" fontSize={8}>Vector</text>
                        <circle cx={90} cy={14} r={4} fill="#ef4444" />
                        <text x={98} y={17} fill="#6b7280" fontSize={8}>Spool</text>
                    </g>
                </svg>
            </div>

            <div className="px-5 py-3 bg-[#0a0a10] border-t border-[#1a1a24] flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activeSteps.size === 0 ? "bg-zinc-600" : "bg-[#8b5cf6] animate-pulse"}`} />
                <span className="text-sm text-zinc-400">{stepDescriptions[currentDescription]}</span>
            </div>
        </div>
    )
}
