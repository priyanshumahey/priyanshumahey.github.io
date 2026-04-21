"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

// A stylised 2D projection of the embedding space. Each point is a video
// chunk from one of four cameras. Preset queries move a cursor vector into
// different regions and we highlight the Top-K neighbours the same way the
// leader does at runtime (ANN per modality → RRF → LLM).

type Camera = "cam-lab-1" | "cam-lab-2" | "cam-door" | "cam-hall"

const CAMERA_META: Record<Camera, { label: string; color: string }> = {
    "cam-lab-1": { label: "cam-lab-1", color: "#22c55e" },
    "cam-lab-2": { label: "cam-lab-2", color: "#06b6d4" },
    "cam-door": { label: "cam-door", color: "#f59e0b" },
    "cam-hall": { label: "cam-hall", color: "#ec4899" },
}

interface Chunk {
    id: string
    camera: Camera
    x: number // 0..1
    y: number // 0..1
    caption: string
    ts: string // HH:MM
}

// Clusters are placed in rough 2D regions so the "nearest-neighbour" lookup
// is visually meaningful. Tag each cluster with a descriptive caption.
const CHUNKS: Chunk[] = [
    // Cluster: package delivery @ door
    { id: "c1", camera: "cam-door", x: 0.18, y: 0.24, caption: "Courier places a brown box on the porch", ts: "14:03" },
    { id: "c2", camera: "cam-door", x: 0.22, y: 0.19, caption: "Package left on doorstep, van leaves frame", ts: "14:04" },
    { id: "c3", camera: "cam-door", x: 0.14, y: 0.30, caption: "Person in uniform rings the doorbell", ts: "14:02" },
    { id: "c4", camera: "cam-hall", x: 0.27, y: 0.27, caption: "Dog barks toward the front door", ts: "14:03" },

    // Cluster: person with red backpack
    { id: "c5", camera: "cam-hall", x: 0.72, y: 0.20, caption: "Tall person with red backpack walks past hallway", ts: "09:12" },
    { id: "c6", camera: "cam-lab-2", x: 0.78, y: 0.26, caption: "Red backpack set down near whiteboard", ts: "09:14" },
    { id: "c7", camera: "cam-lab-2", x: 0.82, y: 0.18, caption: "Red bag visible on desk, person seated", ts: "09:18" },
    { id: "c8", camera: "cam-hall", x: 0.68, y: 0.30, caption: "Same red backpack leaves hallway frame", ts: "11:47" },

    // Cluster: lab access 15:00-17:00
    { id: "c9", camera: "cam-lab-1", x: 0.28, y: 0.72, caption: "Two researchers enter the lab, lights on", ts: "15:04" },
    { id: "c10", camera: "cam-lab-1", x: 0.22, y: 0.78, caption: "Badge swipe audible, lab door opens", ts: "15:41" },
    { id: "c11", camera: "cam-lab-2", x: 0.32, y: 0.82, caption: "Person at workstation adjusts monitor", ts: "16:02" },
    { id: "c12", camera: "cam-lab-1", x: 0.18, y: 0.68, caption: "Researcher exits lab with notebook", ts: "16:53" },

    // Cluster: equipment / robotics
    { id: "c13", camera: "cam-lab-2", x: 0.78, y: 0.72, caption: "Robotic arm picks up a cube from table", ts: "13:20" },
    { id: "c14", camera: "cam-lab-2", x: 0.82, y: 0.78, caption: "Arm retracts, gripper closes", ts: "13:21" },
    { id: "c15", camera: "cam-lab-1", x: 0.72, y: 0.80, caption: "Operator calibrates arm joints", ts: "13:15" },

    // Scatter / background
    { id: "c16", camera: "cam-hall", x: 0.48, y: 0.12, caption: "Empty hallway, fluorescent flicker", ts: "03:10" },
    { id: "c17", camera: "cam-lab-1", x: 0.52, y: 0.50, caption: "Lab lights off, motion-sensor blink", ts: "22:40" },
    { id: "c18", camera: "cam-door", x: 0.46, y: 0.88, caption: "Wind blows leaves across porch", ts: "05:20" },
    { id: "c19", camera: "cam-door", x: 0.55, y: 0.40, caption: "Neighbour's cat crosses driveway", ts: "07:55" },
    { id: "c20", camera: "cam-lab-2", x: 0.58, y: 0.60, caption: "Server fans spin up, cooling cycle", ts: "02:15" },
]

interface Query {
    id: string
    label: string
    text: string
    // Target point in the 2D embedding space
    qx: number
    qy: number
    // Top results to cite in the answer (ordered by RRF)
    cite: string[]
    answer: string
}

