"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

/**
 * GitflowDemo - A clean SVG-based git graph visualization with smooth animations.
 * Uses the same layout logic as gitflowgraph.tsx but self-contained for demo purposes.
 */

// ============================================================================
// TYPES
// ============================================================================

interface Commit {
  id: string
  hash: string
  message: string
  branch: string
  parents: string[]
  refs?: Array<{ type: "head" | "branch" | "tag"; name: string }>
}

// ============================================================================
// CONSTANTS (matching gitflowgraph.tsx)
// ============================================================================

const ROW_HEIGHT = 32
const COLUMN_WIDTH = 20
const NODE_RADIUS = 4
const LINE_WIDTH = 2
const GRAPH_PADDING = 16

// Branch color palette
const BRANCH_COLORS: Record<string, string> = {
  main: "#10b981",
  "feature/auth": "#8b5cf6",
  "feature/api": "#3b82f6",
  "hotfix/login": "#ef4444",
}

// ============================================================================
// COMMIT DATA
// ============================================================================

const ALL_COMMITS: Commit[] = [
  {
    id: "c0",
    hash: "a7f3d2c",
    message: "Merge 'feature/auth' into main",
    branch: "main",
    parents: ["c1", "c3"],
    refs: [{ type: "head", name: "HEAD" }, { type: "branch", name: "main" }],
  },
  {
    id: "c1",
    hash: "8b2e4a1",
    message: "Update dependencies",
    branch: "main",
    parents: ["c2"],
  },
  {
    id: "c2",
    hash: "3c9f1b7",
    message: "Merge 'hotfix/login' into main",
    branch: "main",
    parents: ["c5", "c6"],
    refs: [{ type: "tag", name: "v1.2.1" }],
  },
  {
    id: "c3",
    hash: "d4a8c2e",
    message: "Add OAuth2 provider",
    branch: "feature/auth",
    parents: ["c4"],
    refs: [{ type: "branch", name: "feature/auth" }],
  },
  {
    id: "c4",
    hash: "e5b9d3f",
    message: "Implement JWT tokens",
    branch: "feature/auth",
    parents: ["c5"],
  },
  {
    id: "c5",
    hash: "f6c0e4g",
    message: "Refactor user service",
    branch: "main",
    parents: ["c7"],
  },
  {
    id: "c6",
    hash: "17d1f5h",
    message: "Fix login redirect",
    branch: "hotfix/login",
    parents: ["c7"],
    refs: [{ type: "branch", name: "hotfix/login" }],
  },
  {
    id: "c7",
    hash: "28e2g6i",
    message: "Add API endpoints",
    branch: "main",
    parents: ["c8", "c9"],
  },
  {
    id: "c8",
    hash: "39f3h7j",
    message: "Database migrations",
    branch: "main",
    parents: ["c10"],
    refs: [{ type: "tag", name: "v1.2.0" }],
  },
  {
    id: "c9",
    hash: "4ag4i8k",
    message: "REST API client",
    branch: "feature/api",
    parents: ["c10"],
    refs: [{ type: "branch", name: "feature/api" }],
  },
  {
    id: "c10",
    hash: "5bh5j9l",
    message: "Initial project setup",
    branch: "main",
    parents: [],
    refs: [{ type: "tag", name: "v1.0.0" }],
  },
]

// ============================================================================
// CURVE GENERATION (matching gitflowgraph.tsx)
// ============================================================================

function createCurvePath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  startVertical: boolean = true
): string {
  if (fromX === toX) {
    return `M ${fromX} ${fromY} L ${toX} ${toY}`
  }

  const deltaX = Math.abs(toX - fromX)
  const deltaY = Math.abs(toY - fromY)
  const CORNER_RADIUS = Math.min(6, deltaX * 0.5, deltaY * 0.3)

  const goingRight = toX > fromX
  const goingDown = toY > fromY
  const hDir = goingRight ? 1 : -1
  const vDir = goingDown ? 1 : -1
  const r = CORNER_RADIUS

  if (startVertical) {
    const sweepFlag = goingRight === goingDown ? 0 : 1
    return `M ${fromX} ${fromY} L ${fromX} ${toY - vDir * r} A ${r} ${r} 0 0 ${sweepFlag} ${fromX + hDir * r} ${toY} L ${toX} ${toY}`
  } else {
    const sweepFlag = goingRight === goingDown ? 1 : 0
    return `M ${fromX} ${fromY} L ${toX - hDir * r} ${fromY} A ${r} ${r} 0 0 ${sweepFlag} ${toX} ${fromY + vDir * r} L ${toX} ${toY}`
  }
}

