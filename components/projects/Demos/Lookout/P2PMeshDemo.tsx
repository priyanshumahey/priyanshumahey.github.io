"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

// Interactive P2P mesh demo. Four follower cameras sit behind different
// network types (home WiFi, hotel NAT, LTE, office firewall) and dial a
// single leader over iroh. Clicking a follower toggles it online/offline —
// offline followers buffer chunks to a disk spool ring and drain them on
// reconnect. Meant to make "iroh handles NAT for you" concrete.

type Net = "wifi" | "nat" | "lte" | "fw"
type Status = "connecting" | "online" | "offline" | "draining"

interface Follower {
    id: string
    label: string
    net: Net
    // Position on the canvas
    x: number
    y: number
}

const NET_META: Record<Net, { label: string; icon: string; detail: string }> = {
    wifi: { label: "home wifi", icon: "wifi", detail: "dynamic IP · double NAT" },
    nat: { label: "hotel nat", icon: "nat", detail: "symmetric NAT · captive portal" },
    lte: { label: "lte tether", icon: "lte", detail: "carrier-grade NAT · 4G" },
    fw: { label: "office fw", icon: "fw", detail: "egress-only · 443 allowed" },
}

const FOLLOWERS: Follower[] = [
    { id: "cam-lab-1", label: "cam-lab-1", net: "wifi", x: 70, y: 80 },
    { id: "cam-lab-2", label: "cam-lab-2", net: "nat", x: 70, y: 230 },
    { id: "cam-door", label: "cam-door", net: "lte", x: 70, y: 380 },
    { id: "cam-hall", label: "cam-hall", net: "fw", x: 70, y: 530 },
]

const LEADER = { x: 620, y: 305 }
const RELAY = { x: 380, y: 305 }

interface FollowerState {
    status: Status
    spool: number // 0..1 ring buffer fill
    chunks: number // cumulative delivered
    latencyMs: number
}

const INITIAL: Record<string, FollowerState> = Object.fromEntries(
    FOLLOWERS.map((f) => [f.id, { status: "connecting" as Status, spool: 0, chunks: 0, latencyMs: 0 }])
)

