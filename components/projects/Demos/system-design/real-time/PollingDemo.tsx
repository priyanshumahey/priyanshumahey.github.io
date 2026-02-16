"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Pause, Play, RotateCcw } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useRef, useState } from "react"

// ─── Types ──────────────────────────────────────────────────────────

type PollingMode = "short" | "long"

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
    y: number // vertical position in svg
}

interface ThemeColors {
    request: string
    responseEmpty: string
    responseData: string
    hold: string
    wait: string
    // SVG structural colors
    labelText: string
    timelineLine: string
}

// ─── Steps ──────────────────────────────────────────────────────────

const SHORT_POLLING_STEPS: StepDef[] = [
    { id: "request-1", label: "Request", description: "Client sends request — any new data?" },
    { id: "response-1", label: "No data", description: "Server responds immediately — nothing new" },
    { id: "wait", label: "Wait", description: "Client waits a fixed interval before asking again" },
    { id: "request-2", label: "Request", description: "Client sends another request" },
    { id: "response-2", label: "No data", description: "Server responds — still nothing" },
    { id: "wait-2", label: "Wait", description: "Client waits again" },
    { id: "request-3", label: "Request", description: "Client sends another request" },
    { id: "response-3", label: "Data!", description: "Server has new data — returns it immediately" },
]

const LONG_POLLING_STEPS: StepDef[] = [
    { id: "request-1", label: "Request", description: "Client sends request — any new data?" },
    { id: "hold", label: "Holding", description: "Server holds connection open — waiting for data..." },
    { id: "still-waiting", label: "Still waiting", description: "Connection stays open — no data yet" },
    { id: "response-1", label: "Data!", description: "New data arrives — server responds immediately" },
    { id: "request-2", label: "Reconnect", description: "Client immediately sends a new request" },
    { id: "hold-2", label: "Holding", description: "Server holds connection open again" },
    { id: "response-2", label: "Data!", description: "More data arrives — server pushes it back" },
]

// ─── Colors ─────────────────────────────────────────────────────────

const DARK_COLORS: ThemeColors = {
    request: "#60a5fa",       // brighter blue for dark bg
    responseEmpty: "#737373",
    responseData: "#4ade80",  // brighter green
    hold: "#fbbf24",
    wait: "#9ca3af",
    labelText: "#d4d4d8",
    timelineLine: "#27272a",
}

const LIGHT_COLORS: ThemeColors = {
    request: "#2563eb",
    responseEmpty: "#6b7280",
    responseData: "#16a34a",
    hold: "#d97706",
    wait: "#6b7280",
    labelText: "#3f3f46",
    timelineLine: "#d4d4d8",
}

// ─── SVG Constants ──────────────────────────────────────────────────

const SVG_W = 600
const SVG_H = 340
const CLIENT_X = 120
const SERVER_X = 480
const TIMELINE_TOP = 50
const ROW_H = 36

// ─── Helper: build packets for a step ───────────────────────────────

function getShortPollingPackets(stepIndex: number, colors: ThemeColors): MessagePacket[] {
    const packets: MessagePacket[] = []
    const pairs: { req: number; res: number; hasData: boolean }[] = [
        { req: 0, res: 1, hasData: false },
        { req: 3, res: 4, hasData: false },
        { req: 6, res: 7, hasData: true },
    ]

    for (const pair of pairs) {
        if (stepIndex >= pair.req) {
            packets.push({
                id: `req-${pair.req}`,
                from: "client",
                label: "GET /updates",
                color: colors.request,
                y: TIMELINE_TOP + pair.req * ROW_H,
            })
        }
        if (stepIndex >= pair.res) {
            packets.push({
                id: `res-${pair.res}`,
                from: "server",
                label: pair.hasData ? '{"msg": "Hi!"}' : "204 No Content",
                color: pair.hasData ? colors.responseData : colors.responseEmpty,
                y: TIMELINE_TOP + pair.res * ROW_H,
            })
        }
    }
    return packets
}

