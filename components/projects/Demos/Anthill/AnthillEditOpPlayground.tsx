"use client"

/**
 * EditOps playground — pick an op, see what request body the agent sends,
 * watch a faux Plate doc transform before→after.
 *
 * Visual style mirrors the real shadcn/Geist look: Card with bg-card,
 * muted/30 surfaces for code, mono for refs, tabular-nums for numbers,
 * neutral-grayscale palette + tinted /15 status badges.
 */

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { Card } from "@/components/ui/card"

type OpKey =
    | "appendBlocks"
    | "insertBlocksAfter"
    | "replaceBlock"
    | "setBlockText"
    | "deleteBlock"
    | "appendInline"
    | "addNote"
    | "setTitle"

interface Block {
    ref: string
    type: "h2" | "p" | "blockquote"
    text: string
    citations?: string[]
    note?: { kind: "comment" | "suggestion"; body: string; replacement?: string; rationale?: string }
}

const baseDoc: Block[] = [
    { ref: "b1", type: "h2", text: "Method" },
    {
        ref: "b2",
        type: "p",
        text:
            "Dense retrievers reduce hallucinations on long-tail QA by grounding generation in dense retrieval",
        citations: ["2401.07983"],
    },
    {
        ref: "b3",
        type: "p",
        text: "We extend this to code with an instruction-tuned encoder.",
    },
]

interface OpDef {
    key: OpKey
    label: string
    accent: string // tailwind suffix: emerald, amber, etc.
    body: string
    explain: string
    apply: (doc: Block[]) => Block[]
}

