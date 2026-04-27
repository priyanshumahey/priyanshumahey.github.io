"use client"

/**
 * Literature search — recreates the actual run-detail page layout from
 * `web/components/agent-run-detail.tsx`:
 *   - Header strip: agent name (text-lg font-medium), AgentStatusBadge,
 *     live pip (size-2 rounded-full bg-emerald-500 animate-pulse), short
 *     run id (font-mono text-xs text-muted-foreground)
 *   - Two-column split: <Card className="h-[70vh] flex flex-col p-0">
 *       header (border-b px-4 py-2) + scroll area (flex-1 overflow-y-auto)
 *   - Trace pane uses EventRow w/ KIND_ICONS
 *   - Findings pane uses FindingCard w/ tabular-nums score badges
 */

import { motion } from "framer-motion"
import { CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"

type EventKind = "status" | "log" | "step" | "finding"

interface RunEvent {
    at: string
    kind: EventKind
    step?: string
    message: string
    payload?: Record<string, unknown>
}

const events: RunEvent[] = [
    { at: "10:14:01.220", kind: "status", message: "Run created", payload: { status: "running" } },
    { at: "10:14:01.310", kind: "step", step: "plan", message: "Planning sub-queries via gpt-4o-mini" },
    { at: "10:14:02.402", kind: "step", step: "plan_done", message: "4 sub-queries", payload: { queries: 4 } },
    { at: "10:14:02.450", kind: "step", step: "discover", message: "Asking arXiv for ≤5 unseen papers" },
    { at: "10:14:03.110", kind: "step", step: "discover_candidates", message: "arXiv returned 14 candidates · 9 already in corpus" },
    { at: "10:14:03.510", kind: "step", step: "discover_ingest", message: "Indexing arXiv:2401.12345 (12 chunks)", payload: { chunks: 12, took_ms: 410 } },
    { at: "10:14:03.802", kind: "step", step: "discover_ingest", message: "Indexing arXiv:2403.09876 (8 chunks)", payload: { chunks: 8, took_ms: 290 } },
    { at: "10:14:04.327", kind: "step", step: "discover_ingest", message: "Indexing arXiv:2402.01234 (15 chunks)", payload: { chunks: 15, took_ms: 520 } },
    { at: "10:14:04.418", kind: "step", step: "discover_done", message: "+3 papers · corpus now 1,037" },
    { at: "10:14:04.502", kind: "step", step: "search", message: "Querying Chroma per sub-query (k=8)" },
    { at: "10:14:05.190", kind: "step", step: "rank", message: "Merged → 12 unique papers" },
]

interface Finding {
    rank: number
    arxiv_id: string
    title: string
    chunk_index: number
    score: number
    matched_query: string
    newly_indexed?: boolean
    text: string
}

const findings: Finding[] = [
    {
        rank: 1,
        arxiv_id: "2401.12345",
        title: "Code-RAG: Retrieval over Source Code with Span Embeddings",
        chunk_index: 4,
        score: 0.87,
        matched_query: "GNN representations of ASTs",
        newly_indexed: true,
        text: "We present a span-level retrieval system for source code that operates on tree-sitter ASTs at function granularity, jointly indexed with their natural-language documentation…",
    },
    {
        rank: 2,
        arxiv_id: "2305.06983",
        title: "CodeT5+: Open Code LLMs for Understanding & Generation",
        chunk_index: 7,
        score: 0.82,
        matched_query: "graph neural networks for code",
        text: "CodeT5+ extends the T5 family with a code-specific pretraining objective combining masked span prediction…",
    },
    {
        rank: 3,
        arxiv_id: "2403.09876",
        title: "Hybrid Sparse-Dense Retrieval for Long Code Contexts",
        chunk_index: 1,
        score: 0.79,
        matched_query: "heterogeneous code graph embeddings",
        newly_indexed: true,
        text: "We propose a two-stage retriever that fuses BM25 with a learned dense encoder…",
    },
    {
        rank: 4,
        arxiv_id: "2104.08663",
        title: "BEIR: Heterogenous Benchmark for Zero-Shot IR",
        chunk_index: 12,
        score: 0.74,
        matched_query: "graph neural networks for code",
        text: "BEIR aggregates 18 retrieval tasks across 9 domains for zero-shot evaluation…",
    },
]

export function AnthillLiteratureSearchPanel() {
    const [step, setStep] = useState(0)

    useEffect(() => {
        const t = setInterval(() => {
            setStep((s) => (s >= events.length + findings.length ? 0 : s + 1))
        }, 700)
        return () => clearInterval(t)
    }, [])

    const visEvents = events.slice(0, Math.min(step, events.length))
    const visFindings = findings.slice(0, Math.max(0, step - events.length))
    const live = step < events.length + findings.length

    return (
        <Card className="overflow-hidden p-0 not-prose">
            {/* Header strip — mirrors agent-run-detail */}
            <div className="border-b bg-background px-4 py-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-lg font-medium">literature_search</div>
                        <StatusBadge status={live ? "running" : "succeeded"} />
                        {live && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                <span className="inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
                                live
                            </span>
                        )}
                        <span className="ml-auto font-mono text-xs text-muted-foreground whitespace-nowrap">r_8c2f1a</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <span className="font-mono">"graph neural networks for code"</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>created Apr 26, 10:14:01</span>
                        <span className="opacity-50">·</span>
                        <span>plan_n=4 · discover_max=5 · k_per_query=8</span>
                    </div>
                </div>
            </div>

            {/* Two-column trace + findings split */}
            <div className="grid grid-cols-1 gap-px lg:grid-cols-[1fr_1fr] bg-border">
                {/* Trace */}
                <div className="bg-card flex flex-col">
                    <div className="flex items-center justify-between border-b px-4 py-2">
                        <div className="text-sm font-medium">Trace</div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {visEvents.length} events
                        </span>
                    </div>
                    <div className="min-h-[320px] max-h-[420px] overflow-y-auto">
                        <div className="flex flex-col gap-1 p-3">
                            {visEvents.map((e, i) => (
                                <EventRow key={i} ev={e} />
                            ))}
                            {live && step <= events.length && (
                                <div className="flex items-center gap-2 pl-3 text-xs text-muted-foreground">
                                    <Loader2 className="size-3 animate-spin" />
                                    <span>streaming…</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Findings */}
                <div className="bg-card flex flex-col">
                    <div className="flex items-center justify-between border-b px-4 py-2">
                        <div className="text-sm font-medium">Findings</div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {visFindings.length} papers
                        </span>
                    </div>
                    <div className="min-h-[320px] max-h-[420px] overflow-y-auto">
                        <div className="flex flex-col gap-2 p-3">
                            {visFindings.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Waiting for results…</div>
                            ) : (
                                visFindings.map((f) => <FindingCard key={f.arxiv_id} f={f} />)
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer crumbs (mirror what surfaces below the run on the real page) */}
            <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
                <span>Planner: <span className="font-mono">gpt-4o-mini</span> · Embeddings: <span className="font-mono">Harrier 270M</span></span>
                <span className="font-mono">/api/agents/runs/r_8c2f1a/events</span>
            </div>
        </Card>
    )
}

const KIND_ICONS = {
    status: <ChevronRight className="size-3.5 text-muted-foreground" />,
    log: <ChevronRight className="size-3.5 text-muted-foreground" />,
    step: <ChevronRight className="size-3.5 text-blue-500" />,
    finding: <CheckCircle2 className="size-3.5 text-emerald-500" />,
}

function EventRow({ ev }: { ev: RunEvent }) {
    const kindLabel = ev.step ?? ev.kind
    return (
        <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 border-l border-border/60 py-1.5 pl-3 text-sm"
        >
            <span className="mt-0.5 shrink-0">{KIND_ICONS[ev.kind]}</span>
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums">{ev.at}</span>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {kindLabel}
                    </span>
                    <span className="truncate text-foreground/90">{ev.message}</span>
                </div>
                {ev.payload && (
                    <pre className="mt-0.5 line-clamp-2 overflow-hidden text-[11px] text-muted-foreground font-mono">
                        {JSON.stringify(ev.payload)}
                    </pre>
                )}
            </div>
        </motion.div>
    )
}

function FindingCard({ f }: { f: Finding }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-card p-3"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="tabular-nums">#{f.rank}</span>
                        <a className="font-mono hover:underline">arXiv:{f.arxiv_id}</a>
                        <span>· chunk {f.chunk_index}</span>
                        {f.newly_indexed && (
                            <span className="inline-flex items-center px-1.5 py-0 rounded text-[10px] font-medium border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                new
                            </span>
                        )}
                    </div>
                    <a className="font-medium text-sm leading-snug hover:underline">{f.title}</a>
                    <div className="text-[11px] text-muted-foreground">
                        matched: <span className="font-mono">{f.matched_query}</span>
                    </div>
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium tabular-nums border bg-muted text-muted-foreground">
                    {(f.score * 100).toFixed(1)}%
                </span>
            </div>
            <div className="mt-2 line-clamp-3 text-xs text-muted-foreground leading-relaxed">{f.text}</div>
        </motion.div>
    )
}

function StatusBadge({ status }: { status: "pending" | "running" | "succeeded" | "failed" | "cancelled" }) {
    const variants: Record<string, string> = {
        pending: "bg-muted text-muted-foreground",
        running: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
        succeeded: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        failed: "bg-red-500/15 text-red-700 dark:text-red-300",
        cancelled: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    }
    const labels: Record<string, string> = {
        pending: "Pending",
        running: "Running",
        succeeded: "Succeeded",
        failed: "Failed",
        cancelled: "Cancelled",
    }
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${variants[status]}`}>
            {status === "running" && <Loader2 className="size-3 animate-spin" />}
            {labels[status]}
        </span>
    )
}