function getLongPollingPackets(stepIndex: number, colors: ThemeColors): MessagePacket[] {
    const packets: MessagePacket[] = []

    // First cycle
    if (stepIndex >= 0) {
        packets.push({
            id: "req-0",
            from: "client",
            label: "GET /subscribe",
            color: colors.request,
            y: TIMELINE_TOP + 0 * ROW_H,
        })
    }
    if (stepIndex >= 3) {
        packets.push({
            id: "res-3",
            from: "server",
            label: '{"msg": "Hi!"}',
            color: colors.responseData,
            y: TIMELINE_TOP + 3 * ROW_H,
        })
    }

    // Second cycle
    if (stepIndex >= 4) {
        packets.push({
            id: "req-4",
            from: "client",
            label: "GET /subscribe",
            color: colors.request,
            y: TIMELINE_TOP + 4 * ROW_H,
        })
    }
    if (stepIndex >= 6) {
        packets.push({
            id: "res-6",
            from: "server",
            label: '{"event": "update"}',
            color: colors.responseData,
            y: TIMELINE_TOP + 6 * ROW_H,
        })
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
}: {
    fromX: number
    toX: number
    y: number
    color: string
    label: string
}) {
    const isLeftToRight = toX > fromX
    const arrowEndX = isLeftToRight ? toX - 8 : toX + 8

    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Arrow line */}
            <motion.line
                x1={fromX}
                y1={y}
                x2={arrowEndX}
                y2={y}
                stroke={color}
                strokeWidth={2}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* Arrowhead */}
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
            {/* Label */}
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

// ─── Hold/Wait bracket ──────────────────────────────────────────────

