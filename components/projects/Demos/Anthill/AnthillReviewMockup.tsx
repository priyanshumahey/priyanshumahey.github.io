"use client"

/**
 * Review-response — recreates the actual UI shipped today:
 *
 *   left:  NewReviewResponseForm from agents-panel.tsx
 *          (Card.p-4 > form.flex.flex-col.gap-3 with Sparkles/Mail icon
 *           header, native select, textarea.font-mono.text-xs, sender
 *           inputs, Button)
 *   right: agent-run-detail findings list (Card.p-3 with KIND_BADGE
 *          colored badge + font-mono anchor + accept/reject Buttons)
 */

import { motion } from "framer-motion"
import { CheckCircle2, Mail } from "lucide-react"

import { Card } from "@/components/ui/card"

interface Finding {
    kind: "edit" | "comment" | "title"
    anchor_ref?: string
    rationale: string
    headline: string
    replacement?: string
    body?: string
    code?: boolean
}

const findings: Finding[] = [
    {
        kind: "edit",
        anchor_ref: "b2",
        rationale: "Reviewer asked to separate dense vs sparse retrieval.",
        headline: "Dense bi-encoders dominate the modern IR leaderboard; sparse baselines (BM25) remain a strong starting point but typically lag on multi-hop queries.",
        replacement: "Dense bi-encoders dominate the modern IR leaderboard; sparse baselines (BM25) remain a strong starting point but typically lag on multi-hop queries.",
    },
    {
        kind: "edit",
        anchor_ref: "b5",
        rationale: "Eq. 4 missing 1/√d normalization.",
        headline: "attention(q,k) = softmax(q·kᵀ / √d)",
        replacement: "attention(q,k) = softmax(q·kᵀ / √d)",
        code: true,
    },
    {
        kind: "edit",
        anchor_ref: "b9",
        rationale: "Citation 12 should be Thakur 2021, not Karpukhin 2020.",
        headline: "…on the BEIR benchmark [Thakur 2021].",
        replacement: "…on the BEIR benchmark [Thakur 2021].",
    },
    {
        kind: "comment",
        anchor_ref: "b12",
        rationale: "Reviewer asked for a limitations paragraph on long-context retrieval.",
        headline: "Add a one-paragraph limitations note about how the encoder's 512-token window degrades on long-context retrieval (cite §6 of Beltagy 2020).",
        body: "Add a one-paragraph limitations note about how the encoder's 512-token window degrades on long-context retrieval (cite §6 of Beltagy 2020).",
    },
]

const KIND_BADGE: Record<string, string> = {
    edit: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    comment: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    title: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
}

export function AnthillReviewMockup() {
    return (
        <div className="not-prose grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ReviewForm />
            <RunDetail />
        </div>
    )
}

function ReviewForm() {
    return (
        <Card className="p-4 flex flex-col gap-3 not-prose">
            {/* Header — mirrors the real NewReviewResponseForm */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 shrink-0">
                    <Mail className="size-4 text-muted-foreground" />
                    <div className="text-sm font-medium whitespace-nowrap">Mock review response</div>
                </div>
                <span className="text-[11px] text-muted-foreground text-right leading-snug">
                    Skips AgentMail; runs Claude on the pasted text.
                </span>
            </div>

            {/* Document select */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Document</label>
                <select
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm dark:bg-input/30"
                    defaultValue="003cb3da"
                >
                    <option value="003cb3da">Retrieval-Augmented Generation for Code · 003cb3da</option>
                </select>
            </div>

            {/* Reviewer text */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">Reviewer email</label>
                    <button className="text-[11px] text-muted-foreground underline-offset-2 hover:underline">
                        Load sample review
                    </button>
                </div>
                <textarea
                    readOnly
                    className="min-h-32 w-full rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed resize-none"
                    value={`Hi authors — overall the work is interesting but a few requests:

1. The intro conflates dense and sparse retrieval — please separate them in §1¶2.
2. Eq. 4 in §3 is missing a 1/√d normalization in the attention term.
3. Citation 12 (Karpukhin 2020) is on the wrong claim — should be Thakur 2021.
4. Add a one-paragraph limitations note about long-context retrieval.

— Reviewer 2`}
                />
            </div>

            {/* Sender row */}
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Sender name</label>
                    <input className="flex h-8 w-44 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm dark:bg-input/30" defaultValue="Reviewer 2" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Sender email</label>
                    <input className="flex h-8 w-56 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm dark:bg-input/30" defaultValue="reviewer-3@neurips.cc" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Max actions</label>
                    <input className="flex h-8 w-24 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm tabular-nums dark:bg-input/30" defaultValue="8" />
                </div>
                <button className="inline-flex items-center justify-center h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
                    Start run
                </button>
            </div>

            <div className="text-[11px] text-muted-foreground leading-relaxed pt-2 border-t">
                Backend calls <span className="font-mono">claude-sonnet-4-20250514</span> with a JSON-schema system
                prompt. Each action posts an <span className="font-mono">addNote</span> op with idempotency key
                <span className="font-mono"> review:{`{run}`}:{`{anchor}`}:{`{kind}`}</span>.
            </div>
        </Card>
    )
}

function RunDetail() {
    return (
        <Card className="overflow-hidden p-0 flex flex-col not-prose">
            {/* Header strip */}
            <div className="border-b px-4 py-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-lg font-medium">review_response</div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            Succeeded
                        </span>
                        <span className="ml-auto font-mono text-xs text-muted-foreground whitespace-nowrap">r_8c2f1a</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        4 actions queued · 3 suggestions · 1 comment
                    </div>
                </div>
            </div>

            {/* Findings list */}
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-2 p-3">
                    {findings.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 4 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <FindingCard f={f} />
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>idempotency: <span className="font-mono">review:r_8c2f1a:bN:[edit|comment]</span></span>
                <span className="font-mono">Sonnet 4</span>
            </div>
        </Card>
    )
}

function FindingCard({ f }: { f: Finding }) {
    return (
        <Card className="p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${KIND_BADGE[f.kind]}`}>
                        {f.kind === "comment" ? "addNote · comment" : "addNote · suggestion"}
                    </span>
                    {f.anchor_ref && <span className="font-mono">{f.anchor_ref}</span>}
                </div>
                <div className="flex items-center gap-1">
                    <button className="inline-flex items-center justify-center h-7 px-2 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition">
                        Accept
                    </button>
                    <button className="inline-flex items-center justify-center h-7 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:bg-accent transition">
                        Reject
                    </button>
                </div>
            </div>
            <div className={`text-sm leading-snug ${f.code ? "font-mono" : ""}`}>{f.headline}</div>
            <div className="text-xs text-muted-foreground mt-1.5">
                <span className="font-medium text-foreground">why: </span>
                {f.rationale}
            </div>
        </Card>
    )
}
