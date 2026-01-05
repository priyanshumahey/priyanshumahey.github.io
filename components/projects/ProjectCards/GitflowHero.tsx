"use client"

import { useEffect, useState } from "react";

// Branch colors with glow variants
const branchColors: Record<string, { main: string; glow: string }> = {
    main: { main: "#10b981", glow: "rgba(16, 185, 129, 0.4)" },
    feature: { main: "#8b5cf6", glow: "rgba(139, 92, 246, 0.4)" },
    hotfix: { main: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" },
    release: { main: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)" },
}

const miniCommits = [
    { id: "c1", branch: "main", parents: ["c2"], y: 0 },
    { id: "c2", branch: "main", parents: ["c3"], y: 1 },
    { id: "c3", branch: "main", parents: ["c4"], y: 2 },
    { id: "c4", branch: "main", parents: ["c5", "f3"], y: 3 }, // merge from feature
    { id: "c5", branch: "main", parents: ["c6"], y: 4 },
    { id: "f1", branch: "feature", parents: ["f2"], y: 2 },
    { id: "f2", branch: "feature", parents: ["f3"], y: 3 },
    { id: "f3", branch: "feature", parents: ["c6"], y: 4 }, // branches from main
    { id: "c6", branch: "main", parents: ["c7", "h2"], y: 5 }, // merge from hotfix
    { id: "c7", branch: "main", parents: ["c8"], y: 6 },
    { id: "h1", branch: "hotfix", parents: ["h2"], y: 5 },
    { id: "h2", branch: "hotfix", parents: ["c8"], y: 6 }, // branches from main
    { id: "c8", branch: "main", parents: ["c9"], y: 7 },
    { id: "c9", branch: "main", parents: [], y: 8 },
]

const branchLanes: Record<string, number> = {
    main: 0,
    feature: 1,
    hotfix: 2,
    release: 3,
}

function createCurve(fromX: number, fromY: number, toX: number, toY: number, cornerRadius: number): string {
    // Same column = straight line
    if (fromX === toX) {
        return `M ${fromX} ${fromY} L ${toX} ${toY}`
    }

    const goingRight = toX > fromX
    const goingDown = toY > fromY
    const r = Math.min(cornerRadius, Math.abs(toX - fromX) / 2, Math.abs(toY - fromY) / 2)

    // For branch-off (parent is in outer column): horizontal first, then vertical
    // For merge (current is in outer column): vertical first, then horizontal
    const currentIsOuter = fromX > toX

    if (currentIsOuter) {
        // Merge: current is on feature, parent is on main
        // Go vertical down first, then curve horizontal to main
        const sweepFlag = goingRight ? (goingDown ? 0 : 1) : goingDown ? 1 : 0
        return `M ${fromX} ${fromY} 
            L ${fromX} ${toY - (goingDown ? r : -r)} 
            A ${r} ${r} 0 0 ${sweepFlag} ${fromX + (goingRight ? r : -r)} ${toY} 
            L ${toX} ${toY}`
    } else {
        // Branch-off: current is on main, parent is on feature
        // Go horizontal first, then curve vertical down to feature
        const sweepFlag = goingRight ? (goingDown ? 1 : 0) : goingDown ? 0 : 1
        return `M ${fromX} ${fromY} 
            L ${toX - (goingRight ? r : -r)} ${fromY} 
            A ${r} ${r} 0 0 ${sweepFlag} ${toX} ${fromY + (goingDown ? r : -r)} 
            L ${toX} ${toY}`
    }
}

function MiniGitGraph() {
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 300)
        return () => clearTimeout(timer)
    }, [])

    const nodeSize = 10
    const rowHeight = 36
    const columnWidth = 36
    const padding = 30

    const getPosition = (commit: (typeof miniCommits)[0]) => ({
        x: padding + branchLanes[commit.branch] * columnWidth,
        y: padding + commit.y * rowHeight,
    })

    // Generate paths
    const paths: { d: string; color: string; glow: string }[] = []

    miniCommits.forEach((commit) => {
        const currentPos = getPosition(commit)
        const currentLane = branchLanes[commit.branch]

        commit.parents.forEach((parentId) => {
            const parent = miniCommits.find((c) => c.id === parentId)
            if (!parent) return

            const parentPos = getPosition(parent)
            const parentLane = branchLanes[parent.branch]

            const outerBranch = currentLane > parentLane ? commit.branch : parent.branch
            const colors = branchColors[outerBranch] || branchColors.main

            paths.push({
                d: createCurve(currentPos.x, currentPos.y, parentPos.x, parentPos.y, 10),
                color: colors.main,
                glow: colors.glow,
            })
        })
    })

    const svgWidth = padding * 2 + columnWidth * 3
    const svgHeight = padding * 2 + rowHeight * 8

    return (
        <svg
            width={svgWidth}
            height={svgHeight}
            className={`transition-opacity duration-700 ${animate ? "opacity-100" : "opacity-0"}`}
        >
            {/* Glow filter */}
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Path glows */}
            {paths.map((path, i) => (
                <path
                    key={`glow-${i}`}
                    d={path.d}
                    fill="none"
                    stroke={path.glow}
                    strokeWidth={6}
                    strokeLinecap="round"
                    opacity={0.5}
                    className="transition-all duration-500"
                    style={{
                        strokeDasharray: animate ? "none" : "1000",
                        strokeDashoffset: animate ? 0 : 1000,
                        transitionDelay: `${i * 30}ms`,
                    }}
                />
            ))}

            {/* Main paths */}
            {paths.map((path, i) => (
                <path
                    key={i}
                    d={path.d}
                    fill="none"
                    stroke={path.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                    style={{
                        strokeDasharray: animate ? "none" : "1000",
                        strokeDashoffset: animate ? 0 : 1000,
                        transitionDelay: `${i * 30}ms`,
                    }}
                />
            ))}

            {/* Nodes */}
            {miniCommits.map((commit, i) => {
                const pos = getPosition(commit)
                const colors = branchColors[commit.branch] || branchColors.main
                const isMerge = commit.parents.length > 1

                return (
                    <g key={commit.id}>
                        {/* Outer glow */}
                        <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={nodeSize + 6}
                            fill={colors.glow}
                            opacity={animate ? 0.4 : 0}
                            className="transition-all duration-500"
                            style={{ transitionDelay: `${i * 50}ms` }}
                        />
                        {/* Main node */}
                        <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={isMerge ? nodeSize : nodeSize - 2}
                            fill={isMerge ? "transparent" : colors.main}
                            stroke={colors.main}
                            strokeWidth={isMerge ? 2.5 : 0}
                            className={`transition-all duration-300 ${animate ? "scale-100" : "scale-0"}`}
                            style={{
                                transformOrigin: `${pos.x}px ${pos.y}px`,
                                transitionDelay: `${i * 50}ms`,
                            }}
                        />
                        {/* Inner dot for merge commits */}
                        {isMerge && (
                            <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={3}
                                fill={colors.main}
                                className={`transition-all duration-300 ${animate ? "scale-100" : "scale-0"}`}
                                style={{
                                    transformOrigin: `${pos.x}px ${pos.y}px`,
                                    transitionDelay: `${i * 50 + 100}ms`,
                                }}
                            />
                        )}
                    </g>
                )
            })}
        </svg>
    )
}

