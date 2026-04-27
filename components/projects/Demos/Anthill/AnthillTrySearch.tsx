"use client"

/**
 * Try-search vignette. Pick a topic and see the planner expand into
 * sub-queries — same SSE shape `literature_search` emits.
 */

import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"

interface Topic {
    label: string
    chip: string
    query: string
    plan: string[]
}

const TOPICS: Topic[] = [
    {
        label: "Code retrieval",
        chip: "code RAG",
        query: "retrieval-augmented generation for code",
        plan: [
            "dense retrieval for code repositories",
            "RAG over function-level code chunks",
            "hybrid sparse + dense ranking for code",
            "long-context retrieval for codebases",
        ],
    },
    {
        label: "Diffusion text",
        chip: "diffusion LLMs",
        query: "diffusion language models for text generation",
        plan: [
            "score-based diffusion for discrete text",
            "non-autoregressive text generation with diffusion",
            "controllable generation via guided diffusion",
            "diffusion vs autoregressive sample quality",
        ],
    },
    {
        label: "MoE scaling",
        chip: "mixture of experts",
        query: "mixture of experts scaling laws",
        plan: [
            "sparse MoE training stability",
            "expert routing and load balancing",
            "MoE compute-optimal scaling laws",
            "fine-grained expert specialization",
        ],
    },
    {
        label: "Long-context RAG",
        chip: "long context",
        query: "long-context retrieval augmented generation",
        plan: [
            "needle-in-haystack evaluation for long context",
            "hierarchical retrieval over long documents",
            "context window expansion methods",
            "chunking strategies for long-context QA",
        ],
    },
]

export function AnthillTrySearch() {
    const [topicIndex, setTopicIndex] = useState(0)
    const [step, setStep] = useState(0)
    const [auto, setAuto] = useState(true)

    const topic = TOPICS[topicIndex]!

    useEffect(() => { setStep(0) }, [topicIndex])

    useEffect(() => {
        const total = topic.plan.length + 2
        const t = setInterval(() => {
            setStep((s) => {
                if (s >= total) {
                    if (auto) setTopicIndex((i) => (i + 1) % TOPICS.length)
                    return 0
                }
                return s + 1
            })
        }, 700)
        return () => clearInterval(t)
    }, [topic, auto])

    const visible = topic.plan.slice(0, Math.min(step, topic.plan.length))
    const planning = step <= topic.plan.length

    return (
        <Card className="overflow-hidden p-0 not-prose">
            <div className="p-4">
                {/* Topic input — looks like the real Input from agents-panel.tsx */}
                <div className="flex flex-col gap-1 mb-3">
                    <label className="text-xs text-muted-foreground">Topic</label>
                    <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50 dark:bg-input/30">
                        <Sparkles className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">{topic.query}</span>
                        <motion.span
                            className="inline-block w-[2px] h-4 bg-foreground"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                        />
                    </div>
                </div>

                {/* Planner output card */}
                <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                        {planning ? (
                            <Loader2 className="size-3.5 animate-spin text-blue-500" />
                        ) : (
                            <Sparkles className="size-3.5 text-emerald-500" />
                        )}
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {planning ? "step · planning" : "step · plan_done"}
                        </span>
                        <span className="ml-auto text-xs font-mono text-muted-foreground">gpt-4o-mini · n=4</span>
                    </div>

                    <div className="flex flex-col gap-1.5 min-h-[140px]">
                        <AnimatePresence>
                            {visible.map((q, i) => (
                                <motion.div
                                    key={`${topic.label}-${i}`}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-start gap-2 border-l border-border/60 py-0.5 pl-3 text-sm"
                                >
                                    <span className="mt-1.5 size-1 rounded-full bg-violet-500/70 shrink-0" />
                                    <span className="font-mono text-[12.5px] text-foreground/90">{q}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {planning && step > 0 && step <= topic.plan.length && (
                            <motion.div
                                key="cursor"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="font-mono text-xs text-muted-foreground pl-3"
                            >
                                ▌
                            </motion.div>
                        )}
                    </div>

                    {!planning && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground"
                        >
                            <span>4 sub-queries → Chroma top-k=8 each → merged best-per-arXiv</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-medium">→ search</span>
                        </motion.div>
                    )}
                </Card>
            </div>

            {/* Topic chips */}
            <div className="border-t bg-muted/30 px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Pick a topic</span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {TOPICS.map((t, i) => {
                        const active = i === topicIndex
                        return (
                            <button
                                key={t.label}
                                onClick={() => { setAuto(false); setTopicIndex(i); setStep(0) }}
                                className={`px-2 py-1 rounded-md border text-[11px] font-medium transition ${active
                                        ? "bg-violet-500/25 text-violet-700 dark:text-violet-100 border-violet-500"
                                        : "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30 opacity-80 hover:opacity-100"
                                    }`}
                            >
                                {t.chip}
                            </button>
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}
