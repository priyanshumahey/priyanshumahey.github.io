"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

type Actor = "F" | "L" | "U"

interface Msg {
    id: string
    from: Actor
    to: Actor
    label: string
    payload?: string
    color: string
    dashed?: boolean
}

interface SelfOp {
    id: string
    actor: Actor
    label: string
    sub?: string
    color: string
}

type Row =
    | { kind: "msg"; msg: Msg }
    | { kind: "self"; op: SelfOp }

interface Phase {
    id: string
    title: string
    subtitle: string
    accent: string
    rows: Row[]
}

const LIFELINES: Record<Actor, { x: number; label: string; sub: string; color: string }> = {
    F: { x: 150, label: "Follower", sub: "cam-lab-1 · Rust + Cactus", color: "#22c55e" },
    L: { x: 450, label: "Leader", sub: "iroh + axum + ChromaDB", color: "#444ce7" },
    U: { x: 750, label: "UI", sub: "React · browser", color: "#f59e0b" },
}

const PHASES: Phase[] = [
    {
        id: "handshake",
        title: "Handshake",
        subtitle: "Authenticated over Ed25519 — no CA, no port forwarding",
        accent: "#22c55e",
        rows: [
            { kind: "msg", msg: { id: "dial", from: "F", to: "L", label: "dial(ticket)", payload: "ALPN: cactus/ingest/v1", color: "#22c55e" } },
            { kind: "msg", msg: { id: "hello", from: "F", to: "L", label: "Hello", payload: '{ camera_id: "cam-lab-1" }', color: "#22c55e" } },
            { kind: "self", op: { id: "register", actor: "L", label: "register camera", sub: "added to /api/cameras", color: "#444ce7" } },
        ],
    },
    {
        id: "ingest",
        title: "Ingest · long-lived bidirectional QUIC stream",
        subtitle: "Follower pushes embeddings up; leader acks each chunk",
        accent: "#8b5cf6",
        rows: [
            { kind: "msg", msg: { id: "chunk", from: "F", to: "L", label: "Chunk", payload: "{ chunk_id, embedding, caption, jpeg, ts }", color: "#8b5cf6" } },
            { kind: "self", op: { id: "persist", actor: "L", label: "persist → ChromaDB", sub: "video / audio / caption collections", color: "#ec4899" } },
            { kind: "msg", msg: { id: "ack", from: "L", to: "F", label: "Ack", payload: "{ chunk_id }", color: "#06b6d4" } },
        ],
    },
    {
        id: "live",
        title: "Live frame proxy · on-demand over the same stream",
        subtitle: "Leader reuses the follower's existing QUIC connection to pull a JPEG",
        accent: "#f59e0b",
        rows: [
            { kind: "msg", msg: { id: "live-req", from: "U", to: "L", label: "GET /api/live/cam-lab-1", color: "#f59e0b" } },
            { kind: "msg", msg: { id: "frame-req", from: "L", to: "F", label: "FrameRequest", payload: "{ req_id }", color: "#f59e0b" } },
            { kind: "msg", msg: { id: "frame-res", from: "F", to: "L", label: "FrameResponse", payload: "{ req_id, jpeg }", color: "#22c55e" } },
            { kind: "msg", msg: { id: "live-res", from: "L", to: "U", label: "200 image/jpeg", color: "#f59e0b" } },
        ],
    },
    {
        id: "query",
        title: "Natural-language query",
        subtitle: "ANN + RRF + on-device Gemma synthesis — all on the leader",
        accent: "#ec4899",
        rows: [
            { kind: "msg", msg: { id: "query", from: "U", to: "L", label: "POST /api/query", payload: '{ q: "when did the package arrive?" }', color: "#ec4899" } },
            { kind: "self", op: { id: "synth", actor: "L", label: "ANN + RRF + Gemma synthesis", sub: "Cactus · on-device", color: "#8b5cf6" } },
            { kind: "msg", msg: { id: "answer", from: "L", to: "U", label: "answer + citations", payload: "[cam-door @ 14:03, cam-door @ 14:04]", color: "#ec4899" } },
        ],
    },
]