const ops: OpDef[] = [
    {
        key: "appendBlocks",
        label: "appendBlocks",
        accent: "emerald",
        body: `{
  "ops": [{
    "type": "appendBlocks",
    "blocks": [
      { "type": "p", "children": [
          { "text": "Limitations: 512-token window degrades on long-context retrieval." }
      ]}
    ]
  }]
}`,
        explain: "Append at the end of the doc. response.newRefs returns ['b4'].",
        apply: (doc) => [
            ...doc,
            { ref: "b4", type: "p", text: "Limitations: 512-token window degrades on long-context retrieval." },
        ],
    },
    {
        key: "insertBlocksAfter",
        label: "insertBlocksAfter",
        accent: "emerald",
        body: `{
  "ops": [{
    "type": "insertBlocksAfter",
    "afterRef": "b1",
    "blocks": [
      { "type": "p", "children": [
          { "text": "All experiments use Harrier 270M for embedding." }
      ]}
    ]
  }]
}`,
        explain: "Insert at a stable anchor — refs after b1 shift down by one.",
        apply: (doc) => {
            const idx = doc.findIndex((b) => b.ref === "b1") + 1
            const inserted: Block = { ref: "b2", type: "p", text: "All experiments use Harrier 270M for embedding." }
            const out = [...doc.slice(0, idx), inserted, ...doc.slice(idx)]
            return out.map((b, i) => ({ ...b, ref: `b${i + 1}` }))
        },
    },
    {
        key: "replaceBlock",
        label: "replaceBlock",
        accent: "violet",
        body: `{
  "ops": [{
    "type": "replaceBlock",
    "ref": "b2",
    "blocks": [
      { "type": "p", "children": [
          { "text": "Recent dense retrievers cut hallucination rates on long-tail QA via grounded generation" }
      ]}
    ]
  }]
}`,
        explain:
            "The inline citation on b2 is auto-appended to the new block. response.preservedInlines = 1.",
        apply: (doc) =>
            doc.map((b) =>
                b.ref === "b2"
                    ? { ...b, text: "Recent dense retrievers cut hallucination rates on long-tail QA via grounded generation" }
                    : b,
            ),
    },
    {
        key: "setBlockText",
        label: "setBlockText",
        accent: "violet",
        body: `{
  "ops": [{
    "type": "setBlockText",
    "ref": "b2",
    "text": "Recent dense retrievers cut hallucination rates on long-tail QA via grounded generation"
  }]
}`,
        explain: "Plain-text replace. Inline citations are kept and re-appended after the new text.",
        apply: (doc) =>
            doc.map((b) =>
                b.ref === "b2"
                    ? { ...b, text: "Recent dense retrievers cut hallucination rates on long-tail QA via grounded generation" }
                    : b,
            ),
    },
    {
        key: "deleteBlock",
        label: "deleteBlock",
        accent: "amber",
        body: `{
  "ops": [{
    "type": "deleteBlock",
    "ref": "b2"
  }]
}`,
        explain: "Refused with 409 INLINE_ELEMENTS_WOULD_BE_LOST — b2 carries a citation. Pass dropInlineElements:true to override.",
        apply: (doc) => doc, // refused
    },
    {
        key: "appendInline",
        label: "appendInline",
        accent: "emerald",
        body: `{
  "ops": [{
    "type": "appendInline",
    "ref": "b3",
    "element": {
      "type": "citation",
      "arxivId": "2305.06983",
      "chunkIndex": 4,
      "title": "CodeT5+",
      "score": 0.79,
      "children": [{ "text": "" }]
    }
  }]
}`,
        explain:
            "How citation_inserter / insert_citation drop a citation badge into a block. Stamped with proofAuthor:ai:insert_citation.",
        apply: (doc) =>
            doc.map((b) => (b.ref === "b3" ? { ...b, citations: [...(b.citations ?? []), "2305.06983"] } : b)),
    },
    {
        key: "addNote",
        label: "addNote",
        accent: "amber",
        body: `{
  "ops": [{
    "type": "addNote",
    "anchorRef": "b2",
    "kind": "suggestion",
    "body": "Reviewer asked to soften the claim.",
    "replacement": "Recent retrievers correlate with reduced hallucination on long-tail QA",
    "rationale": "Reviewer 2 asked to soften the causal language."
  }]
}`,
        explain: "Inserts a blockquote rendered as an accept/reject suggestion card. Original block untouched.",
        apply: (doc) => {
            const idx = doc.findIndex((b) => b.ref === "b2")
            if (idx < 0) return doc
            const note: Block = {
                ref: "n1",
                type: "blockquote",
                text: "",
                note: {
                    kind: "suggestion",
                    body: "Reviewer asked to soften the claim.",
                    replacement: "Recent retrievers correlate with reduced hallucination on long-tail QA",
                    rationale: "Reviewer 2 asked to soften the causal language.",
                },
            }
            return [...doc.slice(0, idx + 1), note, ...doc.slice(idx + 1)]
        },
    },
    {
        key: "setTitle",
        label: "setTitle",
        accent: "blue",
        body: `{
  "ops": [{
    "type": "setTitle",
    "title": "Anthill: Collaborative Editing with Grounded Citations"
  }]
}`,
        explain: "Renames the document — also persists to documents.title in Supabase.",
        apply: (doc) => doc,
    },
]

const TITLE_BEFORE = "Retrieval-Augmented Generation for Code"
const TITLE_AFTER = "Anthill: Collaborative Editing with Grounded Citations"

const accentChip: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
    blue: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
}

const accentChipActive: Record<string, string> = {
    emerald: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-100 border-emerald-500",
    amber: "bg-amber-500/30 text-amber-700 dark:text-amber-100 border-amber-500",
    violet: "bg-violet-500/30 text-violet-700 dark:text-violet-100 border-violet-500",
    blue: "bg-blue-500/30 text-blue-700 dark:text-blue-100 border-blue-500",
}

