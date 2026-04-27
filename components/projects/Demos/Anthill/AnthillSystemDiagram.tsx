"use client"

/**
 * Anthill system diagram — slim version. 13 boxes, 4 lanes, one external
 * rail. Animates four phases of the system loop: type, ground, lit, review.
 */

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

type Node =
    | "editor"
    | "api"
    | "supa_client"
    | "hocus"
    | "bridge"
    | "search"
    | "agents"
    | "harrier"
    | "supa"
    | "nia"
    | "claude"
    | "openai"
    | "mail"

type Phase = "idle" | "type" | "ground" | "lit" | "review"

const phaseLabels: Record<Phase, string> = {
    idle: "Anthill: humans and agents share one Yjs CRDT.",
    type: "Auto-cite. Type, debounce 1.2s, /search, ghost text, Tab inserts citation.",
    ground: "ground_citation. Editor opens SSE, Nia returns a verdict, badge re-renders.",
    lit: "literature_search. gpt-4o-mini fans out, arXiv discovery, Harrier ranks.",
    review: "review_response. Sonnet 4 maps the email to addNote ops via the bridge.",
}

function Box({
    x, y, w, h, label, sublabel, color, active,
}: {
    x: number; y: number; w: number; h: number
    label: string; sublabel?: string
    color: string; active: boolean
}) {
    return (
        <g>
            {active && (
                <motion.rect
                    x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx={11}
                    fill="none" stroke={color} strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                />
            )}
            <rect
                x={x} y={y} width={w} height={h} rx={8}
                fill="#0c0c14"
                stroke={active ? color : "#1f1f2e"}
                strokeWidth={active ? 2 : 1}
            />
            <rect x={x} y={y} width={3.5} height={h} rx={2} fill={color} opacity={active ? 1 : 0.4} />
            <text
                x={x + 12} y={y + (sublabel ? h / 2 - 4 : h / 2)}
                fill="white" fontSize={11.5} fontWeight={600}
                fontFamily="system-ui, sans-serif"
                dominantBaseline={sublabel ? "auto" : "middle"}
            >
                {label}
            </text>
            {sublabel && (
                <text
                    x={x + 12} y={y + h / 2 + 10}
                    fill="#6b7280" fontSize={9}
                    fontFamily="system-ui, sans-serif"
                >
                    {sublabel}
                </text>
            )}
        </g>
    )
}