export function GitHeroCard() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            {/* Background pattern - subtle dots */}
            <div className="absolute inset-0 opacity-[0.03]">
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="dots-hero" width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="12" cy="12" r="1" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots-hero)" />
                </svg>
            </div>

            {/* Gradient orbs for depth */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 lg:w-96 lg:h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 lg:w-96 lg:h-96 bg-violet-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex h-full">
                {/* Left side - Typography only */}
                <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-8">
                    <div
                        className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter text-white">
                            git<span className="text-emerald-400">flow</span>
                        </h1>
                    </div>
                </div>

                {/* Right side - Graph Preview */}
                <div className="flex-1 flex items-center justify-center relative pr-4 sm:pr-6 lg:pr-8">
                    {/* Decorative gradient */}
                    <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/5 via-transparent to-transparent" />

                    <div
                        className={`relative bg-black/40 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-white/10 p-3 sm:p-4 lg:p-6 shadow-2xl transition-all duration-700 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                        style={{ transitionDelay: "200ms" }}
                    >
                        {/* Window controls */}
                        <div className="flex items-center gap-1.5 lg:gap-2 mb-2 lg:mb-4 pb-2 lg:pb-4 border-b border-white/5">
                            <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-red-500" />
                            <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-yellow-500" />
                            <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-green-500" />
                            <span className="text-[10px] lg:text-xs text-zinc-500 ml-2 lg:ml-3 font-mono hidden sm:inline">repository</span>
                        </div>

                        <MiniGitGraph />

                        {/* Branch labels */}
                        <div className="flex gap-2 lg:gap-4 mt-2 lg:mt-4 pt-2 lg:pt-4 border-t border-white/5">
                            {Object.entries(branchColors)
                                .slice(0, 3)
                                .map(([name, colors]) => (
                                    <div key={name} className="flex items-center gap-1 lg:gap-2">
                                        <div
                                            className="w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 rounded-full"
                                            style={{
                                                backgroundColor: colors.main,
                                                boxShadow: `0 0 8px ${colors.glow}`,
                                            }}
                                        />
                                        <span className="text-[10px] lg:text-xs text-zinc-400 font-mono">{name}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        </div>
    )
}
