"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
    ChevronRight,
    Code2,
    FileCode,
    Files,
    Folder,
    FolderOpen,
    GitBranch,
    MessageSquare,
    Play,
    Search,
    Settings,
    Sparkles,
    Terminal,
    X
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

// ─── Layer definitions ────────────────────────────────────────────
// Z offsets are ALL positive so every layer renders in front of the base plane.
// Ordered from back (statusbar, z=0) to front (titlebar, z=240).
// This ensures every layer is always clickable in 3D space.

interface Layer {
    id: string
    label: string
    shortLabel: string
    description: string
    color: string
    zOffset: number
    staggerIndex: number
}

const layers: Layer[] = [
    {
        id: "statusbar",
        label: "Status Bar",
        shortLabel: "Status",
        description: "Backend health, file indexer, language mode, cursor position, terminal toggle",
        color: "#06b6d4",
        zOffset: 0,
        staggerIndex: 6,
    },
    {
        id: "chat",
        label: "Copilot Chat",
        shortLabel: "Copilot",
        description: "AI assistant with tool calls, streaming responses, file diffs, and @-mention file picker",
        color: "#8b5cf6",
        zOffset: 40,
        staggerIndex: 5,
    },
    {
        id: "terminal",
        label: "Terminal",
        shortLabel: "Terminal",
        description: "Integrated shell with ANSI color output via Tauri plugin-shell",
        color: "#ef4444",
        zOffset: 80,
        staggerIndex: 4,
    },
    {
        id: "editor",
        label: "Editor",
        shortLabel: "Editor",
        description: "Monaco-powered editor with draggable tabs, syntax highlighting, and inline AI diffs",
        color: "#3b82f6",
        zOffset: 120,
        staggerIndex: 3,
    },
    {
        id: "sidebar",
        label: "Left Sidebar",
        shortLabel: "Sidebar",
        description: "File explorer, code search with regex, and Git status panels",
        color: "#f59e0b",
        zOffset: 160,
        staggerIndex: 2,
    },
    {
        id: "activity-bar",
        label: "Activity Bar",
        shortLabel: "Activity",
        description: "48px vertical icon rail — Explorer, Search, Git, Logs, Settings",
        color: "#22c55e",
        zOffset: 200,
        staggerIndex: 1,
    },
    {
        id: "titlebar",
        label: "Title Bar",
        shortLabel: "Title",
        description: "Native macOS title bar with traffic-light buttons, app name, and Copilot toggle",
        color: "#818cf8",
        zOffset: 240,
        staggerIndex: 0,
    },
]

// Lookup by id for rendering order (we render back-to-front)
const layerById = Object.fromEntries(layers.map((l) => [l.id, l]))

// Render order: layers array is already back-to-front (statusbar first → titlebar last)
// This matches natural 3D: lower z paints first, higher z paints on top

// ─── Mini UI Components ─────────────────────────────────────────

function TitleBarContent() {
    return (
        <div className="flex items-center h-full px-3 gap-2">
            <div className="flex gap-1 mr-3">
                <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
                <div className="w-2 h-2 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 text-center">
                <span className="text-[9px] text-zinc-400 font-medium tracking-widest uppercase">Fleur</span>
            </div>
            <Sparkles className="w-2.5 h-2.5 text-purple-400/60" />
        </div>
    )
}

function ActivityBarContent() {
    const icons = [
        { Icon: Files, active: true },
        { Icon: Search, active: false },
        { Icon: GitBranch, active: false },
        { Icon: MessageSquare, active: false },
    ]
    return (
        <div className="flex flex-col items-center gap-2.5 pt-5 pb-2">
            {icons.map(({ Icon, active }, i) => (
                <div key={i} className="relative">
                    {active && (
                        <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-[2px] h-2.5 bg-white rounded-full" />
                    )}
                    <Icon className={`w-3 h-3 ${active ? "text-white" : "text-zinc-600"}`} />
                </div>
            ))}
            <div className="mt-auto pt-6">
                <Settings className="w-3 h-3 text-zinc-600" />
            </div>
        </div>
    )
}