function Wire({
    d, active, color, dashed = false, width = 1.5,
}: {
    d: string; active: boolean; color: string; dashed?: boolean; width?: number
}) {
    return (
        <g>
            <path
                d={d} fill="none" stroke="#171724" strokeWidth={width}
                strokeLinecap="round" strokeDasharray={dashed ? "4 4" : undefined}
            />
            {active && (
                <>
                    <motion.path
                        d={d} fill="none" stroke={color} strokeWidth={width + 0.5}
                        strokeLinecap="round" strokeDasharray={dashed ? "4 4" : undefined}
                        initial={{ pathLength: 0, opacity: 0.5 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                    />
                    <motion.circle r={3.5} fill={color}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <animateMotion dur="1.2s" repeatCount="indefinite"
                            path={d} keyPoints="0;1" keyTimes="0;1"
                            calcMode="spline" keySplines="0.4 0 0.2 1" />
                    </motion.circle>
                </>
            )}
        </g>
    )
}

export function AnthillSystemDiagram() {
    const [active, setActive] = useState<Set<Node>>(new Set())
    const [phase, setPhase] = useState<Phase>("idle")
    const [running, setRunning] = useState(false)
    const t = useRef<NodeJS.Timeout | null>(null)

    const STEP = 600
    const HOLD = 1300
    const IDLE = 900

    const cycle = useCallback(() => {
        if (running) return
        setRunning(true)
        const set = (s: Node[]) => setActive(new Set(s))

        const phaseType = () => {
            setPhase("type")
            set(["editor"])
            t.current = setTimeout(() => {
                set(["editor", "api"])
                t.current = setTimeout(() => {
                    set(["editor", "api", "search", "harrier"])
                    t.current = setTimeout(() => {
                        // Yjs broadcast back through Hocuspocus to other clients
                        set(["editor", "hocus"])
                        t.current = setTimeout(phaseGround, HOLD)
                    }, HOLD)
                }, STEP)
            }, STEP)
        }

        const phaseGround = () => {
            setPhase("ground")
            set(["editor", "api"])
            t.current = setTimeout(() => {
                set(["api", "agents", "nia"])
                t.current = setTimeout(() => {
                    // SSE finding back to editor
                    set(["agents", "api", "editor"])
                    t.current = setTimeout(phaseLit, HOLD)
                }, STEP)
            }, STEP)
        }

        const phaseLit = () => {
            setPhase("lit")
            set(["editor", "api", "agents"])
            t.current = setTimeout(() => {
                set(["agents", "openai"])
                t.current = setTimeout(() => {
                    set(["agents", "harrier"])
                    t.current = setTimeout(phaseReview, HOLD)
                }, STEP)
            }, STEP)
        }

        const phaseReview = () => {
            setPhase("review")
            set(["api", "agents", "claude"])
            t.current = setTimeout(() => {
                set(["agents", "bridge", "hocus", "editor", "supa"])
                t.current = setTimeout(() => {
                    setActive(new Set())
                    setPhase("idle")
                    t.current = setTimeout(() => { setRunning(false); cycle() }, IDLE)
                }, HOLD)
            }, STEP)
        }

        phaseType()
    }, [running])

    useEffect(() => {
        const x = setTimeout(cycle, 600)
        return () => { clearTimeout(x); if (t.current) clearTimeout(t.current) }
    }, [])

    return (
        <div className="w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs not-prose">
            <div className="p-4 bg-[#08080c] dark:bg-[#08080c] overflow-x-auto">
                <svg viewBox="0 0 880 380" className="h-auto" style={{ minWidth: 880, width: "100%" }}>
                    {/* ---- Lane backgrounds ---- */}
                    <rect x={10} y={20} width={170} height={340} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={195} y={20} width={170} height={340} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={380} y={20} width={170} height={340} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={565} y={20} width={185} height={340} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />
                    <rect x={765} y={20} width={105} height={340} rx={10} fill="#0a0a12" stroke="#15152a" strokeDasharray="3 2" />

                    {/* ---- Lane labels ---- */}
                    <text x={20} y={36} fill="#3f3f5a" fontSize={9} fontWeight={700} letterSpacing={0.8}>BROWSER</text>
                    <text x={205} y={36} fill="#3f3f5a" fontSize={9} fontWeight={700} letterSpacing={0.8}>WEB · NEXT.JS</text>
                    <text x={390} y={36} fill="#3f3f5a" fontSize={9} fontWeight={700} letterSpacing={0.8}>COLLAB · BUN</text>
                    <text x={575} y={36} fill="#3f3f5a" fontSize={9} fontWeight={700} letterSpacing={0.8}>BACKEND · FASTAPI</text>
                    <text x={775} y={36} fill="#3f3f5a" fontSize={9} fontWeight={700} letterSpacing={0.8}>EXTERNAL</text>

                    {/* ---- Wires ---- */}
                    {/* Browser ↔ Hocuspocus (WebSocket) */}
                    <Wire
                        d="M 175 130 Q 280 105 395 105"
                        active={active.has("editor") && active.has("hocus")}
                        color="#06b6d4" width={2}
                    />

                    {/* Browser → /api routes */}
                    <Wire
                        d="M 175 200 L 195 200"
                        active={active.has("editor") && active.has("api")}
                        color="#22c55e"
                    />

                    {/* Web → backend (search + agents) */}
                    <Wire
                        d="M 365 180 Q 470 170 580 130"
                        active={active.has("api") && active.has("search")}
                        color="#22c55e"
                    />
                    <Wire
                        d="M 365 220 Q 470 210 580 200"
                        active={active.has("api") && active.has("agents")}
                        color="#ec4899"
                    />

                    {/* Web ↔ Supabase (tRPC) */}
                    <Wire
                        d="M 280 250 L 280 295"
                        active={active.has("api") && active.has("supa")}
                        color="#f59e0b" dashed
                    />

                    {/* Hocuspocus ↔ Bridge (openDirectConnection) */}
                    <Wire
                        d="M 465 130 L 465 195"
                        active={active.has("hocus") && active.has("bridge")}
                        color="#8b5cf6" width={2}
                    />

                    {/* Hocuspocus ↔ Supabase persistence */}
                    <Wire
                        d="M 395 105 Q 320 200 395 295"
                        active={active.has("hocus") && active.has("supa")}
                        color="#f59e0b" dashed
                    />

                    {/* Backend agents → bridge */}
                    <Wire
                        d="M 580 200 Q 525 230 470 240"
                        active={active.has("agents") && active.has("bridge")}
                        color="#8b5cf6"
                    />

                    {/* Backend agents → Harrier (in-process) */}
                    <Wire
                        d="M 660 220 L 660 265"
                        active={
                            (active.has("search") && active.has("harrier")) ||
                            (active.has("agents") && active.has("harrier"))
                        }
                        color="#a855f7"
                    />

                    {/* Backend → External rail */}
                    <Wire
                        d="M 745 200 L 770 105"
                        active={active.has("agents") && active.has("openai")}
                        color="#0ea5e9" dashed
                    />
                    <Wire
                        d="M 745 200 L 770 175"
                        active={active.has("agents") && active.has("nia")}
                        color="#10b981" dashed
                    />
                    <Wire
                        d="M 745 200 L 770 245"
                        active={active.has("agents") && active.has("claude")}
                        color="#fb923c" dashed
                    />
                    <Wire
                        d="M 745 200 L 770 315"
                        active={active.has("agents") && active.has("mail")}
                        color="#f43f5e" dashed
                    />

                    {/* ---- Boxes ---- */}

                    {/* Browser */}
                    <Box x={20} y={105} w={155} h={50}
                        label="Plate editor"
                        sublabel="@platejs/yjs · presence · plugins"
                        color="#22c55e" active={active.has("editor")} />
                    {/* Browser sub-features as small chips */}
                    <g>
                        <BrowserChip x={20} y={170} label="citation-suggest · 1.2s · top-k=5" active={active.has("editor") && phase === "type"} />
                        <BrowserChip x={20} y={195} label="agents panel · run forms" active={active.has("editor") && (phase === "ground" || phase === "lit" || phase === "review")} />
                        <BrowserChip x={20} y={220} label="connect-agent dialog" active={false} />
                        <BrowserChip x={20} y={245} label="citation badge · 5 states" active={active.has("editor") && phase === "ground"} />
                    </g>

                    {/* web/ */}
                    <Box x={195} y={175} w={170} h={50}
                        label="API routes"
                        sublabel="/citations · /agents/runs · SSE"
                        color="#fb923c" active={active.has("api")} />
                    <Box x={195} y={245} w={170} h={45}
                        label="Supabase client"
                        sublabel="documents · yjs_state · plain_text"
                        color="#f59e0b" active={active.has("supa_client")} />

                    {/* collab/ */}
                    <Box x={395} y={80} w={140} h={50}
                        label="Hocuspocus"
                        sublabel=":1234 · Yjs sync"
                        color="#06b6d4" active={active.has("hocus")} />
                    <Box x={395} y={195} w={140} h={50}
                        label="Agent bridge"
                        sublabel=":8889 · Y.transact"
                        color="#8b5cf6" active={active.has("bridge")} />
                    {/* Vertical ↔ label */}
                    <text x={465} y={170} fill="#6b7280" fontSize={8.5}
                        fontFamily="ui-monospace, monospace" textAnchor="middle">
                        openDirectConnection
                    </text>

                    {/* backend/ */}
                    <Box x={580} y={80} w={160} h={50}
                        label="/search · /embed"
                        sublabel="X-Anthill-Secret"
                        color="#22c55e" active={active.has("search")} />
                    <Box x={580} y={175} w={160} h={50}
                        label="/agents/runs"
                        sublabel="8 agents · SSE per run"
                        color="#ec4899" active={active.has("agents")} />
                    <Box x={580} y={265} w={160} h={50}
                        label="Harrier 270M + Chroma"
                        sublabel="local · in-process"
                        color="#a855f7" active={active.has("harrier")} />

                    {/* External rail (5 stacked chips) */}
                    <ExternalChip x={770} y={80} label="OpenAI" sublabel="planner" color="#0ea5e9" active={active.has("openai")} />
                    <ExternalChip x={770} y={150} label="Nia v2" sublabel="cited Q&A" color="#10b981" active={active.has("nia")} />
                    <ExternalChip x={770} y={220} label="Claude" sublabel="Sonnet 4" color="#fb923c" active={active.has("claude")} />
                    <ExternalChip x={770} y={290} label="AgentMail" sublabel="inbox" color="#f43f5e" active={active.has("mail")} />

                    {/* Shared store at the bottom of collab/ */}
                    <Box x={395} y={295} w={140} h={45}
                        label="Supabase Postgres"
                        sublabel="yjs_state · content · plain_text"
                        color="#f59e0b" active={active.has("supa")} />
                </svg>
            </div>

            {/* Footer status strip */}
            <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-3">
                <div className={`size-1.5 rounded-full ${active.size === 0 ? "bg-muted-foreground" : "bg-emerald-500 animate-pulse"}`} />
                <span className="text-xs text-muted-foreground">{phaseLabels[phase]}</span>
            </div>

            {/* Legend */}
            <div className="border-t bg-background px-4 py-2.5 flex items-center justify-between flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-cyan-500" />WebSocket (Yjs)</span>
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500" />auto-cite</span>
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-pink-500" />agent run (SSE)</span>
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-violet-500" />bridge edit (Y.transact)</span>
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-amber-500" />persistence</span>
            </div>
        </div>
    )
}

function BrowserChip({ x, y, label, active }: { x: number; y: number; label: string; active: boolean }) {
    return (
        <g>
            <rect x={x} y={y} width={155} height={20} rx={4}
                fill={active ? "#1a1a28" : "#0c0c14"}
                stroke={active ? "#22c55e" : "#1f1f2e"} strokeWidth={1} />
            <text x={x + 8} y={y + 13} fill={active ? "#bbf7d0" : "#9ca3af"} fontSize={9}
                fontFamily="system-ui, sans-serif">
                {label}
            </text>
        </g>
    )
}

function ExternalChip({
    x, y, label, sublabel, color, active,
}: {
    x: number; y: number; label: string; sublabel: string; color: string; active: boolean
}) {
    return (
        <g>
            {active && (
                <motion.rect x={x - 3} y={y - 3} width={95 + 6} height={50 + 6} rx={9}
                    fill="none" stroke={color} strokeWidth={2}
                    initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity }} />
            )}
            <rect x={x} y={y} width={95} height={50} rx={8}
                fill="#0c0c14"
                stroke={active ? color : "#1f1f2e"} strokeWidth={active ? 2 : 1} />
            <rect x={x} y={y} width={3.5} height={50} rx={2} fill={color} opacity={active ? 1 : 0.4} />
            <text x={x + 11} y={y + 22} fill="white" fontSize={11} fontWeight={600}
                fontFamily="system-ui, sans-serif">{label}</text>
            <text x={x + 11} y={y + 35} fill="#6b7280" fontSize={9}
                fontFamily="system-ui, sans-serif">{sublabel}</text>
        </g>
    )
}