// ============================================================================
// LAYOUT COMPUTATION
// ============================================================================

interface PathData {
  d: string
  color: string
  branch: string
}

interface LayoutData {
  layout: Map<string, { x: number; y: number; col: number }>
  paths: PathData[]
  graphWidth: number
  graphHeight: number
}

function computeLayout(commits: Commit[]): LayoutData {
  const layout = new Map<string, { x: number; y: number; col: number }>()
  const commitMap = new Map(commits.map((c) => [c.id, c]))

  // Assign branch lanes
  const branchLanes: Record<string, number> = { main: 0 }
  let nextLane = 1

  const branchOrder: string[] = []
  for (let i = commits.length - 1; i >= 0; i--) {
    const commit = commits[i]
    if (!branchOrder.includes(commit.branch) && commit.branch !== "main") {
      branchOrder.push(commit.branch)
    }
  }

  branchOrder.forEach((branch) => {
    if (!(branch in branchLanes)) {
      branchLanes[branch] = nextLane++
    }
  })

  // Position commits
  commits.forEach((commit, index) => {
    const col = branchLanes[commit.branch] ?? 0
    const x = GRAPH_PADDING + col * COLUMN_WIDTH
    const y = GRAPH_PADDING + index * ROW_HEIGHT
    layout.set(commit.id, { x, y, col })
  })

  // Generate paths
  const paths: PathData[] = []

  commits.forEach((commit) => {
    const currentPos = layout.get(commit.id)
    if (!currentPos) return

    commit.parents.forEach((parentId) => {
      const parent = commitMap.get(parentId)
      if (!parent) return

      const parentPos = layout.get(parentId)
      if (!parentPos) return

      let lineColor: string
      let lineBranch: string

      if (currentPos.col === parentPos.col) {
        lineColor = BRANCH_COLORS[commit.branch] || "#6b7280"
        lineBranch = commit.branch
        paths.push({
          d: `M ${currentPos.x} ${currentPos.y} L ${parentPos.x} ${parentPos.y}`,
          color: lineColor,
          branch: lineBranch,
        })
      } else {
        const currentIsOuter = currentPos.col > parentPos.col

        if (currentIsOuter) {
          lineColor = BRANCH_COLORS[commit.branch] || "#6b7280"
          lineBranch = commit.branch
        } else {
          lineColor = BRANCH_COLORS[parent.branch] || "#6b7280"
          lineBranch = parent.branch
        }

        paths.push({
          d: createCurvePath(
            currentPos.x,
            currentPos.y,
            parentPos.x,
            parentPos.y,
            currentIsOuter
          ),
          color: lineColor,
          branch: lineBranch,
        })
      }
    })
  })

  const maxCol = Math.max(...Object.values(branchLanes), 0)
  const graphWidth = GRAPH_PADDING * 2 + (maxCol + 1) * COLUMN_WIDTH
  const graphHeight = commits.length * ROW_HEIGHT + GRAPH_PADDING

  return { layout, paths, graphWidth, graphHeight }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GitflowDemo() {
  const [isHovered, setIsHovered] = useState(false)
  const [visibleCount, setVisibleCount] = useState(4)
  const [highlightedBranch, setHighlightedBranch] = useState<string | null>(null)
  const [animationPhase, setAnimationPhase] = useState<"idle" | "building" | "highlighting">("idle")

  // Visible commits based on animation state
  const visibleCommits = useMemo(() => {
    return ALL_COMMITS.slice(0, visibleCount)
  }, [visibleCount])

  // Compute layout
  const { layout, paths, graphWidth, graphHeight } = useMemo(() => {
    return computeLayout(visibleCommits)
  }, [visibleCommits])

  // Animation sequence
  useEffect(() => {
    if (!isHovered) {
      setAnimationPhase("idle")
      setVisibleCount(4)
      setHighlightedBranch(null)
      return
    }

    // Start building phase
    setAnimationPhase("building")
    let currentCount = 4

    // Gradually reveal commits
    const buildInterval = setInterval(() => {
      if (currentCount < ALL_COMMITS.length) {
        currentCount++
        setVisibleCount(currentCount)
      } else {
        clearInterval(buildInterval)
        // Move to highlighting phase
        setAnimationPhase("highlighting")
      }
    }, 280)

    return () => clearInterval(buildInterval)
  }, [isHovered])

  // Branch highlighting cycle
  useEffect(() => {
    if (animationPhase !== "highlighting") {
      setHighlightedBranch(null)
      return
    }

    const branches = Object.keys(BRANCH_COLORS)
    let index = 0

    const highlightInterval = setInterval(() => {
      setHighlightedBranch(branches[index])
      index = (index + 1) % branches.length

      // After cycling through all branches twice, reset
      if (index === 0) {
        setTimeout(() => {
          setHighlightedBranch(null)
          // Reset animation
          setVisibleCount(4)
          setAnimationPhase("building")
        }, 1500)
      }
    }, 1200)

    return () => clearInterval(highlightInterval)
  }, [animationPhase])

  // Branch stats for legend
  const branchStats = useMemo(() => {
    const stats: Array<{ name: string; color: string; count: number }> = []
    const countMap = new Map<string, number>()

    visibleCommits.forEach((c) => {
      countMap.set(c.branch, (countMap.get(c.branch) || 0) + 1)
    })

    Object.entries(BRANCH_COLORS).forEach(([name, color]) => {
      stats.push({ name, color, count: countMap.get(name) || 0 })
    })

    return stats.filter((s) => s.count > 0 || s.name === "main")
  }, [visibleCommits])

  return (
    <div
      className="relative w-full h-full min-h-[280px] select-none cursor-pointer overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0a0a0a 0%, #111118 50%, #0d1117 100%)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SVG Git Graph */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width={graphWidth + 120}
          height={graphHeight + 20}
          className="overflow-visible"
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        >
          <g transform={`translate(${60 - graphWidth / 2 + 40}, 10)`}>
            {/* Paths with animation */}
            {paths.map((path, i) => {
              const isDimmed = highlightedBranch && highlightedBranch !== path.branch
              return (
                <motion.path
                  key={`path-${i}`}
                  d={path.d}
                  stroke={path.color}
                  strokeWidth={LINE_WIDTH}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: isDimmed ? 0.15 : isHovered ? 1 : 0.6,
                  }}
                  transition={{
                    pathLength: { duration: 0.5, delay: i * 0.03, ease: "easeOut" },
                    opacity: { duration: 0.3 },
                  }}
                />
              )
            })}

            {/* Commit nodes */}
            {visibleCommits.map((commit, index) => {
              const pos = layout.get(commit.id)
              if (!pos) return null

              const color = BRANCH_COLORS[commit.branch] || "#6b7280"
              const isHead = commit.refs?.some((r) => r.type === "head")
              const isMerge = commit.parents.length > 1
              const isDimmed = highlightedBranch && highlightedBranch !== commit.branch
              const isHighlighted = highlightedBranch === commit.branch

              return (
                <g key={commit.id}>
                  {/* Glow effect for highlighted nodes */}
                  {isHighlighted && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={NODE_RADIUS + 8}
                      fill={color}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* HEAD pulse ring */}
                  {isHead && isHovered && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={NODE_RADIUS + 4}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  {/* Merge commit outer ring */}
                  {isMerge && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={NODE_RADIUS + 2}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: isDimmed ? 0.1 : 0.6, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                    />
                  )}

                  {/* Main node */}
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_RADIUS}
                    fill={color}
                    stroke="#0d0d0d"
                    strokeWidth={2}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: isHovered ? 1 : 0.85,
                      opacity: isDimmed ? 0.2 : 1,
                    }}
                    transition={{
                      scale: { duration: 0.3, delay: index * 0.04, type: "spring", stiffness: 300 },
                      opacity: { duration: 0.2 },
                    }}
                  />

                  {/* Inner dot for special commits */}
                  {(isMerge || isHead) && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={1.5}
                      fill={isHead ? "#ffffff" : "#0d0d0d"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isDimmed ? 0.2 : 1 }}
                      transition={{ duration: 0.2, delay: index * 0.04 + 0.1 }}
                    />
                  )}

                  {/* Commit hash label */}
                  <motion.text
                    x={pos.x + NODE_RADIUS + 8}
                    y={pos.y + 3}
                    fontSize={8}
                    fontFamily="monospace"
                    fill="#6b7280"
                    initial={{ opacity: 0, x: pos.x + NODE_RADIUS }}
                    animate={{ opacity: isDimmed ? 0.1 : isHovered ? 0.8 : 0.4, x: pos.x + NODE_RADIUS + 8 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    {commit.hash}
                  </motion.text>

                  {/* Ref badges */}
                  {commit.refs?.slice(0, 2).map((ref, refIndex) => (
                    <motion.g
                      key={`${commit.id}-ref-${refIndex}`}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: isDimmed ? 0.1 : isHovered ? 1 : 0, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 + 0.1 }}
                    >
                      <rect
                        x={pos.x + 58 + refIndex * 42}
                        y={pos.y - 6}
                        width={38}
                        height={12}
                        rx={2}
                        fill={
                          ref.type === "head"
                            ? "rgba(16, 185, 129, 0.15)"
                            : ref.type === "tag"
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(139, 92, 246, 0.15)"
                        }
                        stroke={
                          ref.type === "head"
                            ? "rgba(16, 185, 129, 0.3)"
                            : ref.type === "tag"
                            ? "rgba(245, 158, 11, 0.3)"
                            : "rgba(139, 92, 246, 0.3)"
                        }
                        strokeWidth={0.5}
                      />
                      <text
                        x={pos.x + 77 + refIndex * 42}
                        y={pos.y + 2}
                        fontSize={6}
                        fontFamily="system-ui"
                        textAnchor="middle"
                        fill={
                          ref.type === "head"
                            ? "#10b981"
                            : ref.type === "tag"
                            ? "#f59e0b"
                            : "#8b5cf6"
                        }
                      >
                        {ref.name.length > 6 ? ref.name.slice(0, 6) + "…" : ref.name}
                      </text>
                    </motion.g>
                  ))}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Header badge */}
      <motion.div
        className="absolute top-3 left-3 z-10"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: isHovered ? 1 : 0.6 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md border border-white/10">
          <svg
            className="w-3.5 h-3.5 text-emerald-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="6" cy="6" r="2" />
            <circle cx="18" cy="18" r="2" />
            <path d="M6 8v5a5 5 0 0 0 5 5h7" />
          </svg>
          <span className="text-[10px] text-neutral-300 font-medium tracking-wide">
            gitflow
          </span>
        </div>
      </motion.div>

      {/* Status indicator */}
      <AnimatePresence>
        {isHovered && animationPhase !== "idle" && (
          <motion.div
            className="absolute top-3 right-3 z-10"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 backdrop-blur-sm rounded-md border border-emerald-500/20">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-[10px] text-emerald-400 font-medium">
                {animationPhase === "building" ? "Building..." : "Analyzing"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Branch legend */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            {branchStats.map((branch) => (
              <motion.div
                key={branch.name}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded border"
                animate={{
                  borderColor: highlightedBranch === branch.name ? branch.color + "60" : "rgba(255,255,255,0.1)",
                  backgroundColor: highlightedBranch === branch.name ? branch.color + "15" : "rgba(0,0,0,0.6)",
                }}
                transition={{ duration: 0.2 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: branch.color }}
                />
                <span className="text-[8px] text-neutral-400 font-medium">
                  {branch.name.replace("feature/", "").replace("hotfix/", "")}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none z-[5]" />
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-[5]" />

      {/* Hover hint */}
      <motion.div
        className="absolute bottom-2.5 right-3 z-10"
        animate={{ opacity: isHovered ? 0 : 0.5 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-[9px] text-neutral-600">Hover to explore</span>
      </motion.div>
    </div>
  )
}
