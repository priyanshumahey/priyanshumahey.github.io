"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Pause, Play, RotateCcw } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useRef, useState } from "react"

// ─── Types ──────────────────────────────────────────────────────────

interface StepDef {
    id: string
    label: string
    description: string
}

interface MessagePacket {
    id: string
    from: "client" | "server"
    label: string
    color: string
    y: number
}

interface ThemeColors {
    handshakeReq: string
    handshakeRes: string
    clientMsg: string
    serverMsg: string
    ping: string
    pong: string
    close: string
    connection: string
    // SVG structural colors
    labelText: string
    timelineLine: string
}

// ─── Steps ──────────────────────────────────────────────────────────

const WEBSOCKET_STEPS: StepDef[] = [
    { id: "upgrade-req", label: "Upgrade", description: "Client sends HTTP upgrade request to establish WebSocket" },
    { id: "upgrade-res", label: "101 Switch", description: "Server responds 101 Switching Protocols — connection upgraded" },
    { id: "connected", label: "Connected", description: "Persistent full-duplex connection is now open" },
    { id: "client-msg-1", label: "Send", description: 'Client sends a message over the open connection' },
    { id: "server-msg-1", label: "Push", description: "Server pushes data — no request needed" },
    { id: "server-msg-2", label: "Push", description: "Server pushes another update instantly" },
    { id: "client-msg-2", label: "Send", description: "Client sends another message" },
    { id: "ping", label: "Ping", description: "Server sends ping to check connection health" },
    { id: "pong", label: "Pong", description: "Client responds with pong — connection alive" },
    { id: "server-msg-3", label: "Push", description: "Server pushes a real-time event" },
    { id: "close-req", label: "Close", description: "Client initiates connection close" },
    { id: "close-ack", label: "Close ACK", description: "Server acknowledges — connection gracefully closed" },
]

// ─── Colors ─────────────────────────────────────────────────────────

const DARK_COLORS: ThemeColors = {
    handshakeReq: "#60a5fa",
    handshakeRes: "#a78bfa",
    clientMsg: "#60a5fa",
    serverMsg: "#4ade80",
    ping: "#fbbf24",
    pong: "#fbbf24",
    close: "#f87171",
    connection: "#a78bfa",
    labelText: "#d4d4d8",
    timelineLine: "#27272a",
}

const LIGHT_COLORS: ThemeColors = {
    handshakeReq: "#2563eb",
    handshakeRes: "#7c3aed",
    clientMsg: "#2563eb",
    serverMsg: "#16a34a",
    ping: "#d97706",
    pong: "#d97706",
    close: "#dc2626",
    connection: "#7c3aed",
    labelText: "#3f3f46",
    timelineLine: "#d4d4d8",
}

// ─── SVG Constants ──────────────────────────────────────────────────

const SVG_W = 600
const SVG_H = 580
const CLIENT_X = 120
const SERVER_X = 480
const TIMELINE_TOP = 50
const ROW_H = 42

// ─── Helper: build packets for a step ───────────────────────────────

function getWebSocketPackets(stepIndex: number, colors: ThemeColors): MessagePacket[] {
    const packets: MessagePacket[] = []

    const allPackets: { step: number; from: "client" | "server"; label: string; color: string }[] = [
        { step: 0, from: "client", label: "GET /ws (Upgrade)", color: colors.handshakeReq },
        { step: 1, from: "server", label: "101 Switching Protocols", color: colors.handshakeRes },
        // step 2 is "connected" — no arrow, just visual state
        { step: 3, from: "client", label: '{"type": "chat", "msg": "Hi"}', color: colors.clientMsg },
        { step: 4, from: "server", label: '{"type": "update", "data": [...]}', color: colors.serverMsg },
        { step: 5, from: "server", label: '{"type": "event", "id": 42}', color: colors.serverMsg },
        { step: 6, from: "client", label: '{"type": "ack", "id": 42}', color: colors.clientMsg },
        { step: 7, from: "server", label: "ping", color: colors.ping },
        { step: 8, from: "client", label: "pong", color: colors.pong },
        { step: 9, from: "server", label: '{"type": "notify", "alert": true}', color: colors.serverMsg },
        { step: 10, from: "client", label: "close (1000)", color: colors.close },
        { step: 11, from: "server", label: "close (1000) ACK", color: colors.close },
    ]

    for (const pkt of allPackets) {
        if (stepIndex >= pkt.step) {
            packets.push({
                id: `pkt-${pkt.step}`,
                from: pkt.from,
                label: pkt.label,
                color: pkt.color,
                y: TIMELINE_TOP + pkt.step * ROW_H,
            })
        }
    }

    return packets
}