const QUERIES: Query[] = [
    {
        id: "package",
        label: "when did the package arrive?",
        text: "when did the package arrive today?",
        qx: 0.2, qy: 0.24,
        cite: ["c2", "c1", "c3"],
        answer: "Delivered to the porch at 14:03 (cam-door). Courier rang the bell at 14:02 and the van left after 14:04.",
    },
    {
        id: "backpack",
        label: "which camera saw the red backpack?",
        text: "which camera last saw the red backpack?",
        qx: 0.78, qy: 0.22,
        cite: ["c8", "c5", "c6"],
        answer: "Last seen leaving the hallway at 11:47 (cam-hall). Earlier sightings on cam-lab-2 around 09:14–09:18.",
    },
    {
        id: "lab",
        label: "who entered the lab between 3–5 pm?",
        text: "did anyone enter the lab between 15:00 and 17:00?",
        qx: 0.26, qy: 0.76,
        cite: ["c9", "c10", "c11"],
        answer: "Two researchers entered at 15:04 (cam-lab-1), a badge swipe at 15:41, and someone at a workstation at 16:02 (cam-lab-2).",
    },
    {
        id: "robot",
        label: "summarise the robot arm at 13:20",
        text: "what did the robotic arm do around 13:20?",
        qx: 0.8, qy: 0.76,
        cite: ["c13", "c14", "c15"],
        answer: "Arm picked up a cube at 13:20 (cam-lab-2), gripper closed at 13:21. Operator was calibrating joints from 13:15.",
    },
]

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
    const dx = a.x - b.x, dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
}

