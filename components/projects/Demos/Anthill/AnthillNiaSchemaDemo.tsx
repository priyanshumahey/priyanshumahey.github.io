"use client"

/**
 * Nia structured-output demo. Schema we send + the verdict we get back,
 * plus a war-stories panel from the docstring of nia_client.py.
 */

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"

import { Card } from "@/components/ui/card"

const SCHEMA = `{
  "type": "object",
  "properties": {
    "supports_claim": {
      "type": "boolean",
      "description": "True if the cited paper directly supports..."
    },
    "exact_quote": {
      "type": "string",
      "description": "Verbatim sentence — no paraphrase. Empty if none."
    },
    "page_number":   { "type": ["integer", "null"] },
    "section_path":  { "type": ["string", "null"] },
    "confidence":    { "type": "number", "minimum": 0, "maximum": 1 },
    "rationale":     { "type": "string" }
  },
  "required": ["supports_claim", "exact_quote",
               "confidence", "rationale"]
}`

const VERDICT = `{
  "supports_claim": true,
  "exact_quote": "We find that retrieval-augmented
generation reduces hallucination by 39% on the
long-tail subset of TriviaQA-Web compared to the
no-retrieval baseline.",
  "page_number": 7,
  "section_path": "Methods > Architecture",
  "confidence": 0.91,
  "rationale": "Quote directly compares the two
baselines on the cited benchmark."
}`

const warStories = [
    {
        title: "claude-opus-4-7 → 502",
        body: "Default Nia model returns 'temperature is deprecated for this model'. Pin claude-sonnet-4-20250514.",
    },
    {
        title: "Source not ready",
        body: "document/agent happily accepts a still-indexing source and hallucinates with 0 citations + 0 confidence. We raise NiaSourceNotReady on that exact signature.",
    },
    {
        title: "POST /sources duplicates",
        body: "Per-user row created every time, even when Nia has the paper globally. Always GET /sources first to dedup; cache source_id in SQLite.",
    },
    {
        title: "haiku model 404",
        body: "claude-haiku-35-20241022 from the docs returns 404. Sonnet stays.",
    },
]

export function AnthillNiaSchemaDemo() {
    return (
        <Card className="overflow-hidden p-0 not-prose">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                <Panel
                    title="Schema we send"
                    sub="POST /v2/document/agent · structured_output"
                    code={SCHEMA}
                />
                <Panel
                    title="Verdict that comes back"
                    sub="merged into citation node's verification field"
                    code={VERDICT}
                />
            </div>

            <div className="border-t bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="size-3.5 text-amber-500" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        War stories from <span className="font-mono text-foreground">nia_client.py</span>
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {warStories.map((w, i) => (
                        <motion.div
                            key={w.title}
                            initial={{ opacity: 0, y: 4 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                            <Card className="p-3">
                                <div className="text-sm font-medium leading-snug">{w.title}</div>
                                <div className="text-xs text-muted-foreground leading-relaxed mt-1">{w.body}</div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

function Panel({ title, sub, code }: { title: string; sub: string; code: string }) {
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-2">
                <div>
                    <div className="text-sm font-medium">{title}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{sub}</div>
                </div>
            </div>
            <div className="p-4 flex-1">
                <pre className="text-[11.5px] leading-relaxed font-mono bg-muted/40 rounded-md border p-3 overflow-x-auto whitespace-pre">
                    {code}
                </pre>
            </div>
        </div>
    )
}
