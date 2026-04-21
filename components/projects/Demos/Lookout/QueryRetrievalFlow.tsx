"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

type FlowStep =
    | "query"
    | "embed"
    | "ann_v"
    | "ann_a"
    | "ann_c"
    | "rrf"
    | "topk"
    | "llm"
    | "answer"
    | "playback"

type DescriptionKey = "idle" | "embed" | "retrieve" | "fuse" | "synth" | "cite"

const stepDescriptions: Record<DescriptionKey, string> = {
    idle: "Natural-language retrieval — per-modality ANN + RRF + on-device synthesis",
    embed: "Query embedded with the same Gemma / Cactus stack (text-only mode)",
    retrieve: "Parallel ANN search across video, audio, and caption collections",
    fuse: "Reciprocal Rank Fusion merges the three ranked lists",
    synth: "Top-K + metadata fed to Gemma 4 for cited answer synthesis",
    cite: "Answer returned with per-camera timestamps — clips pullable on click",
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
                    initial={{ opacity: 0 }} animate={{ opacity: [0.25, 0.7, 0.25] }}
                    transition={{ duration: 1.5, repeat: Infinity }} />
            )}
            <rect x={x} y={y} width={width} height={height} rx={9}
                fill="#0c0c14"
                stroke={isActive ? color : "#1f1f2e"}
                strokeWidth={isActive ? 1.8 : 1} />
            <rect x={x} y={y} width={5} height={height} rx={2.5}
                fill={color} opacity={isActive ? 1 : 0.35} />
            <text x={x + 16} y={y + (sublabel ? 22 : height / 2 + 5)}
                fill={isActive ? "white" : "#d4d4e0"}
                fontSize={13} fontWeight={600}
                fontFamily="system-ui, sans-serif">
                {label}
            </text>
            {sublabel && (
                <text x={x + 16} y={y + 40}
                    fill={isActive ? color : "#6b7280"}
                    fontSize={11}
                    fontFamily="ui-monospace, monospace">
                    {sublabel}
                </text>
            )}
        </g>
    )
}

function Connection({ path, isActive, color, dashed = false, thick = false }: {
    path: string; isActive: boolean; color: string; dashed?: boolean; thick?: boolean
}) {
    const w = thick ? 2.5 : 2
    return (
        <g>
            <path d={path} fill="none" stroke="#1a1a28" strokeWidth={w}
                strokeLinecap="round"
                strokeDasharray={dashed ? "6 5" : undefined} />
            {isActive && (
                <>
                    <motion.path d={path} fill="none" stroke={color} strokeWidth={w}
                        strokeLinecap="round"
                        strokeDasharray={dashed ? "6 5" : undefined}
                        initial={{ pathLength: 0, opacity: 0.5 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }} />
                    <motion.circle r={5} fill={color}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}>
                        <animateMotion dur="1.3s" repeatCount="indefinite"
                            path={path} keyPoints="0;1" keyTimes="0;1"
                            calcMode="spline" keySplines="0.4 0 0.2 1" />
                    </motion.circle>
                </>
            )}
        </g>
    )
}

