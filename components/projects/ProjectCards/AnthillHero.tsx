"use client"

import { motion } from "framer-motion"

/**
 * Compact "card" version of the Anthill editor for the homepage gallery.
 * Designed to fit in a square-ish gallery tile without overflowing.
 */
export function AnthillHeroCard() {
    return (
        <div className="w-full h-full bg-gradient-to-br from-[#0a0a14] via-[#0e0e1a] to-[#0a0a14] flex items-center justify-center relative overflow-hidden p-3">
            {/* Background glow */}
            <motion.div
                className="absolute w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl -translate-x-12 -translate-y-8"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute w-40 h-40 rounded-full bg-violet-500/10 blur-3xl translate-x-12 translate-y-8"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: "22px 22px",
                }}
            />

            {/* Editor mock */}
            <div className="relative z-10 w-full max-w-[280px] rounded-lg border border-[#2a2a3a] bg-[#0c0c14] shadow-2xl overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a10] border-b border-[#1a1a24]">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                        <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
                        <div className="w-2 h-2 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="flex-1 text-center text-[8px] text-zinc-500 font-mono">anthill</div>
                    {/* Presence stack */}
                    <div className="flex items-center -space-x-1">
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-[#0a0a10] text-[6px] font-bold text-white flex items-center justify-center">P</div>
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 rounded-full bg-violet-500"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                                transition={{ duration: 1.8, repeat: Infinity }}
                            />
                            <div className="relative w-3.5 h-3.5 rounded-full bg-violet-500 border border-[#0a0a10] text-[6px] font-bold text-white flex items-center justify-center">AI</div>
                        </div>
                    </div>
                </div>

                {/* Document body */}
                <div className="p-3 text-[8.5px] leading-relaxed text-zinc-300 font-serif min-h-[120px]">
                    <div className="text-[7px] uppercase tracking-widest text-zinc-600 mb-1">Section 3 · Method</div>
                    <p>
                        Dense retrievers reduce hallucinations on long-tail QA by grounding generation in a fixed corpus
                        <span className="inline-flex items-center gap-0.5 align-middle mx-0.5 px-1 py-0 rounded text-[7px] font-mono border bg-emerald-500/10 border-emerald-500/40 text-emerald-300">
                            <span className="w-0.5 h-0.5 rounded-full bg-current" />
                            arXiv:2401
                        </span>
                        .
                    </p>
                    <p className="mt-1.5">
                        We extend this to code with an instruction-tuned encoder
                        <motion.span
                            className="inline-block w-[1px] h-[0.9em] bg-zinc-200 align-middle mx-0.5"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                        />
                        <motion.span
                            className="inline-flex items-center gap-1 align-middle ml-0.5 px-1 py-0 rounded text-[7px] font-mono bg-violet-500/10 border border-violet-500/40 text-violet-300"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <span>arXiv:2305</span>
                            <span className="px-0.5 rounded bg-[#1a1a28] text-[6px] text-zinc-400">Tab</span>
                        </motion.span>
                    </p>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between px-2 py-1 bg-[#0a0a10] border-t border-[#1a1a24] text-[7px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        Yjs synced
                    </span>
                    <span className="text-violet-300">citation_inserter</span>
                </div>
            </div>
        </div>
    )
}
