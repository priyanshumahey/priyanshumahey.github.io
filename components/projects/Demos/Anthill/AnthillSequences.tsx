"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export type SequenceMessage = {
    from: string
    to: string
    label: string
    note?: string
    color?: string
    style?: "solid" | "dashed" | "loop"
}

export type SequenceLane = {
    id: string
    title: string
    sub?: string
    color: string
}

/**
 * A small UML-sequence-style diagram with auto-playing message highlights.
 * Used for the Anthill bridge / Nia / review_response flows.
 */
export function AnthillSequence({
    lanes,
    messages,
    width,
    laneTopY = 70,
    laneSpacing = 64,
    minLaneWidth = 150,
}: {
    lanes: SequenceLane[]
    messages: SequenceMessage[]
    width?: number
    laneTopY?: number
    laneSpacing?: number
    minLaneWidth?: number
}) {
    const [active, setActive] = useState<number>(-1)

    useEffect(() => {
        const t = setInterval(() => {
            setActive((i) => {
                if (i >= messages.length - 1) return -1
                return i + 1
            })
        }, 1000)
        return () => clearInterval(t)
    }, [messages.length])

    const laneCount = lanes.length
    // Auto-size width so every lane has at least `minLaneWidth` of slot space.
    const computedWidth = Math.max(width ?? 0, laneCount * minLaneWidth + 40)
    const laneWidth = (computedWidth - 40) / laneCount
    // Lane head sits inside its slot with a 14px breathing margin on each side.
    const headHalfWidth = Math.min(80, Math.max(50, laneWidth / 2 - 14))
    const laneCenter = (idx: number) => 20 + laneWidth * idx + laneWidth / 2
    const laneIdx = (id: string) => lanes.findIndex((l) => l.id === id)

    const totalHeight = laneTopY + 30 + messages.length * laneSpacing + 30

    return (
        <div className="w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs not-prose">
            <div className="p-4 bg-[#08080c] dark:bg-[#08080c] overflow-x-auto">
                <svg viewBox={`0 0 ${computedWidth} ${totalHeight}`} className="h-auto" style={{ minWidth: computedWidth, width: "100%" }}>
                    {/* Lane heads */}
                    {lanes.map((l, i) => (
                        <g key={l.id}>
                            <rect
                                x={laneCenter(i) - headHalfWidth} y={20} width={headHalfWidth * 2} height={40} rx={8}
                                fill="#0c0c14" stroke={l.color} strokeWidth={1.5}
                            />
                            <text x={laneCenter(i)} y={l.sub ? 36 : 44} fill="white" fontSize={11} fontWeight={600}
                                textAnchor="middle" fontFamily="system-ui">
                                {l.title}
                            </text>
                            {l.sub && (
                                <text x={laneCenter(i)} y={51} fill="#6b7280" fontSize={9}
                                    textAnchor="middle" fontFamily="system-ui">
                                    {l.sub}
                                </text>
                            )}
                            {/* lifeline */}
                            <line x1={laneCenter(i)} y1={laneTopY} x2={laneCenter(i)} y2={totalHeight - 20}
                                stroke="#1a1a28" strokeWidth={1} strokeDasharray="3 3" />
                        </g>
                    ))}

                    {/* Messages */}
                    {messages.map((m, i) => {
                        const y = laneTopY + 20 + i * laneSpacing
                        const fromIdx = laneIdx(m.from)
                        const toIdx = laneIdx(m.to)
                        if (fromIdx < 0 || toIdx < 0) return null
                        const isActive = active === i
                        const color = m.color ?? lanes[fromIdx].color
                        const dashed = m.style === "dashed"

                        if (m.style === "loop" || fromIdx === toIdx) {
                            // self-loop. Flip to the left when there's not enough room
                            // on the right (rightmost lane), so the loop and label
                            // stay inside the SVG.
                            const cx = laneCenter(fromIdx)
                            const flip = fromIdx === laneCount - 1
                            const sign = flip ? -1 : 1
                            return (
                                <g key={i}>
                                    <path
                                        d={`M ${cx} ${y} C ${cx + sign * 60} ${y}, ${cx + sign * 60} ${y + 24}, ${cx} ${y + 24}`}
                                        fill="none"
                                        stroke={isActive ? color : "#1a1a28"}
                                        strokeWidth={isActive ? 2 : 1.5}
                                        strokeDasharray={dashed ? "4 4" : undefined}
                                    />
                                    <ArrowHead x={cx} y={y + 24} dir={flip ? "right" : "left"} color={isActive ? color : "#1a1a28"} />
                                    <text x={cx + sign * 70} y={y + 16} fill={isActive ? "white" : "#9ca3af"} fontSize={10}
                                        fontFamily="ui-monospace, monospace"
                                        textAnchor={flip ? "end" : "start"}>
                                        {m.label}
                                    </text>
                                </g>
                            )
                        }

                        const x1 = laneCenter(fromIdx)
                        const x2 = laneCenter(toIdx)
                        const goingRight = x2 > x1
                        return (
                            <g key={i}>
                                <line
                                    x1={x1} y1={y} x2={x2 + (goingRight ? -8 : 8)} y2={y}
                                    stroke={isActive ? color : "#1a1a28"}
                                    strokeWidth={isActive ? 2 : 1.5}
                                    strokeDasharray={dashed ? "4 4" : undefined}
                                />
                                <ArrowHead x={x2} y={y} dir={goingRight ? "right" : "left"} color={isActive ? color : "#1a1a28"} />
                                {/* moving particle when active */}
                                {isActive && (
                                    <motion.circle
                                        r={4}
                                        fill={color}
                                        initial={{ cx: x1, cy: y, opacity: 0 }}
                                        animate={{ cx: x2 + (goingRight ? -8 : 8), cy: y, opacity: 1 }}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                    />
                                )}
                                <text
                                    x={(x1 + x2) / 2} y={y - 6}
                                    fill={isActive ? "white" : "#9ca3af"}
                                    fontSize={10}
                                    fontFamily="ui-monospace, monospace"
                                    textAnchor="middle"
                                >
                                    {m.label}
                                </text>
                                {m.note && (
                                    <text
                                        x={(x1 + x2) / 2} y={y + 14}
                                        fill="#6b7280" fontSize={8.5}
                                        fontFamily="system-ui"
                                        textAnchor="middle"
                                    >
                                        {m.note}
                                    </text>
                                )}
                            </g>
                        )
                    })}
                </svg>
            </div>
        </div>
    )
}

