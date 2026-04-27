"use client"

/**
 * The five verification states a citation node can land in. Visual
 * recreation of the real popover from `web/components/ui/citation-node.tsx`:
 *
 *   - PlateElement inline span > shadcn Popover
 *   - Trigger is a `border px-1.5 py-0 rounded-sm text-[11px] font-medium`
 *     pill with arXiv id (mono) + score% (tabular-nums) + lucide icon
 *   - PopoverContent w-[24rem] gap-3 p-3 text-xs with NiaVerification
 *
 * Tone palette is taken verbatim from the real component.
 */

import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, BadgeCheck, ExternalLink, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"

type State = "pending" | "supports" | "rejects" | "not_ready" | "error"

interface Verdict {
    state: State
    label: string
    headline: string
    quote?: string
    page?: number
    section?: string
    confidence?: number
    rationale?: string
    note?: string
    nia_ms?: number
}

const verdicts: Record<State, Verdict> = {
    pending: {
        state: "pending",
        label: "Pending",
        headline: "Verifying with Nia…",
        note: "ground_citation run created · streaming SSE events from /api/agents/runs",
    },
    supports: {
        state: "supports",
        label: "Supports",
        headline: "Supports the claim",
        quote:
            "We find that retrieval-augmented generation reduces hallucination by 39% on the long-tail subset of TriviaQA-Web compared to the no-retrieval baseline.",
        page: 7,
        section: "Methods > Architecture",
        confidence: 0.91,
        rationale: "Quote directly compares the two baselines on the cited benchmark.",
        nia_ms: 4180,
    },
    rejects: {
        state: "rejects",
        label: "Rejects",
        headline: "Does not support",
        quote:
            "We restrict our evaluation to natural-language passages and do not test the model on source code.",
        page: 12,
        section: "Limitations",
        confidence: 0.84,
        rationale:
            "Paper explicitly excludes code retrieval — the cited claim generalizes beyond what the authors measured.",
        nia_ms: 3920,
    },
    not_ready: {
        state: "not_ready",
        label: "Indexing",
        headline: "Nia is still indexing this paper",
        note: "Source ingested 11s ago. document/agent returned 0 citations + 0 confidence — recheck in a moment.",
    },
    error: {
        state: "error",
        label: "Error",
        headline: "ground_citation failed",
        note: "Bridge call timed out after 30s. The badge stays insertable — re-run from the popover.",
    },
}

// Tone classes lifted verbatim from web/components/ui/citation-node.tsx
const tone: Record<State, { badge: string; chipActive: string; dot: string; label: string; icon: typeof BadgeCheck }> = {
    pending: {
        badge: "border-primary/30 bg-primary/10 text-primary",
        chipActive: "bg-primary/15 border-primary text-foreground",
        dot: "bg-primary",
        label: "PENDING",
        icon: Loader2,
    },
    supports: {
        badge: "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        chipActive: "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-200",
        dot: "bg-emerald-500",
        label: "SUPPORTS",
        icon: BadgeCheck,
    },
    rejects: {
        badge: "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        chipActive: "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-200",
        dot: "bg-amber-500",
        label: "REJECTS",
        icon: AlertTriangle,
    },
    not_ready: {
        badge: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
        chipActive: "bg-muted text-foreground border-foreground/40",
        dot: "bg-muted-foreground",
        label: "NOT_READY",
        icon: Loader2,
    },
    error: {
        badge: "border-destructive/40 bg-destructive/10 text-destructive",
        chipActive: "bg-destructive/15 border-destructive text-destructive",
        dot: "bg-destructive",
        label: "ERROR",
        icon: AlertTriangle,
    },
}

const ORDER: State[] = ["pending", "supports", "rejects", "not_ready", "error"]