// ─── Arrow component (animated) ─────────────────────────────────────

function Arrow({
    fromX,
    toX,
    y,
    color,
    label,
    dashed,
}: {
    fromX: number
    toX: number
    y: number
    color: string
    label: string
    dashed?: boolean
}) {
    const isLeftToRight = toX > fromX
    const arrowEndX = isLeftToRight ? toX - 8 : toX + 8

    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.line
                x1={fromX}
                y1={y}
                x2={arrowEndX}
                y2={y}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={dashed ? "5 3" : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            />
            <motion.polygon
                points={
                    isLeftToRight
                        ? `${toX},${y} ${toX - 7},${y - 4} ${toX - 7},${y + 4}`
                        : `${toX},${y} ${toX + 7},${y - 4} ${toX + 7},${y + 4}`
                }
                fill={color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            />
            <motion.text
                x={(fromX + toX) / 2}
                y={y - 10}
                textAnchor="middle"
                fill={color}
                fontSize={10}
                fontFamily="ui-monospace, monospace"
                fontWeight={600}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                {label}
            </motion.text>
        </motion.g>
    )
}

// ─── Connection bracket (persistent connection visual) ──────────────

function ConnectionBracket({
    yStart,
    yEnd,
    color,
    labelText,
}: {
    yStart: number
    yEnd: number
    color: string
    labelText: string
}) {
    const midX = (CLIENT_X + SERVER_X) / 2

    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Shaded region behind the connection */}
            <motion.rect
                x={CLIENT_X + 6}
                y={yStart}
                width={SERVER_X - CLIENT_X - 12}
                height={yEnd - yStart}
                fill={color}
                opacity={0.04}
                rx={4}
                initial={{ height: 0 }}
                animate={{ height: yEnd - yStart }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {/* Left dashed border */}
            <motion.line
                x1={CLIENT_X + 6}
                y1={yStart}
                x2={CLIENT_X + 6}
                y2={yEnd}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.3}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
            />
            {/* Right dashed border */}
            <motion.line
                x1={SERVER_X - 6}
                y1={yStart}
                x2={SERVER_X - 6}
                y2={yEnd}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.3}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
            />
            {/* Label */}
            <motion.text
                x={midX}
                y={yStart - 14}
                textAnchor="middle"
                fill={color}
                fontSize={9}
                fontWeight={600}
                fontFamily="ui-monospace, monospace"
                opacity={0.6}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.3 }}
            >
                {labelText}
            </motion.text>
        </motion.g>
    )
}

// ─── Pulsing dot for active connections ─────────────────────────────

