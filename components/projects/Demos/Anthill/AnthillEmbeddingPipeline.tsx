"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

type FlowStep = "arxiv" | "pdf" | "extract" | "chunk" | "harrier" | "vector" | "chroma" | "query"
type DescKey = "idle" | "ingest" | "embed" | "store" | "query"

const desc: Record<DescKey, string> = {
    idle: "Local cs.AI corpus · ~1k papers · embed once, query a thousand times",
    ingest: "arXiv API + resumable downloader → datasets/papers.json",
    embed: "PyMuPDF text → 512-word windows / 64-word overlap → Harrier 270M (one chunk at a time — llama.cpp's batched path errors on this model)",
    store: "L2-normalized vectors land in Chroma with (arxiv_id, chunk_index, char_start, char_end)",
    query: "Live query path uses the same Harrier with the 'Instruct: ...\\nQuery: ' prefix",
}

function Box({ x, y, w, h, label, sublabel, color, active, mono }: {
    x: number; y: number; w: number; h: number; label: string; sublabel?: string;
    color: string; active: boolean; mono?: boolean;
}) {
    return (
        <g>
            {active && (
                <motion.rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx={11}
                    fill="none" stroke={color} strokeWidth={2}
                    initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }} />
            )}
            <rect x={x} y={y} width={w} height={h} rx={8}
                fill="#0c0c14" stroke={active ? color : "#1f1f2e"} strokeWidth={active ? 2 : 1} />
            <rect x={x} y={y} width={4} height={h} rx={2} fill={color} opacity={active ? 1 : 0.3} />
            <text x={x + 14} y={y + (sublabel ? h / 2 - 4 : h / 2)}
                fill="white" fontSize={11} fontWeight={600}
                fontFamily={mono ? "ui-monospace, monospace" : "system-ui, sans-serif"}
                dominantBaseline={sublabel ? "auto" : "middle"}>{label}</text>
            {sublabel && (
                <text x={x + 14} y={y + h / 2 + 10} fill="#6b7280" fontSize={9}
                    fontFamily="system-ui, sans-serif">{sublabel}</text>
            )}
        </g>
    )
}

function Arrow({ path, active, color, dashed = false }: {
    path: string; active: boolean; color: string; dashed?: boolean;
}) {
    return (
        <g>
            <path d={path} fill="none" stroke="#1a1a28" strokeWidth={2}
                strokeLinecap="round" strokeDasharray={dashed ? "4 4" : undefined} />
            {active && (
                <>
                    <motion.path d={path} fill="none" stroke={color} strokeWidth={2}
                        strokeLinecap="round" strokeDasharray={dashed ? "4 4" : undefined}
                        initial={{ pathLength: 0, opacity: 0.5 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }} />
                    <motion.circle r={4} fill={color}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}>
                        <animateMotion dur="1.2s" repeatCount="indefinite" path={path}
                            keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
                    </motion.circle>
                </>
            )}
        </g>
    )
}