export function QueryRetrievalFlow() {
    const [activeSteps, setActiveSteps] = useState<Set<FlowStep>>(new Set())
    const [currentDescription, setCurrentDescription] = useState<DescriptionKey>("idle")
    const [isAnimating, setIsAnimating] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const STEP = 750
    const HOLD = 1700
    const IDLE = 1400

    const runAnimation = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)
        let accumulated = new Set<FlowStep>()

        const embedPhase = () => {
            setCurrentDescription("embed")
            accumulated = new Set<FlowStep>(["query"])
            setActiveSteps(new Set(accumulated))
            timeoutRef.current = setTimeout(() => {
                accumulated = new Set([...accumulated, "embed"])
                setActiveSteps(new Set(accumulated))
                timeoutRef.current = setTimeout(retrievePhase, HOLD)
            }, STEP)
        }

        const retrievePhase = () => {
            setCurrentDescription("retrieve")
            accumulated = new Set([...accumulated, "ann_v", "ann_a", "ann_c"])
            setActiveSteps(new Set(accumulated))
            timeoutRef.current = setTimeout(fusePhase, HOLD)
        }

        const fusePhase = () => {
            setCurrentDescription("fuse")
            accumulated = new Set([...accumulated, "rrf", "topk"])
            setActiveSteps(new Set(accumulated))
            timeoutRef.current = setTimeout(synthPhase, HOLD)
        }

        const synthPhase = () => {
            setCurrentDescription("synth")
            accumulated = new Set([...accumulated, "llm"])
            setActiveSteps(new Set(accumulated))
            timeoutRef.current = setTimeout(citePhase, HOLD)
        }

        const citePhase = () => {
            setCurrentDescription("cite")
            accumulated = new Set([...accumulated, "answer", "playback"])
            setActiveSteps(new Set(accumulated))
            timeoutRef.current = setTimeout(() => {
                setActiveSteps(new Set())
                setCurrentDescription("idle")
                timeoutRef.current = setTimeout(() => {
                    setIsAnimating(false)
                    runAnimation()
                }, IDLE)
            }, HOLD)
        }

        embedPhase()
    }, [isAnimating])

    useEffect(() => {
        const t = setTimeout(() => runAnimation(), 600)
        return () => {
            clearTimeout(t)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    // Canvas layout (generous padding + larger nodes)
    const W = 940, H = 440

    // Column X anchors (left edge of each column band)
    const COLS = {
        q: { x: 20, w: 210 },
        ann: { x: 260, w: 240 },
        fuse: { x: 530, w: 170 },
        syn: { x: 730, w: 190 },
    }

    // Node metrics
    const NODE_H = 56

    // Vertical positions for nodes
    const queryY = 90
    const embedY = 190

    const annVY = 80
    const annAY = 180
    const annCY = 280

    const rrfY = 145
    const topKY = 240

    const llmY = 110
    const answerY = 215
    const playbackY = 320

    // Node midpoints (for routing)
    const midY = (y: number) => y + NODE_H / 2

    // Key points
    const embedRight = COLS.q.x + COLS.q.w
    const annLeft = COLS.ann.x
    const annRight = COLS.ann.x + COLS.ann.w
    const fuseLeft = COLS.fuse.x
    const fuseRight = COLS.fuse.x + COLS.fuse.w
    const synLeft = COLS.syn.x

    return (
        <div className="w-full bg-[#08080c] rounded-2xl border border-[#1a1a24] overflow-hidden">
            <div className="p-4">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                    {/* Column bands */}
                    {([
                        { key: "q", title: "QUERY" },
                        { key: "ann", title: "PER-MODALITY ANN" },
                        { key: "fuse", title: "FUSION" },
                        { key: "syn", title: "SYNTHESIS" },
                    ] as { key: keyof typeof COLS; title: string }[]).map(({ key, title }) => {
                        const c = COLS[key]
                        return (
                            <g key={key}>
                                <rect x={c.x} y={40} width={c.w} height={H - 60} rx={12}
                                    fill="#0a0a12" stroke="#15152a" strokeDasharray="4 4" />
                                <text x={c.x + 14} y={60} fill="#3f3f5a"
                                    fontSize={11} fontWeight={700} letterSpacing={1.2}
                                    fontFamily="system-ui, sans-serif">{title}</text>
                            </g>
                        )
                    })}

                    {/* Query → Embed (vertical inside query column) */}
                    <Connection
                        path={`M ${COLS.q.x + 100} ${queryY + NODE_H} L ${COLS.q.x + 100} ${embedY}`}
                        isActive={activeSteps.has("embed")} color="#f59e0b" thick />

                    {/* Embed → ANN (fan-out to 3 lanes) */}
                    <Connection
                        path={`M ${embedRight} ${midY(embedY)} C ${(embedRight + annLeft) / 2} ${midY(embedY)}, ${(embedRight + annLeft) / 2} ${midY(annVY)}, ${annLeft} ${midY(annVY)}`}
                        isActive={activeSteps.has("ann_v")} color="#8b5cf6" thick />
                    <Connection
                        path={`M ${embedRight} ${midY(embedY)} L ${annLeft} ${midY(annAY)}`}
                        isActive={activeSteps.has("ann_a")} color="#ec4899" thick />
                    <Connection
                        path={`M ${embedRight} ${midY(embedY)} C ${(embedRight + annLeft) / 2} ${midY(embedY)}, ${(embedRight + annLeft) / 2} ${midY(annCY)}, ${annLeft} ${midY(annCY)}`}
                        isActive={activeSteps.has("ann_c")} color="#06b6d4" thick />

                    {/* ANN → RRF (fan-in) */}
                    <Connection
                        path={`M ${annRight} ${midY(annVY)} C ${(annRight + fuseLeft) / 2} ${midY(annVY)}, ${(annRight + fuseLeft) / 2} ${midY(rrfY)}, ${fuseLeft} ${midY(rrfY)}`}
                        isActive={activeSteps.has("rrf")} color="#8b5cf6" />
                    <Connection
                        path={`M ${annRight} ${midY(annAY)} L ${fuseLeft} ${midY(rrfY)}`}
                        isActive={activeSteps.has("rrf")} color="#ec4899" />
                    <Connection
                        path={`M ${annRight} ${midY(annCY)} C ${(annRight + fuseLeft) / 2} ${midY(annCY)}, ${(annRight + fuseLeft) / 2} ${midY(rrfY)}, ${fuseLeft} ${midY(rrfY)}`}
                        isActive={activeSteps.has("rrf")} color="#06b6d4" />

                    {/* RRF → TopK (down) */}
                    <Connection
                        path={`M ${COLS.fuse.x + COLS.fuse.w / 2} ${rrfY + NODE_H} L ${COLS.fuse.x + COLS.fuse.w / 2} ${topKY}`}
                        isActive={activeSteps.has("topk")} color="#22c55e" thick />

                    {/* TopK → LLM */}
                    <Connection
                        path={`M ${fuseRight} ${midY(topKY)} C ${(fuseRight + synLeft) / 2} ${midY(topKY)}, ${(fuseRight + synLeft) / 2} ${midY(llmY)}, ${synLeft} ${midY(llmY)}`}
                        isActive={activeSteps.has("llm")} color="#444ce7" thick />

                    {/* LLM → Answer */}
                    <Connection
                        path={`M ${COLS.syn.x + COLS.syn.w / 2} ${llmY + NODE_H} L ${COLS.syn.x + COLS.syn.w / 2} ${answerY}`}
                        isActive={activeSteps.has("answer")} color="#444ce7" thick />

                    {/* TopK → Playback (dashed, on-demand) */}
                    <Connection
                        path={`M ${fuseRight} ${midY(topKY)} C ${(fuseRight + synLeft) / 2 + 10} ${midY(topKY) + 40}, ${(fuseRight + synLeft) / 2 + 10} ${midY(playbackY)}, ${synLeft} ${midY(playbackY)}`}
                        dashed isActive={activeSteps.has("playback")} color="#06b6d4" />

                    {/* Nodes — QUERY column */}
                    <Node x={COLS.q.x + 16} y={queryY} width={COLS.q.w - 32} height={NODE_H}
                        label="Operator question"
                        sublabel={`"when did the package arrive?"`}
                        color="#f59e0b" isActive={activeSteps.has("query")} />
                    <Node x={COLS.q.x + 16} y={embedY} width={COLS.q.w - 32} height={NODE_H}
                        label="Embed query"
                        sublabel="Gemma 4 · text-only"
                        color="#444ce7" isActive={activeSteps.has("embed")} />

                    {/* Nodes — ANN column */}
                    <Node x={COLS.ann.x + 16} y={annVY} width={COLS.ann.w - 32} height={NODE_H}
                        label="ANN · video_clips"
                        sublabel="filter: camera / time"
                        color="#8b5cf6" isActive={activeSteps.has("ann_v")} />
                    <Node x={COLS.ann.x + 16} y={annAY} width={COLS.ann.w - 32} height={NODE_H}
                        label="ANN · audio_clips"
                        sublabel="dense audio vectors"
                        color="#ec4899" isActive={activeSteps.has("ann_a")} />
                    <Node x={COLS.ann.x + 16} y={annCY} width={COLS.ann.w - 32} height={NODE_H}
                        label="ANN · captions"
                        sublabel="sparse text match"
                        color="#06b6d4" isActive={activeSteps.has("ann_c")} />

                    {/* Nodes — FUSION column */}
                    <Node x={COLS.fuse.x + 16} y={rrfY} width={COLS.fuse.w - 32} height={NODE_H}
                        label="RRF"
                        sublabel="rank fusion"
                        color="#22c55e" isActive={activeSteps.has("rrf")} />
                    <Node x={COLS.fuse.x + 16} y={topKY} width={COLS.fuse.w - 32} height={NODE_H}
                        label="Top-K chunks"
                        sublabel="+ metadata"
                        color="#22c55e" isActive={activeSteps.has("topk")} />

                    {/* Nodes — SYNTHESIS column */}
                    <Node x={COLS.syn.x + 16} y={llmY} width={COLS.syn.w - 32} height={NODE_H}
                        label="Gemma 4 · Cactus"
                        sublabel="on-device synthesis"
                        color="#444ce7" isActive={activeSteps.has("llm")} />
                    <Node x={COLS.syn.x + 16} y={answerY} width={COLS.syn.w - 32} height={NODE_H}
                        label="Answer + citations"
                        sublabel="cam-door @ 14:03 …"
                        color="#444ce7" isActive={activeSteps.has("answer")} />
                    <Node x={COLS.syn.x + 16} y={playbackY} width={COLS.syn.w - 32} height={NODE_H}
                        label="Clip playback"
                        sublabel="iroh pull on click"
                        color="#06b6d4" isActive={activeSteps.has("playback")} />

                    {/* Legend */}
                    <g transform={`translate(${COLS.q.x + 16}, ${H - 28})`}>
                        <circle cx={5} cy={5} r={5} fill="#8b5cf6" />
                        <text x={16} y={9} fill="#a3a3b0" fontSize={11}
                            fontFamily="system-ui, sans-serif">Video</text>
                        <circle cx={75} cy={5} r={5} fill="#ec4899" />
                        <text x={86} y={9} fill="#a3a3b0" fontSize={11}
                            fontFamily="system-ui, sans-serif">Audio</text>
                        <circle cx={145} cy={5} r={5} fill="#06b6d4" />
                        <text x={156} y={9} fill="#a3a3b0" fontSize={11}
                            fontFamily="system-ui, sans-serif">Caption</text>
                    </g>
                </svg>
            </div>

            <div className="px-5 py-3 bg-[#0a0a10] border-t border-[#1a1a24] flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activeSteps.size === 0 ? "bg-zinc-600" : "bg-[#444ce7] animate-pulse"}`} />
                <span className="text-sm text-zinc-400">{stepDescriptions[currentDescription]}</span>
            </div>
        </div>
    )
}
