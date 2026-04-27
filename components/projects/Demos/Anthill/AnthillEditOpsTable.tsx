"use client"

/**
 * EditOp vocabulary table — matches the shadcn Card aesthetic of the
 * real `agent-run-detail.tsx` and uses the same colored /15 badges.
 */

import { motion } from "framer-motion"

import { Card } from "@/components/ui/card"

interface Row {
    op: string
    fields: string
    effect: string
    note?: string
    accent: string
}

const rows: Row[] = [
    {
        op: "appendBlocks",
        fields: "blocks: PlateBlock[]",
        effect: "Append at the end of the doc; new refs returned in newRefs.",
        accent: "emerald",
    },
    {
        op: "insertBlocksAfter",
        fields: "afterRef: 'b3', blocks: PlateBlock[]",
        effect: "Insert at a specific anchor; refs after it shift.",
        accent: "emerald",
    },
    {
        op: "insertBlocksBefore",
        fields: "beforeRef: 'b3', blocks: PlateBlock[]",
        effect: "Symmetric insert before an anchor.",
        accent: "emerald",
    },
    {
        op: "replaceBlock",
        fields: "ref: 'b3', blocks: PlateBlock[], dropInlineElements?",
        effect: "Replace one block with N. Inline citations on the original are auto-appended to the last new block. Opt out with dropInlineElements.",
        note: "preservedInlines counted in response",
        accent: "violet",
    },
    {
        op: "deleteBlock",
        fields: "ref: 'b3', dropInlineElements?",
        effect: "Refuses with 409 INLINE_ELEMENTS_WOULD_BE_LOST if the block carries citations, unless you explicitly drop them.",
        note: "the citation guard",
        accent: "amber",
    },
    {
        op: "setBlockText",
        fields: "ref: 'b3', text: '...', dropInlineElements?",
        effect: "Plain-text replace. Inline elements (citations) are kept and re-appended after the new text.",
        accent: "violet",
    },
    {
        op: "setTitle",
        fields: "title: '...'",
        effect: "Renames the document. Also persists to documents.title in Supabase.",
        accent: "blue",
    },
    {
        op: "appendInline",
        fields: "ref: 'b3', element: { type: 'citation', arxivId, ... }",
        effect: "Append a Plate inline element to a block. This is how citation_inserter / insert_citation drop badges into the doc.",
        note: "the auto-cite write op",
        accent: "emerald",
    },
    {
        op: "addNote",
        fields: "anchorRef, kind: 'comment'|'suggestion', body, replacement?, rationale?",
        effect: "Inserts a blockquote with noteKind/noteAnchorRef/noteAuthor — rendered as a margin comment or accept/reject suggestion card.",
        note: "the review_response write op",
        accent: "amber",
    },
]

const accentClasses: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    blue: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
}

export function AnthillEditOpsTable() {
    return (
        <Card className="overflow-hidden p-0 not-prose">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
                <div>
                    <div className="text-sm font-medium">EditOp vocabulary</div>
                    <div className="text-xs text-muted-foreground mt-0.5">9 ops · single Y.transact per POST /edit</div>
                </div>
                <span className="text-xs font-mono text-muted-foreground hidden md:block">collab/src/types.ts</span>
            </div>
            <div className="divide-y">
                {rows.map((r, i) => (
                    <motion.div
                        key={r.op}
                        initial={{ opacity: 0, y: 4 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2) }}
                        className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-x-4 gap-y-1 px-4 py-3 hover:bg-muted/30 transition"
                    >
                        <div className="flex items-start gap-2">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium ${accentClasses[r.accent]}`}>
                                {r.op}
                            </span>
                        </div>
                        <div>
                            <div className="text-xs font-mono text-muted-foreground leading-snug truncate" title={r.fields}>
                                {r.fields}
                            </div>
                            <div className="text-sm text-foreground/90 leading-snug mt-1">{r.effect}</div>
                            {r.note && (
                                <div className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground mt-1">{r.note}</div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </Card>
    )
}