function PulsingDot({ x, y, color }: { x: number; y: number; color: string }) {
    return (
        <motion.g>
            <motion.circle
                cx={x}
                cy={y}
                r={6}
                fill={color}
                opacity={0.15}
                animate={{ r: [6, 10, 6], opacity: [0.15, 0.05, 0.15] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <circle cx={x} cy={y} r={3} fill={color} />
        </motion.g>
    )
}

// ─── Bidirectional indicator ────────────────────────────────────────

function FullDuplexIndicator({ y, color }: { y: number; color: string }) {
    const midX = (CLIENT_X + SERVER_X) / 2

    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            {/* Left arrow */}
            <motion.polygon
                points={`${midX - 58},${y} ${midX - 49},${y - 5} ${midX - 49},${y + 5}`}
                fill={color}
                opacity={0.5}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Right arrow */}
            <motion.polygon
                points={`${midX + 58},${y} ${midX + 49},${y - 5} ${midX + 49},${y + 5}`}
                fill={color}
                opacity={0.5}
                animate={{ opacity: [0.7, 0.3, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Label */}
            <motion.text
                x={midX}
                y={y + 4}
                textAnchor="middle"
                fill={color}
                fontSize={10}
                fontWeight={600}
                fontFamily="ui-monospace, monospace"
                opacity={0.5}
            >
                full duplex
            </motion.text>
        </motion.g>
    )
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════

export function WebSocketDemo() {
    const [currentStep, setCurrentStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [runId, setRunId] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    const isDark = !mounted || resolvedTheme === "dark"
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS

    const steps = WEBSOCKET_STEPS
    const clampedStep = Math.min(currentStep, steps.length - 1)
    const packets = getWebSocketPackets(clampedStep, colors)

    // ── Playback ─────────────────────────────────────────────────

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const advance = useCallback(() => {
        setCurrentStep(prev => {
            const max = steps.length - 1
            if (prev >= max) return prev
            return prev + 1
        })
    }, [steps.length])

    useEffect(() => {
        if (!isPlaying) {
            clearTimer()
            return
        }

        const safeIdx = Math.min(currentStep, steps.length - 1)
        const stepData = steps[safeIdx]
        if (!stepData) return

        if (safeIdx >= steps.length - 1) {
            timerRef.current = setTimeout(() => {
                setIsPlaying(false)
            }, 1500)
            return clearTimer
        }

        // Adjust timing by step type
        let delay = 1100
        if (stepData.id === "connected") delay = 1800
        if (stepData.id.startsWith("ping") || stepData.id.startsWith("pong")) delay = 900
        if (stepData.id.startsWith("server-msg")) delay = 1000
        if (stepData.id.startsWith("close")) delay = 1200

        timerRef.current = setTimeout(advance, delay)
        return clearTimer
    }, [isPlaying, currentStep, steps, advance, clearTimer])

    // Cleanup
    useEffect(() => clearTimer, [clearTimer])

    const handleStepClick = (index: number) => {
        clearTimer()
        setIsPlaying(false)
        setCurrentStep(index)
    }

    const togglePlay = () => {
        if (currentStep >= steps.length - 1) {
            setCurrentStep(0)
            setRunId(r => r + 1)
            setIsPlaying(true)
        } else {
            setIsPlaying(prev => !prev)
        }
    }

    const reset = () => {
        clearTimer()
        setIsPlaying(false)
        setCurrentStep(0)
        setRunId(r => r + 1)
    }

    // ── Visual state derivations ─────────────────────────────────

    const step = steps[clampedStep]

    // Connection is open from step 2 ("connected") until step 10 ("close-req")
    const isConnectionOpen = clampedStep >= 2 && clampedStep < 11
    const isConnectionClosed = clampedStep >= 11

    // Connection bracket range
    const connYStart = TIMELINE_TOP + 2 * ROW_H - 10
    const connYEnd = isConnectionClosed
        ? TIMELINE_TOP + 10 * ROW_H + 10
        : TIMELINE_TOP + clampedStep * ROW_H + 16

    // Is there a step that needs a pulsing dot?
    const isPingPong = step.id === "ping" || step.id === "pong"
    const isActive = isConnectionOpen && !isPingPong

    return (
        <div className="w-full rounded-xl overflow-hidden select-none border border-neutral-200/60 bg-[#fafaf8] dark:border-[#1a1a24] dark:bg-[#08080c] transition-colors">
            {/* ── Header ───────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200/40 bg-[#f7f7f5] dark:border-[#1a1a24] dark:bg-[#0a0a10]">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-colors ${
                        isConnectionOpen
                            ? "bg-emerald-500 animate-pulse"
                            : isConnectionClosed
                            ? "bg-red-400"
                            : "bg-zinc-400 dark:bg-zinc-600"
                    }`} />
                    <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                        WebSocket
                    </span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {isConnectionOpen ? "ws://api.example.com/ws" : isConnectionClosed ? "closed" : "connecting..."}
                    </span>
                </div>

                {/* Playback controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlay}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 dark:text-blue-400"
                    >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isPlaying ? "Pause" : clampedStep >= steps.length - 1 ? "Replay" : "Play"}
                    </button>
                    <button
                        onClick={reset}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#1a1a28] transition-colors"
                        aria-label="Reset"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ── Main SVG ─────────────────────────────────────── */}
            <div className="p-4">
                <svg
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    className="w-full h-auto"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Column labels */}
                    <text x={CLIENT_X} y={28} textAnchor="middle" fill={colors.labelText} fontSize={12} fontWeight={700} fontFamily="system-ui, sans-serif">
                        Client
                    </text>
                    <text x={SERVER_X} y={28} textAnchor="middle" fill={colors.labelText} fontSize={12} fontWeight={700} fontFamily="system-ui, sans-serif">
                        Server
                    </text>

                    {/* Vertical timelines */}
                    <line x1={CLIENT_X} y1={38} x2={CLIENT_X} y2={SVG_H - 10} stroke={colors.timelineLine} strokeWidth={1} />
                    <line x1={SERVER_X} y1={38} x2={SERVER_X} y2={SVG_H - 10} stroke={colors.timelineLine} strokeWidth={1} />

                    {/* Connection bracket — persistent connection visualization */}
                    {clampedStep >= 2 && (
                        <ConnectionBracket
                            yStart={connYStart}
                            yEnd={connYEnd}
                            color={colors.connection}
                            labelText="persistent connection"
                        />
                    )}

                    {/* Full duplex indicator when connected */}
                    {isConnectionOpen && clampedStep >= 3 && (
                        <FullDuplexIndicator
                            y={connYStart + 2}
                            color={colors.connection}
                        />
                    )}

                    {/* Arrows for packets */}
                    <AnimatePresence>
                        {packets.map(pkt => {
                            const isPingPongArrow = pkt.label === "ping" || pkt.label === "pong"
                            return (
                                <Arrow
                                    key={`ws-${runId}-${pkt.id}`}
                                    fromX={pkt.from === "client" ? CLIENT_X : SERVER_X}
                                    toX={pkt.from === "client" ? SERVER_X : CLIENT_X}
                                    y={pkt.y}
                                    color={pkt.color}
                                    label={pkt.label}
                                    dashed={isPingPongArrow}
                                />
                            )
                        })}
                    </AnimatePresence>

                    {/* Pulsing dots on both sides when connection is active */}
                    {isActive && (
                        <>
                            <PulsingDot
                                x={CLIENT_X}
                                y={TIMELINE_TOP + clampedStep * ROW_H}
                                color={colors.connection}
                            />
                            <PulsingDot
                                x={SERVER_X}
                                y={TIMELINE_TOP + clampedStep * ROW_H}
                                color={colors.connection}
                            />
                        </>
                    )}
                </svg>
            </div>

            {/* ── Step tracker / timeline ──────────────────────── */}
            <div className="px-5 pb-4">
                <div className="relative flex items-start">
                    {/* Continuous track line */}
                    <div className="absolute top-[5px] left-0 right-0 h-px bg-zinc-200 dark:bg-[#1f1f2e]" />
                    {/* Progress fill */}
                    <div
                        className="absolute top-[5px] left-0 h-px bg-zinc-400 dark:bg-zinc-600 transition-all duration-300"
                        style={{ width: steps.length > 1 ? `${(clampedStep / (steps.length - 1)) * 100}%` : '0%' }}
                    />

                    {/* Step dots + labels */}
                    <div className="relative flex justify-between w-full">
                        {steps.map((s, i) => {
                            const isActiveStep = i === clampedStep
                            const isPast = i < clampedStep
                            const isCloseStep = s.id.startsWith("close")
                            const isConnectedStep = s.id === "connected"
                            const isPushStep = s.label === "Push"

                            let activeColor = "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                            let activeTextColor = "text-blue-600 dark:text-blue-400"

                            if (isCloseStep) {
                                activeColor = "border-red-500 bg-red-500 dark:border-red-400 dark:bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.45)]"
                                activeTextColor = "text-red-600 dark:text-red-400"
                            } else if (isConnectedStep || isPushStep) {
                                activeColor = "border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.45)]"
                                activeTextColor = "text-emerald-600 dark:text-emerald-400"
                            }

                            return (
                                <button
                                    key={`ws-step-${i}`}
                                    onClick={() => handleStepClick(i)}
                                    className="group flex flex-col items-center gap-1.5 focus:outline-none z-10"
                                    aria-label={`Go to step ${i + 1}: ${s.label}`}
                                >
                                    <div
                                        className={`w-[11px] h-[11px] rounded-full border-2 transition-all duration-200 ${
                                            isActiveStep
                                                ? `${activeColor} scale-110`
                                                : isPast
                                                ? "border-zinc-400 bg-zinc-400 dark:border-zinc-500 dark:bg-zinc-500"
                                                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#08080c] group-hover:border-zinc-400 dark:group-hover:border-zinc-500"
                                        }`}
                                    />
                                    <span
                                        className={`text-[10px] leading-none transition-colors whitespace-nowrap ${
                                            isActiveStep
                                                ? `${activeTextColor} font-semibold`
                                                : isPast
                                                ? "text-zinc-500 dark:text-zinc-500"
                                                : "text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400"
                                        }`}
                                    >
                                        {s.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* ── Status bar ──────────────────────────────────── */}
            <div className="px-4 py-3 border-t border-neutral-200/40 flex items-center gap-3 bg-[#f7f7f5] dark:border-[#1a1a24] dark:bg-[#0a0a10]">
                <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                        isPlaying
                            ? "bg-emerald-500 animate-pulse"
                            : isConnectionOpen
                            ? "bg-emerald-500"
                            : isConnectionClosed
                            ? "bg-red-400"
                            : "bg-zinc-400 dark:bg-zinc-600"
                    }`}
                />
                <div className="min-w-0 flex items-center gap-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums flex-shrink-0">
                        {clampedStep + 1}/{steps.length}
                    </span>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{step.description}</span>
                </div>
            </div>
        </div>
    )
}