export function AnthillEditOpPlayground() {
    const [opKey, setOpKey] = useState<OpKey>("appendInline")
    const [showAfter, setShowAfter] = useState(false)
    const auto = useRef(true)

    useEffect(() => {
        const flip = setInterval(() => setShowAfter((v) => !v), 1700)
        return () => clearInterval(flip)
    }, [])

    useEffect(() => {
        if (!auto.current) return
        const advance = setInterval(() => {
            setOpKey((k) => {
                const i = ops.findIndex((o) => o.key === k)
                return ops[(i + 1) % ops.length]!.key
            })
        }, 6800)
        return () => clearInterval(advance)
    }, [])

    const op = ops.find((o) => o.key === opKey)!
    const docNow = showAfter ? op.apply(baseDoc) : baseDoc
    const titleNow = op.key === "setTitle" && showAfter ? TITLE_AFTER : TITLE_BEFORE
    const refused = op.key === "deleteBlock"

    return (
        <Card className="overflow-hidden p-0 not-prose">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                {/* Left: request body */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between border-b px-4 py-2">
                        <div className="text-sm font-medium">Request</div>
                        <span className="text-[10px] font-mono text-muted-foreground">
                            POST /documents/:id/edit
                        </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <pre className="flex-1 text-[11.5px] leading-relaxed font-mono bg-muted/40 rounded-md border p-3 overflow-x-auto whitespace-pre min-h-[260px]">
                            {op.body}
                        </pre>
                        <div className="mt-3 text-xs text-muted-foreground leading-relaxed">{op.explain}</div>
                    </div>
                </div>

                {/* Right: faux doc */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between border-b px-4 py-2">
                        <div className="text-sm font-medium">
                            {showAfter ? (refused ? "Response · 409" : "After") : "Before"}
                        </div>
                        <div className="flex items-center gap-1">
                            <Toggle label="before" active={!showAfter} onClick={() => setShowAfter(false)} />
                            <Toggle label="after" active={showAfter} onClick={() => setShowAfter(true)} />
                        </div>
                    </div>
                    <div className="p-4 flex-1 min-h-[260px]">
                        <div className="text-xs font-medium text-muted-foreground mb-3 line-clamp-1">
                            {titleNow}
                        </div>
                        <AnimatePresence mode="popLayout">
                            {docNow.map((b) => (
                                <motion.div
                                    key={b.ref}
                                    layout
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.22 }}
                                    className="mb-2.5"
                                >
                                    <BlockRow b={b} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {refused && showAfter && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-3 text-xs px-2.5 py-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive font-mono"
                            >
                                409 INLINE_ELEMENTS_WOULD_BE_LOST · b2 carries 1 inline citation
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Op chips */}
            <div className="border-t bg-muted/30 px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Pick an op</span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {ops.map((o) => {
                        const active = o.key === opKey
                        return (
                            <button
                                key={o.key}
                                onClick={() => { auto.current = false; setOpKey(o.key); setShowAfter(false) }}
                                className={`px-2 py-1 rounded-md border text-[11px] font-mono font-medium transition ${active ? accentChipActive[o.accent] : `${accentChip[o.accent]} opacity-80 hover:opacity-100`}`}
                            >
                                {o.label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground"
                }`}
        >
            {label}
        </button>
    )
}

function BlockRow({ b }: { b: Block }) {
    if (b.note) {
        return (
            <div className="rounded-md bg-amber-500/[0.06] border border-amber-500/30 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-mono uppercase tracking-wide text-amber-700 dark:text-amber-300 font-medium">
                        addNote · suggestion
                    </span>
                    <div className="ml-auto flex gap-1">
                        <button className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition">
                            Accept
                        </button>
                        <button className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground hover:bg-accent transition">
                            Reject
                        </button>
                    </div>
                </div>
                {b.note.replacement && (
                    <div className="text-[13px] text-foreground leading-snug">{b.note.replacement}</div>
                )}
                <div className="text-[11px] text-muted-foreground mt-1.5">{b.note.rationale}</div>
            </div>
        )
    }
    if (b.type === "h2") {
        return (
            <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-mono text-muted-foreground w-6 tabular-nums">{b.ref}</span>
                <span className="text-base font-semibold tracking-tight">{b.text}</span>
            </div>
        )
    }
    return (
        <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-mono text-muted-foreground w-6 mt-0.5 tabular-nums">{b.ref}</span>
            <div className="text-[13px] leading-snug flex-1">
                {b.text}
                {b.citations && b.citations.map((c) => (
                    <span
                        key={c}
                        className="inline-flex items-center gap-1 align-baseline ml-1 mx-px rounded-sm border px-1.5 py-0 text-[10px] font-medium leading-tight border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    >
                        <span className="font-mono">[arXiv:{c}]</span>
                    </span>
                ))}
            </div>
        </div>
    )
}