export function EmbeddingSpaceDemo() {
    const [activeId, setActiveId] = useState<string>("package")
    const [phase, setPhase] = useState<"idle" | "embed" | "retrieve" | "fuse" | "answer">("idle")

    const query = useMemo(() => QUERIES.find((q) => q.id === activeId)!, [activeId])

    // Top-K by distance to the query point, then override with curated cite
    // order (this is what the RRF + Gemma synthesis would produce).
    const ranked = useMemo(() => {
        const withDist = CHUNKS.map((c) => ({ c, d: distance(c, { x: query.qx, y: query.qy }) }))
        withDist.sort((a, b) => a.d - b.d)
        const topK = withDist.slice(0, 6).map((x) => x.c)
        // Lift the curated citations to the front in curated order
        const citeSet = new Set(query.cite)
        const front = query.cite
            .map((id) => topK.find((c) => c.id === id) ?? CHUNKS.find((c) => c.id === id)!)
        const rest = topK.filter((c) => !citeSet.has(c.id))
        return [...front, ...rest].slice(0, 5)
    }, [query])

    // Animate phases when query changes
    useEffect(() => {
        setPhase("embed")
        const t1 = setTimeout(() => setPhase("retrieve"), 500)
        const t2 = setTimeout(() => setPhase("fuse"), 1300)
        const t3 = setTimeout(() => setPhase("answer"), 2000)
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }, [activeId])

    const W = 520, H = 340
    const PAD = 24

    const px = (nx: number) => PAD + nx * (W - 2 * PAD)
    const py = (ny: number) => PAD + ny * (H - 2 * PAD)

    const showQuery = phase !== "idle"
    const showNeighbours = phase === "retrieve" || phase === "fuse" || phase === "answer"
    const showAnswer = phase === "answer"

    return (
        <div className="w-full bg-[#08080c] rounded-2xl border border-[#1a1a24] overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 px-4 pt-4">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 mr-2">Try a query</span>
                {QUERIES.map((q) => (
                    <button
                        key={q.id}
                        onClick={() => setActiveId(q.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeId === q.id
                            ? "bg-[#1a1a2e] border-[#444ce7] text-white"
                            : "bg-transparent border-[#1f1f2e] text-zinc-400 hover:text-white hover:border-[#2a2a40]"
                            }`}
                    >
                        {q.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-0 p-4">
                {/* Scatter plot */}
                <div className="relative">
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                        {/* Grid */}
                        <defs>
                            <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
                                <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#11111e" strokeWidth="1" />
                            </pattern>
                            <radialGradient id="queryGlow">
                                <stop offset="0%" stopColor="#444ce7" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#444ce7" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <rect x={0} y={0} width={W} height={H} fill="url(#grid)" />
                        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} fill="none" stroke="#15152a" rx={10} />

                        {/* Axis labels */}
                        <text x={10} y={H - 8} fill="#2f2f46" fontSize={9} fontFamily="monospace">pca(video ⊕ audio)</text>
                        <text x={W - 70} y={14} fill="#2f2f46" fontSize={9} fontFamily="monospace">ChromaDB</text>

                        {/* Top-K connector lines */}
                        {showNeighbours && ranked.map((c, i) => (
                            <motion.line
                                key={`l-${c.id}`}
                                x1={px(query.qx)} y1={py(query.qy)}
                                x2={px(c.x)} y2={py(c.y)}
                                stroke={CAMERA_META[c.camera].color}
                                strokeWidth={1.2}
                                strokeDasharray="3 3"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.7 - i * 0.1 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                            />
                        ))}

                        {/* Data points */}
                        {CHUNKS.map((c) => {
                            const meta = CAMERA_META[c.camera]
                            const isCited = ranked.some((r) => r.id === c.id) && showNeighbours
                            return (
                                <g key={c.id}>
                                    <circle
                                        cx={px(c.x)} cy={py(c.y)} r={isCited ? 6 : 3.5}
                                        fill={meta.color}
                                        fillOpacity={isCited ? 1 : 0.35}
                                        stroke={isCited ? "#fff" : "none"}
                                        strokeWidth={isCited ? 1 : 0}
                                    />
                                    {isCited && (
                                        <motion.circle
                                            cx={px(c.x)} cy={py(c.y)} r={10}
                                            fill="none" stroke={meta.color} strokeWidth={1}
                                            initial={{ opacity: 0, r: 6 }}
                                            animate={{ opacity: [0.6, 0], r: 18 }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    )}
                                </g>
                            )
                        })}

                        {/* Query vector */}
                        {showQuery && (
                            <motion.g
                                key={query.id}
                                initial={{ opacity: 0, scale: 0.4 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <circle cx={px(query.qx)} cy={py(query.qy)} r={28} fill="url(#queryGlow)" />
                                <circle cx={px(query.qx)} cy={py(query.qy)} r={6} fill="#444ce7" stroke="#fff" strokeWidth={1.5} />
                                <text x={px(query.qx) + 12} y={py(query.qy) - 10} fill="#fff" fontSize={10} fontWeight={600} fontFamily="system-ui, sans-serif">q</text>
                            </motion.g>
                        )}

                        {/* Legend */}
                        <g transform={`translate(${W - 120}, ${H - 60})`}>
                            {(Object.keys(CAMERA_META) as Camera[]).map((k, i) => (
                                <g key={k} transform={`translate(0, ${i * 12})`}>
                                    <circle cx={4} cy={4} r={3} fill={CAMERA_META[k].color} />
                                    <text x={12} y={7} fill="#6b7280" fontSize={8} fontFamily="monospace">{CAMERA_META[k].label}</text>
                                </g>
                            ))}
                        </g>
                    </svg>
                </div>

                {/* Citations + synthesised answer */}
                <div className="md:pl-4 md:border-l md:border-[#15152a] flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2 h-2 rounded-full ${phase === "idle" ? "bg-zinc-600" :
                            phase === "embed" ? "bg-[#f59e0b] animate-pulse" :
                                phase === "retrieve" ? "bg-[#8b5cf6] animate-pulse" :
                                    phase === "fuse" ? "bg-[#22c55e] animate-pulse" :
                                        "bg-[#444ce7]"
                            }`} />
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                            {phase === "embed" ? "embedding query" :
                                phase === "retrieve" ? "ann + per-modality" :
                                    phase === "fuse" ? "reciprocal rank fusion" :
                                        phase === "answer" ? "gemma synthesis" : "idle"}
                        </span>
                    </div>

                    <div className="text-sm text-zinc-200 font-medium mb-3 leading-snug">
                        {query.text}
                    </div>

                    <div className="space-y-1.5 mb-3">
                        <AnimatePresence mode="popLayout">
                            {showNeighbours && ranked.map((c, i) => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-start gap-2 text-[11px]"
                                >
                                    <span
                                        className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ background: CAMERA_META[c.camera].color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-zinc-400 font-mono text-[10px]">
                                            <span style={{ color: CAMERA_META[c.camera].color }}>{c.camera}</span>
                                            <span className="text-zinc-600"> · {c.ts}</span>
                                        </div>
                                        <div className="text-zinc-300 leading-snug truncate">{c.caption}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {showAnswer && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-auto rounded-lg border border-[#444ce740] bg-[#444ce71a] p-3 text-[12px] text-zinc-200 leading-snug"
                            >
                                <div className="text-[9px] uppercase tracking-widest text-[#7a82ff] mb-1">Gemma answer</div>
                                {query.answer}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