// Layout: generous vertical rhythm so labels never collide.
// TOP_PAD leaves room for lifeline cards (46px tall) plus the phase band
// title bar (~44px) above the first row. ROW_H is ~5x the pill height so
// rows read as clearly separate at any container width.
// PHASE_GAP MUST be > BAND_PAD_TOP or adjacent bands will overlap.
const TOP_PAD = 210
const ROW_H = 130
const BAND_PAD_TOP = 70
const BAND_PAD_BOTTOM = 56
const PHASE_GAP = 130

type LaidOutRow = { phase: Phase; row: Row; y: number }
type LaidOutBand = { phase: Phase; yStart: number; yEnd: number; rowIds: string[] }

function layout() {
    const rows: LaidOutRow[] = []
    const bands: LaidOutBand[] = []
    let y = TOP_PAD
    for (const phase of PHASES) {
        const bandStart = y - BAND_PAD_TOP
        const rowIds: string[] = []
        phase.rows.forEach((row) => {
            rows.push({ phase, row, y })
            rowIds.push(row.kind === "msg" ? row.msg.id : row.op.id)
            y += ROW_H
        })
        const bandEnd = y - ROW_H + BAND_PAD_BOTTOM
        bands.push({ phase, yStart: bandStart, yEnd: bandEnd, rowIds })
        y = bandEnd + PHASE_GAP
    }
    return { rows, bands, totalHeight: y }
}

const { rows: LAID_ROWS, bands: LAID_BANDS, totalHeight: TOTAL_H } = layout()
const SVG_H = TOTAL_H + 20
const SVG_W = 900

function Lifeline({ x, label, sub, color, top, bottom }: {
    x: number; label: string; sub: string; color: string
    top: number; bottom: number
}) {
    return (
        <g>
            <rect x={x - 84} y={top - 64} width={168} height={46} rx={8}
                fill="#0c0c14" stroke={color} strokeWidth={1.5} />
            <rect x={x - 84} y={top - 64} width={4} height={46} rx={2} fill={color} />
            <text x={x - 72} y={top - 45} fill="white" fontSize={13} fontWeight={700}
                fontFamily="system-ui, sans-serif">{label}</text>
            <text x={x - 72} y={top - 29} fill="#6b7280" fontSize={10}
                fontFamily="system-ui, sans-serif">{sub}</text>
            <line x1={x} y1={top - 14} x2={x} y2={bottom}
                stroke="#1f1f2e" strokeWidth={1} strokeDasharray="3 5" />
        </g>
    )
}

function measurePillWidth(label: string, payload?: string): number {
    const labelW = label.length * 7.4
    const payloadW = (payload?.length ?? 0) * 5.9
    return Math.max(labelW, payloadW) + 24
}

