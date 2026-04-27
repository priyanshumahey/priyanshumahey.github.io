"use client"

/**
 * The Anthill editor — visual recreation of the actual document editor
 * surface (`web/components/document-editor.tsx` + `collab-editor.tsx`).
 *
 * Matches the real chrome:
 *   - sticky header `h-12 border-b bg-background/80 backdrop-blur`
 *   - title row with borderless Input
 *   - Connect-agent Button (outline, sm)
 *   - presence stack with shadcn Avatar primitive
 *   - Plate body, sans-serif, with citation badges using the real
 *     `border px-1.5 py-0 text-[11px] font-medium leading-tight rounded-sm`
 *     classes from `web/components/ui/citation-node.tsx`
 */

import { motion } from "framer-motion"
import { BadgeCheck, Sparkles } from "lucide-react"

import { Card } from "@/components/ui/card"

interface Props {
    annotated?: boolean
    compact?: boolean
}

export function AnthillEditorAnatomy({ annotated = false, compact = false }: Props) {
    return (
        <Card className={`overflow-hidden p-0 not-prose`}>
            {/* Top bar — mirrors document-editor.tsx */}
            <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Retrieval-Augmented Generation for Code</span>
                </div>
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground">Saving title…</span>
                <PresenceStack />
                <button className="h-8 px-3 inline-flex items-center justify-center rounded-md border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition">
                    Connect agent
                </button>
            </div>

            {/* Body — feels like the Plate editor */}
            <div className={`px-8 ${compact ? "py-6" : "py-10"} mx-auto max-w-3xl text-[15px] leading-7 text-foreground`}>
                <div className="text-2xl font-semibold tracking-tight mb-4">3 · Method</div>

                <div className="mb-4">
                    Dense retrievers reduce hallucinations on long-tail QA by grounding generation in
                    a fixed corpus
                    <CitationBadge id="2401.07983" tone="supports" score={81} />
                    . We extend this line of work to <em>code</em> by replacing the bi-encoder with an
                    instruction-tuned model that takes the same prefix at index- and query-time
                    <CitationBadge id="2305.06983" tone="rejects" score={73} />
                    , removing a class of distribution-shift bugs.
                </div>

                <div>
                    We follow the dense-retrieval line but swap the encoder for an instruction-tuned model
                    <span className="relative">
                        <span>.</span>
                        <motion.span
                            className="inline-block w-[2px] h-[1em] bg-foreground align-middle ml-[1px]"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                        />
                        <motion.span
                            className="inline-flex items-center gap-1 align-middle ml-1.5 px-1.5 py-0 rounded-sm border border-primary/30 bg-primary/10 text-primary text-[11px] font-medium leading-tight"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles className="size-3" />
                            <span className="font-mono">[arXiv:2401.07983]</span>
                            <kbd className="ml-1 rounded border bg-background/40 px-1 py-0 text-[9.5px] font-mono">Tab</kbd>
                        </motion.span>
                    </span>
                </div>

                {/* Annotation overlays */}
                {annotated && (
                    <div className="relative mt-8">
                        <Annotation top="-330px" right="-12px" label="① Presence: humans + agents in one Yjs awareness map" />
                        <Annotation top="-260px" left="58%" label="② Citation badge → Nia verdict popover" />
                        <Annotation top="-180px" left="40%" label="③ Ghost-text suggestion · Tab inserts" />
                        <Annotation top="-380px" right="160px" label="④ Connect any HTTP-speaking agent" />
                    </div>
                )}
            </div>

            {/* Footer status bar */}
            <div className="flex items-center gap-3 border-t bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground">
                <span className="font-mono">003cb3da</span>
                <span>·</span>
                <span>Yjs synced</span>
                <span>·</span>
                <span>baseRevision <span className="font-mono">v42a3</span></span>
                <div className="flex-1" />
                <span>Plate · @platejs/yjs</span>
            </div>
        </Card>
    )
}

function PresenceStack() {
    return (
        <div className="flex items-center -space-x-1.5 mr-2">
            <Avatar initials="PM" bg="bg-emerald-500" />
            <Avatar initials="SC" bg="bg-cyan-500" />
            <AgentAvatar initials="AI" bg="bg-violet-500" />
        </div>
    )
}

function Avatar({ initials, bg }: { initials: string; bg: string }) {
    return (
        <div className={`relative inline-flex size-7 items-center justify-center rounded-full border-2 border-background text-[10px] font-medium text-white ${bg} shadow-sm`}>
            {initials}
        </div>
    )
}

function AgentAvatar({ initials, bg }: { initials: string; bg: string }) {
    return (
        <div className="relative">
            <motion.span
                className={`absolute inset-0 rounded-full ${bg}`}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <div className={`relative inline-flex size-7 items-center justify-center rounded-full border-2 border-background text-[10px] font-medium text-white ${bg} shadow-sm`}>
                {initials}
            </div>
        </div>
    )
}

function CitationBadge({ id, tone, score }: { id: string; tone: "supports" | "rejects" | "pending"; score: number }) {
    const palette =
        tone === "supports"
            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : tone === "rejects"
                ? "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-primary/30 bg-primary/10 text-primary"
    return (
        <span
            className={`inline-flex cursor-pointer items-center gap-1 align-baseline mx-px rounded-sm border px-1.5 py-0 text-[11px] font-medium leading-tight ${palette}`}
        >
            <span className="font-mono">[arXiv:{id}]</span>
            <span className="tabular-nums opacity-70">{score}%</span>
            {tone === "supports" && <BadgeCheck className="size-3" />}
        </span>
    )
}

function Annotation({ label, top, bottom, left, right }: { label: string; top?: string; bottom?: string; left?: string; right?: string }) {
    return (
        <div className="absolute pointer-events-none" style={{ top, bottom, left, right }}>
            <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 border border-primary/30 text-primary backdrop-blur-sm">
                {label}
            </div>
        </div>
    )
}