function HoldBracket({
    x,
    yStart,
    yEnd,
    color,
    label,
    side,
}: {
    x: number
    yStart: number
    yEnd: number
    color: string
    label: string
    side: "client" | "server"
}) {
    const offset = side === "server" ? 20 : -20
    const bx = x + offset

    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {/* Vertical dashed line */}
            <motion.line
                x1={bx}
                y1={yStart + 6}
                x2={bx}
                y2={yEnd - 6}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="3 3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
            />
            {/* Top tick */}
            <line x1={bx - 4} y1={yStart + 6} x2={bx + 4} y2={yStart + 6} stroke={color} strokeWidth={1} />
            {/* Bottom tick */}
            <line x1={bx - 4} y1={yEnd - 6} x2={bx + 4} y2={yEnd - 6} stroke={color} strokeWidth={1} />
            {/* Label */}
            <motion.text
                x={bx + (side === "server" ? 10 : -10)}
                y={(yStart + yEnd) / 2 + 3}
                textAnchor={side === "server" ? "start" : "end"}
                fill={color}
                fontSize={9}
                fontWeight={500}
                fontFamily="ui-monospace, monospace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ delay: 0.3 }}
            >
                {label}
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

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════

export function PollingDemo() {
    const [mode, setMode] = useState<PollingMode>("short")
    const [currentStep, setCurrentStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [runId, setRunId] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    const isDark = !mounted || resolvedTheme === "dark"
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS

    const steps = mode === "short" ? SHORT_POLLING_STEPS : LONG_POLLING_STEPS
    const clampedStep = Math.min(currentStep, steps.length - 1)
    const packets = mode === "short"
        ? getShortPollingPackets(clampedStep, colors)
        : getLongPollingPackets(clampedStep, colors)

    // ── Playback ─────────────────────────────────────────────────

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const advance = useCallback(() => {
        setCurrentStep(prev => {
            const max = (mode === "short" ? SHORT_POLLING_STEPS : LONG_POLLING_STEPS).length - 1
            if (prev >= max) return prev
            return prev + 1
        })
    }, [mode])

    useEffect(() => {
        if (!isPlaying) {
            clearTimer()
            return
        }

        const safeIdx = Math.min(currentStep, steps.length - 1)
        const stepData = steps[safeIdx]
        if (!stepData) return

        // If we've reached the last step, hold for a beat then stop
        if (safeIdx >= steps.length - 1) {
            timerRef.current = setTimeout(() => {
                setIsPlaying(false)
            }, 1500)
            return clearTimer
        }

        // Adjust timing by step type
        let delay = 1200
        if (stepData.id.startsWith("wait")) delay = 1600
        if (stepData.id.startsWith("hold") || stepData.id === "still-waiting") delay = 1800
        if (stepData.id.startsWith("response") || stepData.id.startsWith("request")) delay = 1100

        timerRef.current = setTimeout(advance, delay)
        return clearTimer
    }, [isPlaying, currentStep, steps, advance, clearTimer])

    // Auto-play when mode changes
    const isFirstRender = useRef(true)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        clearTimer()
        setCurrentStep(0)
        setRunId(r => r + 1)
        // Small delay so the SVG resets before playback starts
        const t = setTimeout(() => setIsPlaying(true), 150)
        return () => clearTimeout(t)
    }, [mode, clearTimer])

    // Cleanup
    useEffect(() => clearTimer, [clearTimer])

    const handleStepClick = (index: number) => {
        clearTimer()
        setIsPlaying(false)
        setCurrentStep(index)
    }

    const togglePlay = () => {
        if (currentStep >= steps.length - 1) {
            // Restart from beginning with fresh SVG
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

    // ── Determine which SVG elements to show ─────────────────────

    const step = steps[clampedStep]

    // Short polling: show wait brackets
    const shortWaitBrackets: { yStart: number; yEnd: number }[] = []
    if (mode === "short") {
        if (clampedStep >= 2) {
            shortWaitBrackets.push({
                yStart: TIMELINE_TOP + 1 * ROW_H,
                yEnd: TIMELINE_TOP + 3 * ROW_H,
            })
        }
        if (clampedStep >= 5) {
            shortWaitBrackets.push({
                yStart: TIMELINE_TOP + 4 * ROW_H,
                yEnd: TIMELINE_TOP + 6 * ROW_H,
            })
        }
    }

    // Long polling: show hold brackets
    const longHoldBrackets: { yStart: number; yEnd: number }[] = []
    if (mode === "long") {
        if (clampedStep >= 1 && clampedStep <= 3) {
            longHoldBrackets.push({
                yStart: TIMELINE_TOP + 0 * ROW_H,
                yEnd: TIMELINE_TOP + 3 * ROW_H,
            })
        } else if (clampedStep > 3) {
            longHoldBrackets.push({
                yStart: TIMELINE_TOP + 0 * ROW_H,
                yEnd: TIMELINE_TOP + 3 * ROW_H,
            })
        }
        if (clampedStep >= 5) {
            longHoldBrackets.push({
                yStart: TIMELINE_TOP + 4 * ROW_H,
                yEnd: TIMELINE_TOP + 6 * ROW_H,
            })
        }
    }

    // Is there an active pulsing connection?
    const isHolding =
        (mode === "long" && (step.id === "hold" || step.id === "still-waiting" || step.id === "hold-2")) ||
        (mode === "short" && (step.id === "wait" || step.id === "wait-2"))

    return (
        <div className="w-full rounded-xl overflow-hidden select-none border border-neutral-200/60 bg-[#fafaf8] dark:border-[#1a1a24] dark:bg-[#08080c] transition-colors">
            {/* ── Header: mode toggle + controls ───────────────── */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200/40 bg-[#f7f7f5] dark:border-[#1a1a24] dark:bg-[#0a0a10]">
                {/* Mode toggle — underline tab style */}
                <div className="flex items-center gap-1">
                    {(["short", "long"] as PollingMode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`relative px-3 py-2 text-[13px] font-medium transition-colors border-0 ${
                                mode === m
                                    ? "text-zinc-900 dark:text-zinc-100"
                                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                            }`}
                        >
                            {m === "short" ? "Short Polling" : "Long Polling"}
                            {mode === m && (
                                <motion.div
                                    layoutId="polling-tab-indicator"
                                    className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-blue-500 dark:bg-blue-400"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
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

            {/* ── Main content ─────────────────────────────────── */}
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

                    {/* Arrows for packets */}
                    <AnimatePresence>
                        {packets.map(pkt => (
                            <Arrow
                                key={`${mode}-${runId}-${pkt.id}`}
                                fromX={pkt.from === "client" ? CLIENT_X : SERVER_X}
                                toX={pkt.from === "client" ? SERVER_X : CLIENT_X}
                                y={pkt.y}
                                color={pkt.color}
                                label={pkt.label}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Wait brackets (short polling) */}
                    {shortWaitBrackets.map((b, i) => (
                        <HoldBracket
                            key={`wait-${i}`}
                            x={CLIENT_X}
                            yStart={b.yStart}
                            yEnd={b.yEnd}
                            color={colors.wait}
                            label="wait interval"
                            side="client"
                        />
                    ))}

                    {/* Hold brackets (long polling) */}
                    {longHoldBrackets.map((b, i) => (
                        <HoldBracket
                            key={`hold-${i}`}
                            x={SERVER_X}
                            yStart={b.yStart}
                            yEnd={b.yEnd}
                            color={colors.hold}
                            label="connection held"
                            side="server"
                        />
                    ))}

                    {/* Pulsing dot on active side */}
                    {isHolding && mode === "long" && (
                        <PulsingDot
                            x={SERVER_X}
                            y={TIMELINE_TOP + clampedStep * ROW_H}
                            color={colors.hold}
                        />
                    )}
                    {isHolding && mode === "short" && (
                        <PulsingDot
                            x={CLIENT_X}
                            y={TIMELINE_TOP + clampedStep * ROW_H}
                            color={colors.wait}
                        />
                    )}
                </svg>
            </div>

            {/* ── Step tracker / timeline ──────────────────────── */}
            <div className="px-5 pb-4">
                <div className="relative flex items-start">
                    {/* Continuous track line behind everything */}
                    <div className="absolute top-[5px] left-0 right-0 h-px bg-zinc-200 dark:bg-[#1f1f2e]" />
                    {/* Progress fill */}
                    <div
                        className="absolute top-[5px] left-0 h-px bg-zinc-400 dark:bg-zinc-600 transition-all duration-300"
                        style={{ width: steps.length > 1 ? `${(clampedStep / (steps.length - 1)) * 100}%` : '0%' }}
                    />

                    {/* Step dots + labels */}
                    <div className="relative flex justify-between w-full">
                        {steps.map((s, i) => {
                            const isActive = i === clampedStep
                            const isPast = i < clampedStep
                            const isDataStep = s.label === "Data!"

                            return (
                                <button
                                    key={`${mode}-step-${i}`}
                                    onClick={() => handleStepClick(i)}
                                    className="group flex flex-col items-center gap-1.5 focus:outline-none z-10"
                                    aria-label={`Go to step ${i + 1}: ${s.label}`}
                                >
                                    <div
                                        className={`w-[11px] h-[11px] rounded-full border-2 transition-all duration-200 ${
                                            isActive
                                                ? isDataStep
                                                    ? "border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.45)] scale-110"
                                                    : "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.4)] scale-110"
                                                : isPast
                                                ? "border-zinc-400 bg-zinc-400 dark:border-zinc-500 dark:bg-zinc-500"
                                                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#08080c] group-hover:border-zinc-400 dark:group-hover:border-zinc-500"
                                        }`}
                                    />
                                    <span
                                        className={`text-[11px] leading-none transition-colors whitespace-nowrap ${
                                            isActive
                                                ? isDataStep
                                                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                                    : "text-blue-600 dark:text-blue-400 font-semibold"
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
                            : step.label === "Data!"
                            ? "bg-emerald-500"
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