function ArrowHead({ x, y, dir, color }: { x: number; y: number; dir: "left" | "right"; color: string }) {
    const sign = dir === "right" ? -1 : 1
    return (
        <polygon
            points={`${x},${y} ${x + sign * 7},${y - 4} ${x + sign * 7},${y + 4}`}
            fill={color}
        />
    )
}

/* -------------------- Bridge sequence (auto-cite + agent edits) -------------------- */
export function AnthillBridgeSequence() {
    const lanes: SequenceLane[] = [
        { id: "human", title: "Human", sub: "Plate", color: "#22c55e" },
        { id: "hocus", title: "Hocuspocus", sub: "Yjs sync", color: "#06b6d4" },
        { id: "bridge", title: "Bridge", sub: ":8889", color: "#8b5cf6" },
        { id: "agent", title: "citation_inserter", sub: "agent", color: "#ec4899" },
    ]
    const messages: SequenceMessage[] = [
        { from: "human", to: "hocus", label: "types paragraph (Yjs delta)" },
        { from: "agent", to: "bridge", label: "GET /snapshot" },
        { from: "bridge", to: "hocus", label: "openDirectConnection (warm)" },
        { from: "hocus", to: "bridge", label: "Y.Doc handle", style: "dashed" },
        { from: "bridge", to: "agent", label: "{ blocks, baseRevision }", style: "dashed" },
        { from: "agent", to: "agent", label: "embed → top-k chunks", style: "loop" },
        { from: "agent", to: "bridge", label: "POST /edit appendInline citation", note: "+ Idempotency-Key, baseRevision" },
        { from: "bridge", to: "hocus", label: "Y.transact (origin = ai:agent)" },
        { from: "hocus", to: "human", label: "Yjs update over WS" },
        { from: "bridge", to: "agent", label: "{ applied: 1, newRefs: [c1] }", style: "dashed" },
    ]
    return <AnthillSequence lanes={lanes} messages={messages} minLaneWidth={170} />
}

/* -------------------- Nia verification sequence -------------------- */
export function AnthillNiaSequence() {
    const lanes: SequenceLane[] = [
        { id: "editor", title: "Editor", color: "#22c55e" },
        { id: "web", title: "/api/agents/runs", sub: "Next.js", color: "#fb923c" },
        { id: "agent", title: "ground_citation", color: "#ec4899" },
        { id: "cache", title: "nia_cache", sub: "sqlite", color: "#a855f7" },
        { id: "nia", title: "Nia v2", color: "#10b981" },
    ]
    const messages: SequenceMessage[] = [
        { from: "editor", to: "web", label: "POST { agent, input: {arxiv_id, claim} }" },
        { from: "web", to: "agent", label: "create run → run_id" },
        { from: "editor", to: "web", label: "SSE /runs/:id/events", style: "dashed" },
        { from: "agent", to: "cache", label: "lookup arxiv_id" },
        { from: "agent", to: "nia", label: "GET /sources (dedup)", note: "skip if cached" },
        { from: "agent", to: "nia", label: "POST /document/agent (json_schema)" },
        { from: "nia", to: "agent", label: "{ supports, quote, page, conf }", style: "dashed" },
        { from: "agent", to: "web", label: "SSE finding kind=grounded_citation", style: "dashed" },
        { from: "web", to: "editor", label: "patch citation node verification", style: "dashed" },
    ]
    return <AnthillSequence lanes={lanes} messages={messages} minLaneWidth={170} />
}

/* -------------------- Review-response sequence -------------------- */
export function AnthillReviewSequence() {
    const lanes: SequenceLane[] = [
        { id: "rev", title: "Reviewer", color: "#22c55e" },
        { id: "mail", title: "AgentMail", sub: "anthill@…", color: "#f43f5e" },
        { id: "watch", title: "watch_inbox.py", color: "#fb923c" },
        { id: "agent", title: "review_response", color: "#ec4899" },
        { id: "claude", title: "Claude", color: "#a855f7" },
        { id: "bridge", title: "Bridge → Editor", color: "#8b5cf6" },
    ]
    const messages: SequenceMessage[] = [
        { from: "rev", to: "mail", label: "sends review email" },
        { from: "watch", to: "mail", label: "list_messages (poll 5s)", style: "dashed" },
        { from: "mail", to: "watch", label: "new message_id", style: "dashed" },
        { from: "watch", to: "agent", label: "POST /agents/runs (doc, message)" },
        { from: "agent", to: "mail", label: "get_message" },
        { from: "agent", to: "bridge", label: "GET /snapshot → blocks" },
        { from: "agent", to: "claude", label: "prompt(review + blocks)" },
        { from: "claude", to: "agent", label: "{ actions: [edit b3, comment b7, …] }", style: "dashed" },
        { from: "agent", to: "bridge", label: "POST /edit addNote (× N)", note: "Idempotency-Key per anchor" },
        { from: "bridge", to: "rev", label: "(optional) reply with summary", style: "dashed" },
    ]
    return <AnthillSequence lanes={lanes} messages={messages} minLaneWidth={160} />
}
