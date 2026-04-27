"use client"

/**
 * Presence stack — Transit-style mode picker. Mirrors the avatars rendered
 * by the actual `web/components/editor/presence-stack.tsx` (shadcn Avatar
 * with -space-x-1.5 stacking, agents tinted + ringed).
 */

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"

type Mode = "alone" | "collab" | "agent" | "all"

interface Presence {
    id: string
    name: string
    sub?: string
    initials: string
    color: string
    isAgent?: boolean
    cursorPct?: number
}

const ALL: Record<string, Presence> = {
    me: { id: "me", name: "You", initials: "PM", color: "#10b981", cursorPct: 35 },
    sara: { id: "sara", name: "Sara Chen", sub: "co-author", initials: "SC", color: "#06b6d4", cursorPct: 62 },
    raj: { id: "raj", name: "Raj Patel", sub: "advisor", initials: "RP", color: "#f59e0b", cursorPct: 18 },
    inserter: { id: "inserter", name: "citation_inserter", sub: "agent", initials: "AI", color: "#8b5cf6", isAgent: true, cursorPct: 78 },
    review: { id: "review", name: "review_response", sub: "agent", initials: "AI", color: "#f43f5e", isAgent: true, cursorPct: 50 },
}

const MODES: Record<Mode, { label: string; ids: string[]; description: string }> = {
    alone: {
        label: "Just me",
        ids: ["me"],
        description: "One client connected. Yjs awareness map has a single entry — your cursor.",
    },
    collab: {
        label: "+ collaborator",
        ids: ["me", "sara"],
        description: "Sara joins via Hocuspocus. Two awareness entries; her cursor renders with her color.",
    },
    agent: {
        label: "+ agent",
        ids: ["me", "inserter"],
        description: "citation_inserter posts to /presence on the bridge — same awareness map, agent badge.",
    },
    all: {
        label: "Full house",
        ids: ["me", "sara", "raj", "inserter", "review"],
        description: "Two humans, two agents, one CRDT. Edits from all four converge through the same Y.transact.",
    },
}

const ORDER: Mode[] = ["alone", "collab", "agent", "all"]

export function AnthillPresence() {
    const [mode, setMode] = useState<Mode>("alone")
    const [auto, setAuto] = useState(true)

    useEffect(() => {
        if (!auto) return
        const t = setInterval(() => {
            setMode((m) => ORDER[(ORDER.indexOf(m) + 1) % ORDER.length]!)
        }, 2800)
        return () => clearInterval(t)
    }, [auto])

    const presents = MODES[mode].ids.map((id) => ALL[id]!)

    return (
        <Card className="overflow-hidden p-0 not-prose">
            {/* Faux editor strip */}
            <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
                <div className="text-sm font-medium">RAG for Code · §3 Method</div>
                <div className="flex-1" />
                <div className="flex items-center -space-x-1.5">
                    <AnimatePresence>
                        {presents.map((p, i) => (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, scale: 0.7, x: 12 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.7, x: 12 }}
                                transition={{ duration: 0.22 }}
                                className="relative group"
                                style={{ zIndex: 10 - i }}
                            >
                                <Avatar p={p} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Faux paragraph with carets */}
            <div className="p-6">
                <div className="relative rounded-md border bg-muted/30 px-4 py-5">
                    <div className="text-[14px] leading-7 text-foreground/90 relative">
                        Dense retrievers reduce hallucinations on long-tail QA by grounding generation in dense
                        retrieval. We extend this to code with an instruction-tuned encoder.
                    </div>
                    {/* Cursors absolutely positioned */}
                    <div className="absolute inset-x-4 top-5 bottom-5 pointer-events-none">
                        {presents.map((p) => p.cursorPct !== undefined && (
                            <Caret key={p.id} p={p} />
                        ))}
                    </div>
                </div>

                <div className="mt-3 text-sm text-muted-foreground leading-relaxed">{MODES[mode].description}</div>
            </div>

            {/* Mode chips */}
            <div className="border-t bg-muted/30 px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Who's connected</span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {ORDER.map((m) => {
                        const active = m === mode
                        return (
                            <button
                                key={m}
                                onClick={() => { setAuto(false); setMode(m) }}
                                className={`px-2 py-1 rounded-md border text-[11px] font-medium transition ${active
                                        ? "bg-foreground text-background border-foreground"
                                        : "bg-background text-foreground border-border hover:bg-accent"
                                    }`}
                            >
                                {MODES[m].label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}

function Avatar({ p }: { p: Presence }) {
    return (
        <div className="relative">
            {p.isAgent && (
                <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: p.color, opacity: 0.4 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
            <div
                className="relative inline-flex size-7 items-center justify-center rounded-full border-2 border-background text-[10px] font-medium text-white shadow-sm"
                style={{ backgroundColor: p.color }}
            >
                {p.initials}
            </div>
            <div className="absolute right-0 top-full mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-popover border border-border text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-md">
                {p.name}
                {p.sub && <span className="text-muted-foreground"> · {p.sub}</span>}
            </div>
        </div>
    )
}

function Caret({ p }: { p: Presence }) {
    if (p.cursorPct === undefined) return null
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute"
            style={{ left: `${p.cursorPct}%`, top: 0, height: "1.4em" }}
        >
            <motion.div
                className="absolute top-0 bottom-0 w-[2px]"
                style={{ background: p.color }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
            />
            <div
                className="absolute -top-3.5 left-0 px-1 py-[1px] rounded text-[9px] font-medium text-white whitespace-nowrap shadow"
                style={{ background: p.color }}
            >
                {p.name}
            </div>
        </motion.div>
    )
}
