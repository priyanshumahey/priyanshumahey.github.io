"use client"

import { motion } from "framer-motion"
import Image from "next/image"

// Main hero card - shows the Fleur icon
export function FleurHeroCard() {
    return (
        <div className="w-full h-full bg-gradient-to-br from-[#0a0a12] via-[#0d0d1a] to-[#0a0a12] flex items-center justify-center relative overflow-hidden">
            {/* Subtle blue gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#444ce7]/5 via-transparent to-[#6366f1]/5" />
            
            {/* Background glow effect */}
            <motion.div
                className="absolute w-40 h-40 rounded-full bg-[#444ce7]/20 blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            
            {/* Secondary glow */}
            <motion.div
                className="absolute w-32 h-32 rounded-full bg-[#6366f1]/15 blur-2xl -translate-x-12 translate-y-8"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                }}
            />

            {/* Central icon */}
            <motion.div
                className="relative z-10"
                animate={{
                    y: [0, -4, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Image
                    src="/projects/fleur/icon.svg"
                    alt="Fleur"
                    width={62}
                    height={96}
                    className="drop-shadow-[0_0_25px_rgba(68,76,231,0.4)]"
                />
            </motion.div>

            {/* Subtle grid pattern */}
            <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(99,102,241,0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '24px 24px'
                }}
            />
        </div>
    )
}

// Hover card - shows the VS Code-like editor with AI completion
export function FleurEditorCard() {
    return (
        <div className="w-full h-full bg-gradient-to-br from-[#0a0a12] via-[#0d0d1a] to-[#0a0a12] flex items-center justify-center relative overflow-hidden p-4">
            {/* Subtle blue gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#444ce7]/5 via-transparent to-[#6366f1]/5" />
            
            {/* Background glow effect */}
            <motion.div
                className="absolute w-32 h-32 rounded-full bg-[#444ce7]/20 blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Mini VS Code-like editor window */}
            <div className="relative z-10 w-full max-w-[280px] rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] shadow-2xl overflow-hidden not-prose">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-3 py-2 bg-[#252526] border-b border-[#1a1a1a]">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <span className="text-[10px] text-[#808080]">fleur</span>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex items-center bg-[#252526] border-b border-[#1a1a1a]">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] border-r border-[#1a1a1a]">
                        <div className="w-3 h-3 flex items-center justify-center">
                            <Image
                                src="/projects/fleur/icon.svg"
                                alt=""
                                width={10}
                                height={16}
                            />
                        </div>
                        <span className="text-[10px] text-[#cccccc]">main.py</span>
                    </div>
                </div>

                {/* Editor content */}
                <div className="font-mono text-[9px] leading-[1.6] p-2 min-h-[100px] relative">
                    {/* Line 1 */}
                    <div className="flex whitespace-pre">
                        <span className="w-5 text-right pr-2 text-[#858585] select-none">1</span>
                        <span className="bg-transparent">
                            <span className="text-[#c586c0]">def</span>
                            <span className="text-[#dcdcaa]"> search</span>
                            <span className="text-[#d4d4d4]">(</span>
                            <span className="text-[#9cdcfe]">query</span>
                            <span className="text-[#d4d4d4]">):</span>
                        </span>
                    </div>
                    
                    {/* Line 2 */}
                    <div className="flex whitespace-pre">
                        <span className="w-5 text-right pr-2 text-[#858585] select-none">2</span>
                        <span className="bg-transparent">
                            <span className="text-[#d4d4d4]">{"    "}</span>
                            <span className="text-[#9cdcfe]">emb</span>
                            <span className="text-[#d4d4d4]"> = </span>
                            <span className="text-[#dcdcaa]">embed</span>
                            <span className="text-[#d4d4d4]">(</span>
                            <span className="text-[#9cdcfe]">query</span>
                            <span className="text-[#d4d4d4]">)</span>
                        </span>
                    </div>
                    
                    {/* Line 3 with ghost text */}
                    <div className="flex whitespace-pre">
                        <span className="w-5 text-right pr-2 text-[#858585] select-none">3</span>
                        <span className="relative bg-transparent">
                            <span className="text-[#d4d4d4]">{"    "}</span>
                            <span className="text-[#c586c0]">return</span>
                            <span className="text-[#d4d4d4]"> </span>
                            {/* Cursor */}
                            <motion.span 
                                className="inline-block w-[1px] h-[1.1em] bg-[#aeafad] align-middle"
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            {/* Ghost prediction */}
                            <motion.span
                                className="text-[#6e6e6e]"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                index.search(emb, k=10)
                            </motion.span>
                        </span>
                    </div>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between px-2 py-1 bg-[#007acc] text-[8px] text-white">
                    <div className="flex items-center gap-2">
                        <span>✓ AI Ready</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.span
                            className="flex items-center gap-1"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            Copilot
                        </motion.span>
                    </div>
                </div>
            </div>
        </div>
    )
}