export function AnthillCitationStates() {
    const [state, setState] = useState<State>("supports")
    const [auto, setAuto] = useState(true)

    useEffect(() => {
        if (!auto) return
        const t = setInterval(() => {
            setState((s) => ORDER[(ORDER.indexOf(s) + 1) % ORDER.length]!)
        }, 3500)
        return () => clearInterval(t)
    }, [auto])

    const v = verdicts[state]
    const t = tone[state]
    const Icon = t.icon

    return (
        <Card className="overflow-hidden p-0 not-prose">
            {/* The popover, rendered out-of-context but at full size */}
            <div className="p-6 bg-muted/20">
                <div className="max-w-[28rem] mx-auto">
                    {/* Inline anchor, just for context */}
                    <div className="text-sm text-foreground/90 mb-3 leading-7">
                        …grounding generation in dense retrieval
                        <span
                            className={`inline-flex items-center gap-1 align-baseline mx-px rounded-sm border px-1.5 py-0 text-[11px] font-medium leading-tight ${t.badge} ring-2 ring-ring`}
                        >
                            {state === "pending" || state === "not_ready" ? (
                                <Loader2 className="size-3 animate-spin opacity-70" />
                            ) : (
                                <Icon className="size-3" />
                            )}
                            <span className="font-mono">[arXiv:2401.07983]</span>
                            <span className="tabular-nums opacity-70">81%</span>
                        </span>
                        .
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={state}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Popover v={v} t={t} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Chip controls */}
            <div className="flex items-center justify-between gap-3 border-t bg-background px-4 py-2.5">
                <span className="text-xs text-muted-foreground">Click a state</span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {ORDER.map((s) => {
                        const ts = tone[s]
                        const active = s === state
                        return (
                            <button
                                key={s}
                                onClick={() => { setState(s); setAuto(false) }}
                                className={`px-2 py-1 rounded-md border text-[11px] font-mono font-medium transition ${active ? ts.chipActive : `${ts.badge} opacity-80 hover:opacity-100`}`}
                            >
                                {verdicts[s].label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}

function Popover({ v, t }: { v: Verdict; t: typeof tone[State] }) {
    return (
        // mirrors PopoverContent w-[24rem] gap-3 p-3 text-xs
        <div className="w-full rounded-md border bg-popover text-popover-foreground shadow-md p-3">
            <div className="flex flex-col gap-3 text-xs">
                {/* Verdict header */}
                <div className="flex items-start gap-2">
                    <div className={`mt-0.5 size-1.5 rounded-full ${t.dot}`} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
                                {t.label}
                            </span>
                            {v.confidence !== undefined && (
                                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                                    {(v.confidence * 100).toFixed(0)}% confidence
                                </span>
                            )}
                            {v.nia_ms && (
                                <span className="ml-auto text-[10px] font-mono text-muted-foreground tabular-nums">
                                    Nia · {v.nia_ms}ms
                                </span>
                            )}
                        </div>
                        <div className="text-[13px] font-medium leading-snug mt-1">{v.headline}</div>
                    </div>
                </div>

                {/* arXiv anchor row */}
                <a
                    href="#"
                    className="group flex items-start gap-2 rounded-sm hover:bg-accent/50 -mx-1 px-1 py-0.5 transition"
                >
                    <Sparkles className="size-3.5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-snug line-clamp-2">
                            Retrieval-Augmented Generation Reduces Hallucinations in Long-Tail Question Answering
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground mt-1">
                            arXiv:2401.07983 · chunk 4 · 81% match
                        </div>
                    </div>
                    <ExternalLink className="size-3 mt-1 text-muted-foreground opacity-50 group-hover:opacity-100 transition" />
                </a>

                {v.quote && (
                    <blockquote className="border-l-2 border-border pl-2.5 text-[12px] italic text-muted-foreground leading-relaxed">
                        &ldquo;{v.quote}&rdquo;
                    </blockquote>
                )}

                {(v.page !== undefined || v.section) && (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                        {v.page !== undefined && <span>p.{v.page}</span>}
                        {v.page !== undefined && v.section && <span className="opacity-50">·</span>}
                        {v.section && <span className="truncate">{v.section}</span>}
                    </div>
                )}

                {v.rationale && (
                    <div className="text-[12px] text-foreground/80 leading-relaxed">
                        <span className="font-medium text-foreground">why: </span>
                        {v.rationale}
                    </div>
                )}

                {v.note && (
                    <div className="text-[12px] text-muted-foreground leading-relaxed">{v.note}</div>
                )}

                {/* Footer actions */}
                <div className="flex items-center justify-between border-t pt-2 -mb-1">
                    {v.state === "not_ready" || v.state === "error" ? (
                        <button className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2 text-[11px] font-medium hover:bg-accent transition">
                            <RefreshCw className="size-3" />
                            Re-check
                        </button>
                    ) : v.state === "pending" ? (
                        <span className="inline-flex h-7 items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            streaming…
                        </span>
                    ) : (
                        <button className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2 text-[11px] font-medium hover:bg-accent transition">
                            Open paper
                            <ExternalLink className="size-3" />
                        </button>
                    )}
                    <span className="text-[10px] font-mono text-muted-foreground">ground_citation</span>
                </div>
            </div>
        </div>
    )
}