function MsgArrow({ msg, y, isActive }: { msg: Msg; y: number; isActive: boolean }) {
    const fromX = LIFELINES[msg.from].x
    const toX = LIFELINES[msg.to].x
    const color = msg.color
    const baseStroke = isActive ? color : "#2a2a38"
    const lineOpacity = isActive ? 1 : 0.35
    const dir = toX > fromX ? 1 : -1
    const lineStart = fromX + 8 * dir
    const arrowTipX = toX - 10 * dir
    const midX = (fromX + toX) / 2

    const pillW = measurePillWidth(msg.label, msg.payload)
    const pillH = msg.payload ? 30 : 22
    const pillX = midX - pillW / 2
    const pillY = y - pillH / 2

    return (
        <g>
            {/* Line split around the pill so the pill sits ON the arrow */}
            <line x1={lineStart} y1={y} x2={pillX - 4} y2={y}
                stroke={baseStroke} strokeWidth={1.8}
                strokeDasharray={msg.dashed ? "5 5" : undefined}
                opacity={lineOpacity} />
            <line x1={pillX + pillW + 4} y1={y} x2={arrowTipX} y2={y}
                stroke={baseStroke} strokeWidth={1.8}
                strokeDasharray={msg.dashed ? "5 5" : undefined}
                opacity={lineOpacity} />
            {/* Arrow head */}
            <polygon
                points={dir > 0
                    ? `${toX - 2},${y} ${toX - 11},${y - 5} ${toX - 11},${y + 5}`
                    : `${toX + 2},${y} ${toX + 11},${y - 5} ${toX + 11},${y + 5}`}
                fill={baseStroke} opacity={lineOpacity} />
            {/* Moving particle travels over the full line */}
            {isActive && (
                <motion.circle r={4.5} fill={color}
                    initial={{ cx: lineStart, opacity: 0 }}
                    animate={{ cx: arrowTipX, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    cy={y} />
            )}
            {/* Label pill */}
            <g>
                <rect x={pillX} y={pillY} width={pillW} height={pillH} rx={6}
                    fill="#0c0c14"
                    stroke={isActive ? color : "#2a2a38"}
                    strokeWidth={isActive ? 1.3 : 1}
                    opacity={isActive ? 1 : 0.9} />
                <text x={midX} y={pillY + (msg.payload ? 14 : 15)} textAnchor="middle"
                    fill={isActive ? "white" : "#a3a3b0"}
                    fontSize={12}
                    fontWeight={isActive ? 600 : 500}
                    fontFamily="system-ui, sans-serif">{msg.label}</text>
                {msg.payload && (
                    <text x={midX} y={pillY + 25} textAnchor="middle"
                        fill={isActive ? color : "#6b7280"}
                        fontSize={10}
                        fontFamily="ui-monospace, monospace">{msg.payload}</text>
                )}
            </g>
        </g>
    )
}

function SelfOpBadge({ op, y, isActive }: { op: SelfOp; y: number; isActive: boolean }) {
    const x = LIFELINES[op.actor].x
    const color = op.color
    const labelW = op.label.length * 7.4
    const subW = (op.sub?.length ?? 0) * 5.9
    const width = Math.max(labelW, subW) + 36
    const height = op.sub ? 40 : 28
    const bx = x - width / 2
    const by = y - height / 2
    return (
        <g>
            {/* Loop indicator on the lifeline */}
            <path d={`M ${x} ${y - 16} q -14 0 -14 16 q 0 16 14 16`}
                fill="none" stroke={isActive ? color : "#2a2a38"} strokeWidth={1.5}
                opacity={isActive ? 1 : 0.45} />
            <polygon
                points={`${x - 2},${y + 16} ${x - 9},${y + 11} ${x - 9},${y + 21}`}
                fill={isActive ? color : "#2a2a38"}
                opacity={isActive ? 1 : 0.45} />
            {/* Badge */}
            <rect x={bx} y={by} width={width} height={height} rx={7}
                fill="#0c0c14"
                stroke={isActive ? color : "#2a2a38"}
                strokeWidth={isActive ? 1.4 : 1} />
            <rect x={bx} y={by} width={3} height={height} rx={1.5} fill={color}
                opacity={isActive ? 1 : 0.55} />
            <text x={bx + 12} y={by + (op.sub ? 16 : height / 2 + 4)}
                fill={isActive ? "white" : "#a3a3b0"}
                fontSize={12} fontWeight={600}
                fontFamily="system-ui, sans-serif">{op.label}</text>
            {op.sub && (
                <text x={bx + 12} y={by + 30}
                    fill={isActive ? color : "#6b7280"}
                    fontSize={10}
                    fontFamily="ui-monospace, monospace">{op.sub}</text>
            )}
            {isActive && (
                <motion.circle cx={bx + width - 10} cy={by + 10} r={3} fill={color}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }} />
            )}
        </g>
    )
}