function SidebarContent() {
    const files = [
        { name: "src", isFolder: true, open: true, indent: 0 },
        { name: "components", isFolder: true, open: true, indent: 1 },
        { name: "Editor.tsx", isFolder: false, open: false, indent: 2, active: true },
        { name: "Chat.tsx", isFolder: false, open: false, indent: 2 },
        { name: "Terminal.tsx", isFolder: false, open: false, indent: 2 },
        { name: "lib", isFolder: true, open: false, indent: 1 },
        { name: "app", isFolder: true, open: false, indent: 1 },
        { name: "package.json", isFolder: false, open: false, indent: 0 },
        { name: "tsconfig.json", isFolder: false, open: false, indent: 0 },
    ]
    return (
        <div className="py-2 px-1">
            <div className="text-[8px] uppercase tracking-wider text-zinc-500 font-semibold px-2 mb-2">Explorer</div>
            {files.map((f, i) => (
                <div
                    key={i}
                    className={`flex items-center gap-1 py-[2px] text-[9px] rounded ${"active" in f && f.active ? "bg-white/5" : ""
                        }`}
                    style={{ paddingLeft: `${f.indent * 10 + 8}px` }}
                >
                    {f.isFolder ? (
                        <>
                            <ChevronRight className={`w-2 h-2 text-zinc-500 ${f.open ? "rotate-90" : ""}`} />
                            {f.open ? (
                                <FolderOpen className="w-2.5 h-2.5 text-yellow-600/70" />
                            ) : (
                                <Folder className="w-2.5 h-2.5 text-yellow-600/50" />
                            )}
                        </>
                    ) : (
                        <>
                            <span className="w-2" />
                            <FileCode className="w-2.5 h-2.5 text-blue-400/50" />
                        </>
                    )}
                    <span className={f.isFolder ? "text-zinc-300" : "text-zinc-400"}>{f.name}</span>
                </div>
            ))}
        </div>
    )
}

