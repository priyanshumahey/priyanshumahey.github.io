"use client"

/**
 * Auto-cite — visual recreation of typing in the Plate editor.
 * Mirrors document-editor's chrome: borderless title input, sans body,
 * the ghost-text ring + the citation badge from `web/components/ui/citation-node.tsx`.
 */

import { AnimatePresence, motion } from "framer-motion"
import { BadgeCheck, Sparkles } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Card } from "@/components/ui/card"

type Phase = "typing" | "paused" | "ghost" | "inserted" | "popover"

const targetText =
    "Recent retrieval-augmented language models reduce hallucinations on long-tail factual questions by grounding generation in dense retrieval"

const candidate = {
    arxiv: "2401.07983",
    authors: "Lin et al",
    title: "Retrieval-Augmented Generation Reduces Hallucinations in Long-Tail QA",
    score: 0.812,
    tookMs: 47,
}

const otherCandidates = [
    { arxiv: "2104.08663", authors: "Thakur et al", score: 0.731 },
    { arxiv: "2004.04906", authors: "Karpukhin et al", score: 0.694 },
    { arxiv: "2305.06983", authors: "Wang et al", score: 0.612 },
]

export function AnthillAutoCiteDemo() {
    const [phase, setPhase] = useState<Phase>("typing")
    const [typed, setTyped] = useState("")
    const [popoverOpen, setPopoverOpen] = useState(false)
    const t = useRef<NodeJS.Timeout | null>(null)

    const tick = useCallback(() => {
        if (phase === "typing") {
            if (typed.length < targetText.length) {
                t.current = setTimeout(() => setTyped(targetText.slice(0, typed.length + 1)), 28)
            } else {
                t.current = setTimeout(() => setPhase("paused"), 200)
            }
        } else if (phase === "paused") {
            t.current = setTimeout(() => setPhase("ghost"), 1200)
        } else if (phase === "ghost") {
            t.current = setTimeout(() => setPhase("inserted"), 1800)
        } else if (phase === "inserted") {
            t.current = setTimeout(() => { setPopoverOpen(true); setPhase("popover") }, 1100)
        } else if (phase === "popover") {
            t.current = setTimeout(() => { setPopoverOpen(false); setTyped(""); setPhase("typing") }, 3400)
        }
    }, [phase, typed])

    useEffect(() => {
        tick()
        return () => { if (t.current) clearTimeout(t.current) }
    }, [tick])

    const showGhost = phase === "ghost"
    const showBadge = phase === "inserted" || phase === "popover"
    const charsTyped = typed.length

    return (
        <Card className="overflow-hidden p-0 not-prose">
            {/* Document chrome */}
            <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
                <div className="text-sm font-medium">3 · Method</div>
                <div className="flex-1" />
                <PhaseLabel phase={phase} chars={charsTyped} />
            </div>

            {/* Body — `div` not `p` so the popover (a `div`) can nest legally */}
            <div className="px-8 py-8 mx-auto max-w-2xl text-[15px] leading-7">
                <div>
                    {typed}
                    {showBadge && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                            className="relative inline-flex"
                        >
                            <span className="inline-flex items-center gap-1 align-baseline mx-px rounded-sm border px-1.5 py-0 text-[11px] font-medium leading-tight border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                <BadgeCheck className="size-3" />
                                <span className="font-mono">[arXiv:{candidate.arxiv}]</span>
                                <span className="tabular-nums opacity-70">{Math.round(candidate.score * 100)}%</span>
                            </span>
                            <AnimatePresence>
                                {popoverOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className="absolute top-full left-0 mt-2 w-[24rem] rounded-md border bg-popover text-popover-foreground shadow-md p-3 z-10"
                                    >
                                        <div className="flex flex-col gap-3 text-xs">
                                            <a className="group flex items-start gap-2">
                                                <Sparkles className="size-3.5 mt-0.5 text-muted-foreground" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm leading-snug line-clamp-2">{candidate.title}</div>
                                                    <div className="font-mono text-[10px] text-muted-foreground mt-1">
                                                        arXiv:{candidate.arxiv} · chunk 4 · {Math.round(candidate.score * 100)}% match
                                                    </div>
                                                </div>
                                            </a>
                                            <div className="border-t -mx-3 my-0" />
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">
                                                    Trace · top-k=5
                                                </div>
                                                <div className="flex flex-col gap-1 text-[11px]">
                                                    <CandRow {...candidate} top />
                                                    {otherCandidates.map((c) => <CandRow key={c.arxiv} {...c} />)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground border-t pt-2 -mb-1">
                                                <span>Harrier 270M · cosine</span>
                                                <span>{candidate.tookMs}ms</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.span>
                    )}
                    <span>.</span>
                    {(phase === "typing" || phase === "paused") && (
                        <motion.span
                            className="inline-block w-[2px] h-[1em] bg-foreground align-middle ml-[1px]"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        />
                    )}
                    <AnimatePresence>
                        {showGhost && (
                            <motion.span
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -4 }}
                                className="inline-flex items-center gap-1 align-baseline ml-1.5 rounded-sm border px-1.5 py-0 text-[11px] font-medium leading-tight border-primary/30 bg-primary/10 text-primary"
                            >
                                <Sparkles className="size-3" />
                                <span className="font-mono">[arXiv:{candidate.arxiv}]</span>
                                <span className="opacity-70">{candidate.authors}</span>
                                <kbd className="ml-1 rounded border bg-background/40 px-1 py-0 text-[9.5px] font-mono">Tab</kbd>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Param strip */}
            <div className="border-t bg-muted/30 px-4 py-2.5 grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <Param label="debounceMs" value="1200" active={phase === "paused"} />
                <Param label="minChars" value="30" active={charsTyped >= 30 && phase !== "popover"} />
                <Param label="topK" value="5" active={phase === "ghost" || showBadge} />
                <Param label="minScore" value="0.55" />
                <Param label="scoreGap" value="0.08" />
            </div>
        </Card>
    )
}

function CandRow({ arxiv, authors, score, top }: { arxiv: string; authors: string; score: number; top?: boolean }) {
    return (
        <div className={`flex items-center gap-2 ${top ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>
            <span className="size-1 rounded-full bg-current opacity-70" />
            <span className="flex-1 truncate font-mono">arXiv:{arxiv} · {authors}</span>
            <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-current opacity-70" style={{ width: `${score * 100}%` }} />
            </div>
            <span className="tabular-nums w-10 text-right">{score.toFixed(2)}</span>
        </div>
    )
}

function PhaseLabel({ phase, chars }: { phase: Phase; chars: number }) {
    const labels: Record<Phase, { text: string; color: string }> = {
        typing: { text: `typing · ${chars}/30 chars`, color: "bg-muted-foreground" },
        paused: { text: "1.2s debounce", color: "bg-amber-500" },
        ghost: { text: "POST /api/citations/suggest", color: "bg-blue-500" },
        inserted: { text: "Tab → appendInline citation", color: "bg-emerald-500" },
        popover: { text: "trace popover open", color: "bg-violet-500" },
    }
    const l = labels[phase]
    return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <motion.div
                className={`size-1.5 rounded-full ${l.color}`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="font-mono">{l.text}</span>
        </div>
    )
}

function Param({ label, value, active }: { label: string; value: string; active?: boolean }) {
    return (
        <div className={`px-2.5 py-1.5 rounded-md border ${active ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-background/50"}`}>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</div>
            <div className={`font-mono text-[12px] tabular-nums ${active ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"}`}>{value}</div>
        </div>
    )
}