function PhaseBand({ band, active }: { band: LaidOutBand; active: boolean }) {
    const { phase, yStart, yEnd } = band
    return (
        <g>
            <rect x={20} y={yStart} width={SVG_W - 40} height={yEnd - yStart} rx={10}
                fill={active ? "#0d0d18" : "#0a0a12"}
                stroke={active ? `${phase.accent}55` : "#15152a"}
                strokeWidth={active ? 1.5 : 1}
                strokeDasharray={active ? undefined : "4 4"} />
            {/* Title bar */}
            <g>
                <rect x={34} y={yStart + 12} width={6} height={18} rx={2} fill={phase.accent} />
                <text x={46} y={yStart + 26}
                    fill={active ? "white" : "#a3a3b0"}
                    fontSize={12} fontWeight={700} letterSpacing={0.4}
                    fontFamily="system-ui, sans-serif">{phase.title}</text>
                <text x={46} y={yStart + 40}
                    fill={active ? "#8a8a9a" : "#4b4b60"}
                    fontSize={10}
                    fontFamily="system-ui, sans-serif">{phase.subtitle}</text>
            </g>
        </g>
    )
}

export function WireProtocolFlow() {
    const [activeIds, setActiveIds] = useState<Set<string>>(new Set())
    const [activePhase, setActivePhase] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const STEP = 800
    const GAP = 1100

    const runAnimation = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)

        const runPhase = (pi: number) => {
            if (pi >= PHASES.length) {
                setActiveIds(new Set())
                setActivePhase(null)
                timeoutRef.current = setTimeout(() => {
                    setIsAnimating(false)
                    runAnimation()
                }, GAP)
                return
            }
            const phase = PHASES[pi]
            setActivePhase(phase.id)
            setActiveIds(new Set())

            const ids = phase.rows.map((r) => (r.kind === "msg" ? r.msg.id : r.op.id))
            let accumulated = new Set<string>()
            const next = (i: number) => {
                if (i >= ids.length) {
                    timeoutRef.current = setTimeout(() => {
                        setActiveIds(new Set())
                        timeoutRef.current = setTimeout(() => runPhase(pi + 1), 300)
                    }, GAP)
                    return
                }
                accumulated = new Set([...accumulated, ids[i]])
                setActiveIds(new Set(accumulated))
                timeoutRef.current = setTimeout(() => next(i + 1), STEP)
            }
            next(0)
        }

        runPhase(0)
    }, [isAnimating])

    useEffect(() => {
        const t = setTimeout(() => runAnimation(), 500)
        return () => {
            clearTimeout(t)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    const firstBandStart = LAID_BANDS[0]?.yStart ?? TOP_PAD
    // Place lifeline card bottom ~10px above the first band so the band
    // title never hides behind the cards.
    const lifelineTop = firstBandStart - 10
    const lifelineBottom = TOTAL_H + 4

    const currentPhaseLabel = activePhase
        ? PHASES.find((p) => p.id === activePhase)?.title ?? ""
        : "One long-lived QUIC stream carries embeddings up and requests down"

    return (
        <div className="w-full bg-[#08080c] rounded-2xl border border-[#1a1a24] overflow-hidden">
            <div className="p-4 overflow-x-auto">
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto" style={{ minWidth: 680 }}>
                    {/* Phase bands */}
                    {LAID_BANDS.map((b) => (
                        <PhaseBand key={b.phase.id} band={b} active={activePhase === b.phase.id} />
                    ))}

                    {/* Lifelines */}
                    {(Object.keys(LIFELINES) as Actor[]).map((k) => (
                        <Lifeline key={k}
                            x={LIFELINES[k].x}
                            label={LIFELINES[k].label}
                            sub={LIFELINES[k].sub}
                            color={LIFELINES[k].color}
                            top={lifelineTop}
                            bottom={lifelineBottom} />
                    ))}

                    {/* Rows */}
                    {LAID_ROWS.map(({ row, y }) => {
                        if (row.kind === "msg") {
                            return <MsgArrow key={row.msg.id} msg={row.msg} y={y}
                                isActive={activeIds.has(row.msg.id)} />
                        }
                        return <SelfOpBadge key={row.op.id} op={row.op} y={y}
                            isActive={activeIds.has(row.op.id)} />
                    })}
                </svg>
            </div>

            <div className="px-5 py-3 bg-[#0a0a10] border-t border-[#1a1a24] flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activeIds.size === 0 ? "bg-zinc-600" : "bg-[#22c55e] animate-pulse"}`} />
                <span className="text-sm text-zinc-400">{currentPhaseLabel}</span>
            </div>
        </div>
    )
}