function EditorContent() {
    const lines = [
        { n: 1, t: [{ s: "import", c: "#c586c0" }, { s: " { useState } ", c: "#9cdcfe" }, { s: "from", c: "#c586c0" }, { s: " 'react'", c: "#ce9178" }] },
        { n: 2, t: [] },
        { n: 3, t: [{ s: "export function", c: "#569cd6" }, { s: " Editor", c: "#dcdcaa" }, { s: "() {", c: "#d4d4d4" }] },
        { n: 4, t: [{ s: "  const", c: "#569cd6" }, { s: " [code, setCode]", c: "#9cdcfe" }, { s: " = ", c: "#d4d4d4" }, { s: "useState", c: "#dcdcaa" }, { s: "('')", c: "#ce9178" }] },
        { n: 5, t: [] },
        { n: 6, t: [{ s: "  return", c: "#c586c0" }, { s: " (", c: "#d4d4d4" }] },
        { n: 7, t: [{ s: "    <MonacoEditor", c: "#4ec9b0" }] },
        { n: 8, t: [{ s: "      value", c: "#92d1f7" }, { s: "={code}", c: "#9cdcfe" }] },
        { n: 9, t: [{ s: "      language", c: "#92d1f7" }, { s: '="typescript"', c: "#ce9178" }] },
    ]
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center h-6 bg-[#0c0c14] border-b border-[#1f1f2e]">
                <div className="flex items-center gap-1 px-2 py-1 bg-[#0c0c14] border-r border-[#1f1f2e] text-[7px] text-zinc-300">
                    <FileCode className="w-2 h-2 text-blue-400/70" />
                    <span>Editor.tsx</span>
                    <X className="w-1.5 h-1.5 text-zinc-600 ml-1" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-[#15152a] text-[7px] text-zinc-500">
                    <FileCode className="w-2 h-2 text-purple-400/50" />
                    <span>Chat.tsx</span>
                </div>
            </div>
            <div className="flex-1 p-1 font-mono text-[7px] leading-[13px]">
                {lines.map((line) => (
                    <div key={line.n} className="flex">
                        <span className="w-5 text-right pr-2 text-zinc-600 select-none">{line.n}</span>
                        <span>{line.t.map((tok, j) => <span key={j} style={{ color: tok.c }}>{tok.s}</span>)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function TerminalContent() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center h-4 px-2 border-b border-[#1f1f2e] text-[7px]">
                <Terminal className="w-2 h-2 text-zinc-500 mr-1" />
                <span className="text-zinc-400 mr-2">Terminal</span>
                <span className="text-zinc-600 text-[6px]">zsh</span>
                <div className="ml-auto flex items-center gap-1">
                    <Play className="w-2 h-2 text-zinc-600" />
                    <X className="w-2 h-2 text-zinc-600" />
                </div>
            </div>
            <div className="flex-1 p-1.5 font-mono text-[7px]">
                <div className="text-green-400">~/fleur <span className="text-zinc-500">$</span> <span className="text-zinc-300">bun dev</span></div>
                <div className="text-zinc-500 mt-0.5">▶ Starting Tauri development server...</div>
                <div className="text-blue-400 mt-0.5">  Ready on http://localhost:3000</div>
                <div className="text-green-400 mt-1">~/fleur <span className="text-zinc-500">$</span> <span className="text-zinc-400 animate-pulse">▌</span></div>
            </div>
        </div>
    )
}

function ChatContent() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center h-4 px-2 border-b border-[#1f1f2e]">
                <Sparkles className="w-2 h-2 text-purple-400 mr-1" />
                <span className="text-[7px] text-zinc-300 font-medium">Copilot</span>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-hidden">
                <div className="bg-[#15152a] rounded p-1.5">
                    <div className="text-[7px] text-purple-300 mb-0.5 font-medium">Copilot</div>
                    <div className="text-[7px] text-zinc-400 leading-[10px]">
                        I&apos;ll refactor the Editor component to use the new hooks...
                    </div>
                </div>
                <div className="bg-[#0a0a12] rounded p-1.5 border border-[#1f1f2e]">
                    <div className="flex items-center gap-1 text-[7px]">
                        <Code2 className="w-2 h-2 text-cyan-400" />
                        <span className="text-cyan-400">read_file</span>
                        <span className="text-zinc-600">→ Editor.tsx</span>
                    </div>
                </div>
                <div className="bg-[#0a0a12] rounded p-1.5 border border-green-900/30">
                    <div className="flex items-center gap-1 text-[7px] mb-1">
                        <FileCode className="w-2 h-2 text-green-400" />
                        <span className="text-green-400">Editor.tsx</span>
                        <span className="text-zinc-600 text-[6px]">modified</span>
                    </div>
                    <div className="font-mono text-[6px] space-y-[1px]">
                        <div className="text-red-400/60">- const [code] = useState()</div>
                        <div className="text-green-400/60">+ const [code] = useEditor()</div>
                    </div>
                </div>
            </div>
            <div className="px-2 pb-1.5">
                <div className="bg-[#15152a] rounded-md px-2 py-1 text-[7px] text-zinc-500 border border-[#1f1f2e]">
                    Ask Copilot...
                </div>
            </div>
        </div>
    )
}

function StatusBarContent() {
    return (
        <div className="flex items-center justify-between h-full px-2">
            <div className="flex items-center gap-2 text-[7px]">
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-zinc-200">Backend</span>
                </div>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-300">fleur</span>
            </div>
            <div className="flex items-center gap-2 text-[7px]">
                <span className="text-zinc-300">TypeScript</span>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-300">Ln 7, Col 22</span>
                <Terminal className="w-2 h-2 text-zinc-300" />
            </div>
        </div>
    )
}

// Content map
const layerContent: Record<string, React.ReactNode> = {
    titlebar: <TitleBarContent />,
    "activity-bar": <ActivityBarContent />,
    sidebar: <SidebarContent />,
    editor: <EditorContent />,
    terminal: <TerminalContent />,
    chat: <ChatContent />,
    statusbar: <StatusBarContent />,
}

// Assembled positions (within 420×300 editor frame)
const assembledPos: Record<string, React.CSSProperties> = {
    titlebar: { top: 0, left: 0, right: 0, height: 28 },
    "activity-bar": { top: 28, left: 0, width: 42, bottom: 22 },
    sidebar: { top: 28, left: 42, width: 140, bottom: 22 },
    editor: { top: 28, left: 182, right: 160, height: 230 },
    terminal: { top: 258, left: 182, right: 160, bottom: 22 },
    chat: { top: 28, right: 0, width: 160, bottom: 22 },
    statusbar: { bottom: 0, left: 0, right: 0, height: 22 },
}

// Background colors for layers
const layerBg: Record<string, string> = {
    titlebar: "#0c0c14",
    "activity-bar": "#0c0c14",
    sidebar: "#0c0c14",
    editor: "#0c0c14",
    terminal: "#0c0c14",
    chat: "#0c0c14",
    statusbar: "#1d4ed8",
}

// ─── Main Component ────────────────────────────────────────────────

// Auto-play order: cycle through layers one-by-one then assemble
const autoPlayOrder = [
    "titlebar", "activity-bar", "sidebar", "editor", "terminal", "chat", "statusbar", null,
] as const

export function FleurExplodedView() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)
    const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
    const [isAutoPlaying, setIsAutoPlaying] = useState(false)
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
    const cycleIndexRef = useRef(0)

    // Selection drives explosion: exploded whenever something is selected
    const isExploded = selectedLayer !== null

    // Auto-play: cycle through selecting each layer, then null to assemble
    useEffect(() => {
        if (!isAutoPlaying) return

        const tick = () => {
            const item = autoPlayOrder[cycleIndexRef.current % autoPlayOrder.length]
            setSelectedLayer(item ?? null)
            cycleIndexRef.current += 1
        }

        // First tick after a short delay
        const initial = setTimeout(tick, 1200)
        autoPlayRef.current = setInterval(tick, 2500)

        return () => {
            clearTimeout(initial)
            if (autoPlayRef.current) clearInterval(autoPlayRef.current)
        }
    }, [isAutoPlaying])

    const stopAutoPlay = useCallback(() => {
        setIsAutoPlaying(false)
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current)
            autoPlayRef.current = null
        }
    }, [])

    const handleLayerHover = useCallback(
        (id: string | null) => {
            setHoveredLayer(id)
            if (id !== null) stopAutoPlay()
        },
        [stopAutoPlay]
    )

    // Click a layer → select it (explode). Click again → deselect (assemble).
    const handleLayerClick = useCallback(
        (id: string) => {
            stopAutoPlay()
            setSelectedLayer((prev) => (prev === id ? null : id))
        },
        [stopAutoPlay]
    )

    const hoveredInfo = hoveredLayer ? layerById[hoveredLayer] : null
    const selectedInfo = selectedLayer ? layerById[selectedLayer] : null
    const displayInfo = selectedInfo ?? hoveredInfo

    return (
        <div
            ref={containerRef}
            className="w-full bg-[#08080c] rounded-2xl border border-[#1a1a24] overflow-hidden select-none"
        >
            {/* ── Header ── */}
            <div className="px-5 py-3 border-b border-[#1a1a24] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#444ce7]" />
                    <span className="text-sm text-zinc-300 font-medium">Editor Anatomy</span>
                    <span className="text-[10px] text-zinc-600 font-mono">7 layers</span>
                </div>
            </div>

            {/* ── 3D Viewport ── */}
            <div
                className="relative w-full"
                style={{
                    height: 520,
                    perspective: 2000,
                    perspectiveOrigin: "50% 45%",
                }}
                onClick={() => {
                    if (selectedLayer) {
                        stopAutoPlay()
                        setSelectedLayer(null)
                    }
                }}
            >
                {/* 3D scene — fixed gentle isometric angle when exploded */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{
                        rotateX: isExploded ? 10 : 0,
                        rotateY: isExploded ? -16 : 0,
                    }}
                    transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div
                        className="relative"
                        style={{ width: 560, height: 400, transformStyle: "preserve-3d" }}
                    >
                        {/* Render layers back-to-front (statusbar → titlebar) */}
                        {layers.map((layer) => (
                            <LayerCard
                                key={layer.id}
                                layer={layer}
                                isExploded={isExploded}
                                isHovered={hoveredLayer === layer.id}
                                isSelected={selectedLayer === layer.id}
                                anySelected={selectedLayer !== null}
                                onHover={() => handleLayerHover(layer.id)}
                                onLeave={() => setHoveredLayer(null)}
                                onClick={() => handleLayerClick(layer.id)}
                            >
                                {layerContent[layer.id]}
                            </LayerCard>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Info + Legend footer ── */}
            <div className="px-5 py-3 bg-[#0a0a10] border-t border-[#1a1a24]">
                <AnimatePresence mode="wait">
                    {displayInfo ? (
                        <motion.div
                            key={displayInfo.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-start gap-3"
                        >
                            <div
                                className="w-2 h-2 rounded-full mt-1 shrink-0"
                                style={{ backgroundColor: displayInfo.color }}
                            />
                            <div className="min-w-0">
                                <span className="text-sm text-zinc-200 font-medium">{displayInfo.label}</span>
                                <div className="text-xs text-zinc-500 mt-0.5">{displayInfo.description}</div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="legend"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-wrap gap-x-4 gap-y-1"
                        >
                            {layers.map((l) => (
                                <button
                                    key={l.id}
                                    className="flex items-center gap-1.5 cursor-pointer group"
                                    onClick={() => handleLayerClick(l.id)}
                                >
                                    <div
                                        className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-150"
                                        style={{ backgroundColor: l.color }}
                                    />
                                    <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                        {l.label}
                                    </span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// ─── Layer Card ─────────────────────────────────────────────────────

function LayerCard({
    layer,
    isExploded,
    isHovered,
    isSelected,
    anySelected,
    onHover,
    onLeave,
    onClick,
    children,
}: {
    layer: Layer
    isExploded: boolean
    isHovered: boolean
    isSelected: boolean
    anySelected: boolean
    onHover: () => void
    onLeave: () => void
    onClick: () => void
    children: React.ReactNode
}) {
    const highlighted = isHovered || isSelected
    // Dim non-selected layers when something is selected
    const dimmed = anySelected && !isSelected && !isHovered

    return (
        <motion.div
            className="absolute overflow-hidden"
            style={{
                ...assembledPos[layer.id],
                transformStyle: "preserve-3d",
                cursor: "pointer",
                background: layerBg[layer.id],
                willChange: "transform, opacity",
            }}
            animate={{
                translateZ: isExploded ? layer.zOffset : 0,
                scale: isExploded ? (highlighted ? 0.94 : 0.88) : 1,
                opacity: dimmed ? 0.4 : 1,
                borderRadius: isExploded ? 8 : 0,
            }}
            transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
                // Stagger: low staggerIndex explodes first, high staggerIndex assembles first
                delay: isExploded
                    ? layer.staggerIndex * 0.05
                    : (layers.length - 1 - layer.staggerIndex) * 0.04,
                scale: { duration: 0.35 },
                opacity: { duration: 0.3 },
            }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
        >
            {/* Border + accent */}
            <div
                className="absolute inset-0 rounded-[inherit] pointer-events-none"
                style={{
                    border: `1px solid ${highlighted ? layer.color : "#1f1f2e"}`,
                    transition: "border-color 0.2s",
                }}
            />

            {/* Left color accent bar (matches CodeIndexingArchitecture node style) */}
            <motion.div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[inherit]"
                style={{ backgroundColor: layer.color }}
                animate={{ opacity: isExploded ? (highlighted ? 1 : 0.4) : 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Active glow */}
            <AnimatePresence>
                {highlighted && isExploded && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none rounded-[inherit]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Outer glow */}
                        <motion.div
                            className="absolute -inset-[3px] rounded-[11px] pointer-events-none"
                            style={{ border: `2px solid ${layer.color}` }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Label badge */}
            <AnimatePresence>
                {isExploded && (
                    <motion.div
                        className="absolute top-0 right-0 z-20 px-1.5 py-[2px] rounded-bl-md text-[7px] font-semibold tracking-wide uppercase"
                        style={{
                            backgroundColor: `${layer.color}20`,
                            color: layer.color,
                            borderBottom: `1px solid ${layer.color}30`,
                            borderLeft: `1px solid ${layer.color}30`,
                        }}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ delay: 0.1 + layer.staggerIndex * 0.06, duration: 0.3, ease: "backOut" }}
                    >
                        {layer.shortLabel}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-0 w-full h-full">{children}</div>
        </motion.div>
    )
}