export function AnthillEmbeddingPipeline() {
    const [active, setActive] = useState<Set<FlowStep>>(new Set())
    const [d, setD] = useState<DescKey>("idle")
    const [running, setRunning] = useState(false)
    const t = useRef<NodeJS.Timeout | null>(null)

    const STEP = 600
    const HOLD = 1300
    const IDLE = 1100

    const run = useCallback(() => {
        if (running) return
        setRunning(true)
        const set = (s: FlowStep[]) => setActive(new Set(s))

        const ingest = () => {
            setD("ingest")
            set(["arxiv"])
            t.current = setTimeout(() => {
                set(["arxiv", "pdf"])
                t.current = setTimeout(embed, STEP)
            }, STEP)
        }
        const embed = () => {
            setD("embed")
            set(["pdf", "extract"])
            t.current = setTimeout(() => {
                set(["pdf", "extract", "chunk"])
                t.current = setTimeout(() => {
                    set(["chunk", "harrier"])
                    t.current = setTimeout(store, HOLD)
                }, STEP)
            }, STEP)
        }
        const store = () => {
            setD("store")
            set(["harrier", "vector"])
            t.current = setTimeout(() => {
                set(["harrier", "vector", "chroma"])
                t.current = setTimeout(query, HOLD)
            }, STEP)
        }
        const query = () => {
            setD("query")
            set(["query", "harrier", "chroma"])
            t.current = setTimeout(() => {
                setActive(new Set())
                setD("idle")
                t.current = setTimeout(() => { setRunning(false); run() }, IDLE)
            }, HOLD)
        }
        ingest()
    }, [running])

    useEffect(() => {
        const x = setTimeout(() => run(), 600)
        return () => { clearTimeout(x); if (t.current) clearTimeout(t.current) }
    }, [])

    return (
        <div className="w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs not-prose">
            <div className="p-4 bg-[#08080c] dark:bg-[#08080c]">
                <svg viewBox="0 0 760 260" className="w-full h-auto">
                    <text x={20} y={32} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>INDEX-TIME</text>
                    <text x={595} y={32} fill="#3f3f5a" fontSize={9} fontWeight={600} letterSpacing={0.8}>QUERY-TIME</text>

                    {/* Flow */}
                    <Arrow path="M 130 95 L 165 95" active={active.has("arxiv") && active.has("pdf")} color="#22c55e" />
                    <Arrow path="M 280 95 L 315 95" active={active.has("pdf") && active.has("extract")} color="#22c55e" />
                    <Arrow path="M 415 95 L 450 95" active={active.has("extract") && active.has("chunk")} color="#f59e0b" />
                    <Arrow path="M 560 95 L 595 95" active={active.has("chunk") && active.has("harrier")} color="#444ce7" />

                    {/* Harrier → vector */}
                    <Arrow path="M 660 120 L 660 165" active={active.has("harrier") && active.has("vector")} color="#8b5cf6" />
                    {/* vector → chroma */}
                    <Arrow path="M 595 195 L 480 195" active={active.has("vector") && active.has("chroma")} color="#a855f7" />

                    {/* Query path (dashed up) */}
                    <Arrow path="M 95 195 L 95 120" dashed active={active.has("query")} color="#06b6d4" />
                    <Arrow path="M 165 195 L 595 195" dashed active={active.has("query") && active.has("chroma")} color="#06b6d4" />
                    <Arrow path="M 660 175 L 660 120" dashed active={active.has("query") && active.has("harrier")} color="#06b6d4" />

                    {/* Boxes */}
                    <Box x={20} y={75} w={110} h={40}
                        label="arXiv API" sublabel="cs.AI / cs.IR" color="#22c55e" active={active.has("arxiv")} />
                    <Box x={165} y={75} w={115} h={40}
                        label="PDF + meta" sublabel="OpenAlex" color="#22c55e" active={active.has("pdf")} />
                    <Box x={315} y={75} w={100} h={40}
                        label="PyMuPDF" sublabel="char offsets" color="#f59e0b" active={active.has("extract")} />
                    <Box x={450} y={75} w={110} h={40}
                        label="512-word win" sublabel="64 overlap" color="#f59e0b" active={active.has("chunk")} />
                    <Box x={595} y={75} w={130} h={45}
                        label="Harrier 270M" sublabel="one chunk at a time" color="#444ce7" active={active.has("harrier")} />
                    <Box x={595} y={165} w={130} h={40}
                        label="L2-norm vector" sublabel="(id, chunk, span)" color="#8b5cf6" active={active.has("vector")} />
                    <Box x={355} y={175} w={125} h={40}
                        label="ChromaDB" sublabel="papers collection" color="#a855f7" active={active.has("chroma")} />
                    <Box x={20} y={175} w={145} h={40}
                        label="User query" sublabel='Instruct: ... Query:' color="#06b6d4" active={active.has("query")} mono />

                    {/* Legend */}
                    <g transform="translate(20, 235)">
                        <circle cx={0} cy={0} r={4} fill="#22c55e" />
                        <text x={8} y={3} fill="#6b7280" fontSize={9}>Fetch</text>
                        <circle cx={55} cy={0} r={4} fill="#f59e0b" />
                        <text x={63} y={3} fill="#6b7280" fontSize={9}>Chunk</text>
                        <circle cx={115} cy={0} r={4} fill="#444ce7" />
                        <text x={123} y={3} fill="#6b7280" fontSize={9}>Embed (Harrier)</text>
                        <circle cx={235} cy={0} r={4} fill="#a855f7" />
                        <text x={243} y={3} fill="#6b7280" fontSize={9}>Store</text>
                        <circle cx={285} cy={0} r={4} fill="#06b6d4" />
                        <text x={293} y={3} fill="#6b7280" fontSize={9}>Query</text>
                    </g>
                </svg>
            </div>
            <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-3">
                <div className={`size-1.5 rounded-full ${active.size === 0 ? "bg-muted-foreground" : "bg-blue-500 animate-pulse"}`} />
                <span className="text-xs text-muted-foreground">{desc[d]}</span>
            </div>
        </div>
    )
}