export function P2PMeshDemo() {
    const [state, setState] = useState<Record<string, FollowerState>>(INITIAL)
    const [now, setNow] = useState(0)
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])

    // Initial handshake animation — each follower connects with a small stagger
    useEffect(() => {
        const ts: NodeJS.Timeout[] = []
        FOLLOWERS.forEach((f, i) => {
            ts.push(setTimeout(() => {
                setState((s) => ({
                    ...s,
                    [f.id]: { ...s[f.id], status: "online", latencyMs: 40 + Math.floor(Math.random() * 80) },
                }))
            }, 600 + i * 350))
        })
        timeoutsRef.current.push(...ts)
        return () => { ts.forEach(clearTimeout) }
    }, [])

    // Ticking simulation — deliver chunks if online, spool if offline, drain if draining
    useEffect(() => {
        const iv = setInterval(() => {
            setNow((n) => n + 1)
            setState((prev) => {
                const next: Record<string, FollowerState> = {}
                for (const f of FOLLOWERS) {
                    const s = prev[f.id]
                    if (s.status === "online") {
                        next[f.id] = { ...s, chunks: s.chunks + 1, spool: Math.max(0, s.spool - 0.02) }
                    } else if (s.status === "offline") {
                        next[f.id] = { ...s, spool: Math.min(1, s.spool + 0.08) }
                    } else if (s.status === "draining") {
                        const drained = Math.max(0, s.spool - 0.12)
                        next[f.id] = {
                            ...s,
                            spool: drained,
                            chunks: s.chunks + 3,
                            status: drained <= 0.01 ? "online" : "draining",
                        }
                    } else {
                        next[f.id] = s
                    }
                }
                return next
            })
        }, 500)
        return () => clearInterval(iv)
    }, [])

    const toggle = (id: string) => {
        setState((prev) => {
            const s = prev[id]
            if (s.status === "online") {
                return { ...prev, [id]: { ...s, status: "offline" } }
            }
            if (s.status === "offline") {
                return { ...prev, [id]: { ...s, status: "draining" } }
            }
            return prev
        })
    }

    const W = 720, H = 620

    return (
        <div className="w-full bg-[#08080c] rounded-2xl border border-[#1a1a24] overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    iroh mesh · click a camera to toggle it offline
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                    <span><span className="text-[#22c55e]">●</span> online</span>
                    <span><span className="text-[#ef4444]">●</span> offline · spooling</span>
                    <span><span className="text-[#f59e0b]">●</span> draining</span>
                </div>
            </div>

            <div className="p-4">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                    <defs>
                        <radialGradient id="leaderPulse">
                            <stop offset="0%" stopColor="#444ce7" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#444ce7" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* NAT traversal label band (behind connections) */}
                    <rect x={210} y={260} width={360} height={90} rx={10}
                        fill="#0a0a14" stroke="#15152a" strokeDasharray="3 3" />

                    {/* Connections — drawn before relay/leader so cards render on top */}
                    {FOLLOWERS.map((f) => {
                        const s = state[f.id]
                        const fromX = f.x + 140, fromY = f.y + 40
                        const midX = RELAY.x, midY = RELAY.y
                        const toX = LEADER.x - 60, toY = LEADER.y
                        const color = s.status === "online" ? "#22c55e"
                            : s.status === "offline" ? "#ef4444"
                                : s.status === "draining" ? "#f59e0b"
                                    : "#6b7280"
                        // Path through relay
                        const path = `M ${fromX} ${fromY} Q ${(fromX + midX) / 2} ${(fromY + midY) / 2 - 30} ${midX} ${midY} Q ${(midX + toX) / 2} ${(midY + toY) / 2 + 30} ${toX} ${toY}`
                        const dashed = s.status === "offline" || s.status === "connecting"
                        return (
                            <g key={f.id}>
                                <path d={path} fill="none" stroke="#1a1a28" strokeWidth={1.5}
                                    strokeDasharray={dashed ? "4 4" : undefined} />
                                <path d={path} fill="none" stroke={color} strokeWidth={1.5}
                                    strokeDasharray={dashed ? "4 4" : undefined}
                                    opacity={s.status === "offline" ? 0.35 : 0.9} />
                                {/* Particle stream when online or draining */}
                                {(s.status === "online" || s.status === "draining") && [0, 1, 2].map((i) => (
                                    <circle key={i} r={3} fill={color}>
                                        <animateMotion
                                            dur={`${1.6 + i * 0.2}s`}
                                            repeatCount="indefinite"
                                            begin={`${i * 0.5}s`}
                                            path={path}
                                            keyPoints="0;1"
                                            keyTimes="0;1"
                                            calcMode="spline"
                                            keySplines="0.4 0 0.2 1"
                                        />
                                    </circle>
                                ))}
                            </g>
                        )
                    })}

                    {/* NAT traversal label text — drawn on top of connections */}
                    <text x={230} y={278} fill="#6b7280" fontSize={9} fontWeight={600} letterSpacing={0.8}>
                        NAT TRAVERSAL · QUIC · ED25519 AUTH · RELAY FALLBACK
                    </text>

                    {/* Relay node — drawn on top of connections */}
                    <g transform={`translate(${RELAY.x - 38}, ${RELAY.y - 20})`}>
                        <rect width={76} height={40} rx={6} fill="#0c0c18" stroke="#1f1f2e" />
                        <text x={38} y={16} fill="#a3a3b0" fontSize={9} fontWeight={600} textAnchor="middle"
                            fontFamily="monospace">iroh relay</text>
                        <text x={38} y={28} fill="#6b7280" fontSize={8} textAnchor="middle"
                            fontFamily="monospace">eu-1.n0</text>
                    </g>

                    {/* Leader node — drawn on top of connections */}
                    <g transform={`translate(${LEADER.x - 60}, ${LEADER.y - 40})`}>
                        <circle cx={60} cy={40} r={50} fill="url(#leaderPulse)" />
                        <rect x={0} y={0} width={120} height={80} rx={10}
                            fill="#0c0c18" stroke="#444ce7" strokeWidth={1.5} />
                        <rect x={0} y={0} width={4} height={80} rx={2} fill="#444ce7" />
                        <text x={14} y={22} fill="#fff" fontSize={12} fontWeight={700}
                            fontFamily="system-ui, sans-serif">Leader</text>
                        <text x={14} y={36} fill="#6b7280" fontSize={9} fontFamily="monospace">iroh endpoint</text>
                        <text x={14} y={50} fill="#6b7280" fontSize={9} fontFamily="monospace">ChromaDB</text>
                        <text x={14} y={64} fill="#6b7280" fontSize={9} fontFamily="monospace">axum :8080</text>
                        {/* Total ingest tick */}
                        <text x={110} y={76} fill="#22c55e" fontSize={8} textAnchor="end"
                            fontFamily="monospace">
                            {Object.values(state).reduce((a, s) => a + s.chunks, 0).toLocaleString()} chunks
                        </text>
                    </g>

                    {/* Follower nodes */}
                    {FOLLOWERS.map((f) => {
                        const s = state[f.id]
                        const color = s.status === "online" ? "#22c55e"
                            : s.status === "offline" ? "#ef4444"
                                : s.status === "draining" ? "#f59e0b"
                                    : "#6b7280"
                        return (
                            <g key={f.id} transform={`translate(${f.x}, ${f.y})`}
                                onClick={() => toggle(f.id)} style={{ cursor: "pointer" }}>
                                {/* Card */}
                                <rect x={0} y={0} width={140} height={80} rx={10}
                                    fill="#0c0c18" stroke={s.status === "online" ? color : "#1f1f2e"} strokeWidth={1.5} />
                                <rect x={0} y={0} width={4} height={80} rx={2} fill={color} />
                                {/* Camera tile icon */}
                                <rect x={14} y={14} width={32} height={22} rx={3}
                                    fill="#111122" stroke="#2a2a40" />
                                <circle cx={30} cy={25} r={5} fill={color} fillOpacity={0.3}
                                    stroke={color} strokeWidth={1} />
                                {s.status === "online" && (
                                    <motion.line x1={14} x2={46} y1={25} y2={25}
                                        stroke={color} strokeWidth={0.6}
                                        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }} />
                                )}
                                {/* Label */}
                                <text x={54} y={22} fill="#fff" fontSize={11} fontWeight={600}
                                    fontFamily="system-ui, sans-serif">{f.label}</text>
                                <text x={54} y={34} fill="#6b7280" fontSize={8}
                                    fontFamily="monospace">{NET_META[f.net].label}</text>
                                {/* Status line */}
                                <text x={14} y={52} fill={color} fontSize={9} fontFamily="monospace">
                                    {s.status === "online" ? `● online · ${s.latencyMs}ms` :
                                        s.status === "offline" ? `● offline · buffering` :
                                            s.status === "draining" ? `● draining spool` :
                                                `○ dialing…`}
                                </text>
                                <text x={14} y={64} fill="#4b5563" fontSize={8} fontFamily="monospace">
                                    {NET_META[f.net].detail}
                                </text>
                                {/* Spool ring */}
                                <g transform="translate(114, 58)">
                                    <circle r={10} fill="none" stroke="#1f1f2e" strokeWidth={2} />
                                    <circle r={10} fill="none"
                                        stroke={s.spool > 0.01 ? "#ef4444" : "#22c55e"}
                                        strokeWidth={2}
                                        strokeDasharray={`${Math.round(s.spool * 63)} 63`}
                                        strokeLinecap="round"
                                        transform="rotate(-90)" />
                                    <text y={3} fill="#6b7280" fontSize={7} textAnchor="middle"
                                        fontFamily="monospace">
                                        {Math.round(s.spool * 100)}%
                                    </text>
                                </g>
                            </g>
                        )
                    })}
                </svg>
            </div>

            <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                {FOLLOWERS.map((f) => {
                    const s = state[f.id]
                    return (
                        <button
                            key={f.id}
                            onClick={() => toggle(f.id)}
                            className="text-left rounded-lg border border-[#1f1f2e] bg-[#0a0a14] hover:border-[#2a2a40] transition-colors p-2"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-mono text-zinc-300">{f.label}</span>
                                <span className={`text-[9px] uppercase tracking-widest ${s.status === "online" ? "text-[#22c55e]" :
                                    s.status === "offline" ? "text-[#ef4444]" :
                                        s.status === "draining" ? "text-[#f59e0b]" : "text-zinc-500"
                                    }`}>{s.status}</span>
                            </div>
                            <div className="text-[9px] text-zinc-500 font-mono">
                                {s.chunks.toLocaleString()} chunks · spool {(s.spool * 100).toFixed(0)}%
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
