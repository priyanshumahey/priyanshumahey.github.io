"use client"

/**
 * The actual Connect-Agent dialog from `web/components/connect-agent-button.tsx`:
 *   <Dialog>
 *     <DialogTrigger><Button variant="outline" size="sm" className="h-8">Connect agent</Button></DialogTrigger>
 *     <DialogContent className="max-w-3xl">
 *       <DialogHeader><DialogTitle>...</DialogTitle><DialogDescription>...</DialogDescription></DialogHeader>
 *       <div className="grid gap-3">
 *         <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
 *           <span className="text-muted-foreground">Bridge URL</span>
 *           <code className="font-mono break-all">{url}</code>
 *           ...
 *         </div>
 *         <textarea className="h-72 w-full resize-none rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed" />
 *       </div>
 *       <DialogFooter><Button variant="outline" size="sm">Copy prompt</Button></DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 */

import { useState } from "react"

import { Card } from "@/components/ui/card"

const BRIDGE_URL = "https://collab.anthill.app:8889"
const DOC_ID = "003cb3da-9f17-4c44-9d3e-2a8e0f1b7e1c"

const PROMPT = `============================================================
You are connected to Anthill, a collaborative document editor. You
can read and modify a live document over HTTP. Every change you make
appears in real time in every connected user's browser, with an
attribution tag identifying you as the author.

Bridge URL: ${BRIDGE_URL}
Document ID: ${DOC_ID}
Protocol: anthill-agent-bridge/1

== Auth headers (send on EVERY request) ==
- X-Agent-Id:        <slug for you, e.g. claude-code>     # required
- X-Agent-Name:      <human-friendly name>                # optional
- X-Agent-Run-Id:    <opaque trace id>                    # optional
- X-Agent-Token:     <shared secret>                      # required if enforced
- Idempotency-Key:   <uuid>                               # required on POST /edit

== Endpoints ==

GET ${BRIDGE_URL}/.well-known/agent.json
GET ${BRIDGE_URL}/documents/${DOC_ID}/snapshot
GET ${BRIDGE_URL}/documents/${DOC_ID}/state
POST ${BRIDGE_URL}/documents/${DOC_ID}/edit

== EditOp types ==

  appendBlocks       { blocks: PlateBlock[] }
  insertBlocksAfter  { afterRef:  "b3", blocks: [...] }
  insertBlocksBefore { beforeRef: "b3", blocks: [...] }
  replaceBlock       { ref: "b3", blocks: [...], dropInlineElements? }
  deleteBlock        { ref: "b3", dropInlineElements? }
  setBlockText       { ref: "b3", text: "...",  dropInlineElements? }
  setTitle           { title: "..." }
  appendInline       { ref: "b3", element: { type: "citation", ... } }
  addNote            { anchorRef, kind: "comment"|"suggestion", body, replacement? }
============================================================`

export function AnthillConnectDialog() {
    const [copied, setCopied] = useState(false)

    return (
        <Card className="overflow-hidden p-0 not-prose">
            {/* The actual dialog rendered statically (no overlay backdrop, since the
          surrounding article already provides context). Matches max-w-3xl. */}
            <div className="bg-background p-6">
                <div className="mx-auto max-w-3xl">
                    {/* DialogHeader */}
                    <div className="flex flex-col gap-1.5 mb-4">
                        <div className="text-lg font-semibold leading-none tracking-tight">
                            Connect an external agent
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Paste this prompt into Claude Code, Copilot, ChatGPT, or any agent that can call HTTP. It's
                            prefilled with this document's bridge URL and ID. Every change the agent makes appears
                            here in real time.
                        </div>
                    </div>

                    {/* Body */}
                    <div className="grid gap-3">
                        {/* Two-col key/value */}
                        <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
                            <span className="text-muted-foreground">Bridge URL</span>
                            <code className="font-mono break-all">{BRIDGE_URL}</code>
                            <span className="text-muted-foreground">Document ID</span>
                            <code className="font-mono break-all">{DOC_ID}</code>
                            <span className="text-muted-foreground">Protocol</span>
                            <code className="font-mono">anthill-agent-bridge/1</code>
                        </div>

                        {/* Prompt textarea */}
                        <div className="relative">
                            <textarea
                                readOnly
                                value={PROMPT}
                                onFocus={(e) => e.currentTarget.select()}
                                className="h-72 w-full resize-none rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    {/* DialogFooter */}
                    <div className="flex items-center justify-end gap-2 mt-6">
                        <button className="inline-flex items-center justify-center h-8 px-3 rounded-md border bg-background text-sm font-medium text-muted-foreground hover:bg-accent transition">
                            Close
                        </button>
                        <button
                            onClick={() => {
                                if (typeof navigator !== "undefined" && navigator.clipboard) {
                                    navigator.clipboard.writeText(PROMPT).catch(() => { })
                                }
                                setCopied(true)
                                setTimeout(() => setCopied(false), 1600)
                            }}
                            className="inline-flex items-center justify-center h-8 px-3 rounded-md border bg-background text-sm font-medium hover:bg-accent transition"
                        >
                            {copied ? "Copied!" : "Copy prompt"}
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
