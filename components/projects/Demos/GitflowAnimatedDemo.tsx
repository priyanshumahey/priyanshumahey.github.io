"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"

/**
 * GitflowAnimatedDemo - An auto-playing animated demo that shows git operations
 * with a terminal displaying commands and a live-updating git graph.
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

interface GitAction {
  command: string
  description: string
  resultCommits: Commit[]
  highlightBranch?: string
  duration?: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ROW_HEIGHT = 28
const COLUMN_WIDTH = 18
const NODE_RADIUS = 4
const LINE_WIDTH = 2
const GRAPH_PADDING = 12

const BRANCH_COLORS: Record<string, string> = {
  main: "#10b981",
  "feature/auth": "#8b5cf6",
  "feature/api": "#3b82f6",
  "hotfix/bug": "#ef4444",
}

// ============================================================================
// GIT OPERATION SEQUENCE
// ============================================================================

const GIT_SEQUENCE: GitAction[] = [
  {
    command: "git init",
    description: "Initialize repository",
    resultCommits: [],
    duration: 1200,
  },
  {
    command: "git commit -m 'Initial commit'",
    description: "First commit on main",
    resultCommits: [
      {
        id: "c1",
        hash: "a1b2c3d",
        message: "Initial commit",
        branch: "main",
        parents: [],
        refs: [{ type: "head", name: "HEAD" }, { type: "branch", name: "main" }],
      },
    ],
    highlightBranch: "main",
    duration: 1400,
  },
  {
    command: "git commit -m 'Add README'",
    description: "Second commit",
    resultCommits: [
      {
        id: "c1",
        hash: "a1b2c3d",
        message: "Initial commit",
        branch: "main",
        parents: [],
      },
      {
        id: "c2",
        hash: "e4f5g6h",
        message: "Add README",
        branch: "main",
        parents: ["c1"],
        refs: [{ type: "head", name: "HEAD" }, { type: "branch", name: "main" }],
      },
    ],
    highlightBranch: "main",
    duration: 1400,
  },
  {
    command: "git checkout -b feature/auth",
    description: "Create feature branch",
    resultCommits: [
      {
        id: "c1",
        hash: "a1b2c3d",
        message: "Initial commit",
        branch: "main",
        parents: [],
      },
      {
        id: "c2",
        hash: "e4f5g6h",
        message: "Add README",
        branch: "main",
        parents: ["c1"],
        refs: [{ type: "branch", name: "main" }, { type: "head", name: "HEAD" }, { type: "branch", name: "feature/auth" }],
      },
    ],
    highlightBranch: "feature/auth",
    duration: 1600,
  },
  {
    command: "git commit -m 'Add login form'",
    description: "Work on feature",
    resultCommits: [
      {
        id: "c1",
        hash: "a1b2c3d",
        message: "Initial commit",
        branch: "main",
        parents: [],
      },
      {
        id: "c2",
        hash: "e4f5g6h",
        message: "Add README",
        branch: "main",
        parents: ["c1"],
        refs: [{ type: "branch", name: "main" }],
      },
      {
        id: "c3",
        hash: "i7j8k9l",
        message: "Add login form",
        branch: "feature/auth",
        parents: ["c2"],
        refs: [{ type: "head", name: "HEAD" }, { type: "branch", name: "feature/auth" }],
      },
    ],
    highlightBranch: "feature/auth",
    duration: 1400,
  },
  {
    command: "git commit -m 'Add validation'",
    description: "Continue feature work",
    resultCommits: [
      {
        id: "c1",
        hash: "a1b2c3d",
        message: "Initial commit",
        branch: "main",
        parents: [],
      },
      {
        id: "c2",
        hash: "e4f5g6h",
        message: "Add README",
        branch: "main",
        parents: ["c1"],
        refs: [{ type: "branch", name: "main" }],
      },
      {
        id: "c3",
        hash: "i7j8k9l",
        message: "Add login form",
        branch: "feature/auth",
        parents: ["c2"],
      },
      {
        id: "c4",
        hash: "m0n1o2p",
        message: "Add validation",
        branch: "feature/auth",
        parents: ["c3"],
        refs: [{ type: "head", name: "HEAD" }, { type: "branch", name: "feature/auth" }],
      },
    ],
    highlightBranch: "feature/auth",
    duration: 1400,
  },
  {
    command: "git checkout main",
    description: "Switch to main",
    resultCommits: [
      {
        id: "c1",
        hash: "a1b2c3d",
        message: "Initial commit",
        branch: "main",
        parents: [],
      },
      {
        id: "c2",
        hash: "e4f5g6h",
        message: "Add README",
        branch: "main",
        parents: ["c1"],
        refs: [{ type: "head", name: "HEAD" }, { type: "branch", name: "main" }],
      },
      {
        id: "c3",
        hash: "i7j8k9l",
        message: "Add login form",
        branch: "feature/auth",
        parents: ["c2"],
      },
      {
        id: "c4",
        hash: "m0n1o2p",
        message: "Add validation",
        branch: "feature/auth",
        parents: ["c3"],
        refs: [{ type: "branch", name: "feature/auth" }],
      },
    ],
    highlightBranch: "main",
    duration: 1200,
  },
  {
    command: "git merge feature/auth",
    description: "Merge feature into main",
    resultCommits: [
      {
        id: "c1",
        hash: "a1b2c3d",
        message: "Initial commit",
        branch: "main",
        parents: [],
      },
      {
        id: "c2",
        hash: "e4f5g6h",
        message: "Add README",
        branch: "main",
        parents: ["c1"],
      },
      {
        id: "c3",
        hash: "i7j8k9l",
        message: "Add login form",
        branch: "feature/auth",
        parents: ["c2"],
      },
      {
        id: "c4",
        hash: "m0n1o2p",
        message: "Add validation",
        branch: "feature/auth",
        parents: ["c3"],
        refs: [{ type: "branch", name: "feature/auth" }],
      },
      {
        id: "c5",
        hash: "q3r4s5t",
        message: "Merge feature/auth",
        branch: "main",
        parents: ["c2", "c4"],
        refs: [{ type: "head", name: "HEAD" }, { type: "branch", name: "main" }],
      },
    ],
    highlightBranch: "main",
    duration: 2000,
  },
]

// ============================================================================
// CURVE GENERATION
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
  const CORNER_RADIUS = Math.min(5, deltaX * 0.5, deltaY * 0.3)

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
  key: string
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

  // Assign branch lanes - reverse order so main is on left
  const branchLanes: Record<string, number> = { main: 0 }
  let nextLane = 1

  const branchOrder: string[] = []
  commits.forEach((commit) => {
    if (!branchOrder.includes(commit.branch) && commit.branch !== "main") {
      branchOrder.push(commit.branch)
    }
  })

  branchOrder.forEach((branch) => {
    if (!(branch in branchLanes)) {
      branchLanes[branch] = nextLane++
    }
  })

  // Position commits - newest at top
  const reversedCommits = [...commits].reverse()
  reversedCommits.forEach((commit, index) => {
    const col = branchLanes[commit.branch] ?? 0
    const x = GRAPH_PADDING + col * COLUMN_WIDTH
    const y = GRAPH_PADDING + index * ROW_HEIGHT
    layout.set(commit.id, { x, y, col })
  })

  // Generate paths
  const paths: PathData[] = []

  reversedCommits.forEach((commit) => {
    const currentPos = layout.get(commit.id)
    if (!currentPos) return

    commit.parents.forEach((parentId, pIndex) => {
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
          key: `${commit.id}-${parentId}`,
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
          key: `${commit.id}-${parentId}`,
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
// TERMINAL TYPEWRITER
// ============================================================================

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    setDisplayedText("")
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setShowCursor(false)
          onComplete?.()
        }, 200)
      }
    }, 35)

    return () => clearInterval(interval)
  }, [text, onComplete])

  return (
    <span className="font-mono">
      <span className="text-emerald-400">$</span>{" "}
      <span className="text-zinc-200">{displayedText}</span>
      {showCursor && (
        <motion.span
          className="inline-block w-[2px] h-[14px] bg-zinc-400 ml-0.5 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
      )}
    </span>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GitflowAnimatedDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [commits, setCommits] = useState<Commit[]>([])
  const [highlightBranch, setHighlightBranch] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(true)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentAction = GIT_SEQUENCE[currentStep]

  // Compute layout
  const { layout, paths, graphWidth, graphHeight } = useMemo(() => {
    return computeLayout(commits)
  }, [commits])

  // Reversed commits for display (newest first)
  const displayCommits = useMemo(() => [...commits].reverse(), [commits])

  // Animation loop
  useEffect(() => {
    const runStep = () => {
      const action = GIT_SEQUENCE[currentStep]
      
      // Start typing
      setIsTyping(true)
    }

    runStep()
  }, [currentStep])

  const handleTypingComplete = () => {
    setIsTyping(false)
    const action = GIT_SEQUENCE[currentStep]
    
    // Add to history
    setCommandHistory(prev => [...prev.slice(-4), action.command])
    
    // Update state after typing
    setTimeout(() => {
      setCommits(action.resultCommits)
      setHighlightBranch(action.highlightBranch || null)
      
      // Move to next step
      timeoutRef.current = setTimeout(() => {
        const nextStep = (currentStep + 1) % GIT_SEQUENCE.length
        if (nextStep === 0) {
          // Reset for loop
          setCommits([])
          setCommandHistory([])
          setHighlightBranch(null)
        }
        setCurrentStep(nextStep)
        setIsTyping(true)
      }, action.duration || 1500)
    }, 300)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Branch stats for legend
  const branchStats = useMemo(() => {
    const stats: Array<{ name: string; color: string; active: boolean }> = []
    const activeBranches = new Set(commits.map(c => c.branch))
    
    Object.entries(BRANCH_COLORS).forEach(([name, color]) => {
      if (activeBranches.has(name) || name === "main") {
        stats.push({ name, color, active: activeBranches.has(name) })
      }
    })
    
    return stats
  }, [commits])

  return (
    <div
      className="relative w-full h-full min-h-[320px] select-none overflow-hidden flex flex-col md:flex-row"
      style={{
        background: "linear-gradient(145deg, #0a0a0a 0%, #111118 50%, #0d1117 100%)",
      }}
    >
      {/* Git Graph - First on mobile (top), Second on desktop (right) */}
      <div className="flex-1 flex flex-col p-4 min-h-[280px] order-1 md:order-2 overflow-hidden">
        {/* Graph header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
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
              git graph
            </span>
          </div>

          {/* Branch legend */}
          <div className="flex gap-1.5 flex-wrap justify-end">
            <AnimatePresence>
              {branchStats.map((branch) => (
                <motion.div
                  key={branch.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: branch.active ? 1 : 0.3, 
                    scale: 1,
                    borderColor: highlightBranch === branch.name ? branch.color : "rgba(255,255,255,0.1)",
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-black/40 rounded border border-white/10"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: branch.color }}
                  />
                  <span className="text-[8px] text-zinc-400">
                    {branch.name.replace("feature/", "").replace("hotfix/", "")}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* SVG Graph */}
        <div className="flex-1 flex items-start justify-start overflow-hidden pl-2">
          {commits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full w-full text-zinc-600 text-xs"
            >
              <span className="flex items-center gap-2">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Initializing...
              </span>
            </motion.div>
          ) : (
            <svg
              width="100%"
              height={Math.max(graphHeight + 30, 180)}
              viewBox={`0 0 ${Math.max(graphWidth + 340, 400)} ${Math.max(graphHeight + 30, 180)}`}
              preserveAspectRatio="xMinYMin meet"
              className="max-w-full"
              style={{ overflow: 'visible' }}
            >
              <g transform={`translate(${15}, 15)`}>
                {/* Paths */}
                <AnimatePresence>
                  {paths.map((path) => {
                    const isDimmed = highlightBranch && highlightBranch !== path.branch
                    return (
                      <motion.path
                        key={path.key}
                        d={path.d}
                        stroke={path.color}
                        strokeWidth={LINE_WIDTH}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                          pathLength: 1,
                          opacity: isDimmed ? 0.2 : 0.8,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          pathLength: { duration: 0.4, ease: "easeOut" },
                          opacity: { duration: 0.3 },
                        }}
                      />
                    )
                  })}
                </AnimatePresence>

                {/* Commit nodes */}
                <AnimatePresence>
                  {displayCommits.map((commit, index) => {
                    const pos = layout.get(commit.id)
                    if (!pos) return null

                    const color = BRANCH_COLORS[commit.branch] || "#6b7280"
                    const isHead = commit.refs?.some((r) => r.type === "head")
                    const isMerge = commit.parents.length > 1
                    const isDimmed = highlightBranch && highlightBranch !== commit.branch
                    const isNew = index === 0

                    return (
                      <motion.g
                        key={commit.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {/* New commit pulse */}
                        {isNew && (
                          <motion.circle
                            cx={pos.x}
                            cy={pos.y}
                            r={NODE_RADIUS + 6}
                            fill={color}
                            initial={{ opacity: 0.6, scale: 1 }}
                            animate={{ opacity: 0, scale: 2 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        )}

                        {/* HEAD indicator */}
                        {isHead && (
                          <motion.circle
                            cx={pos.x}
                            cy={pos.y}
                            r={NODE_RADIUS + 4}
                            fill="none"
                            stroke={color}
                            strokeWidth={1.5}
                            animate={{ 
                              scale: [1, 1.3, 1], 
                              opacity: [0.6, 0.3, 0.6] 
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}

                        {/* Merge outer ring */}
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
                            transition={{ duration: 0.3 }}
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
                          initial={{ scale: 0 }}
                          animate={{
                            scale: 1,
                            opacity: isDimmed ? 0.3 : 1,
                          }}
                          transition={{
                            scale: { type: "spring", stiffness: 400, damping: 20 },
                          }}
                        />

                        {/* Inner dot */}
                        {(isMerge || isHead) && (
                          <motion.circle
                            cx={pos.x}
                            cy={pos.y}
                            r={1.5}
                            fill={isHead ? "#ffffff" : "#0d0d0d"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isDimmed ? 0.2 : 1 }}
                          />
                        )}

                        {/* Hash label */}
                        <motion.text
                          x={pos.x + NODE_RADIUS + 8}
                          y={pos.y + 3}
                          fontSize={8}
                          fontFamily="monospace"
                          fill="#6b7280"
                          initial={{ opacity: 0, x: pos.x }}
                          animate={{ opacity: isDimmed ? 0.15 : 0.6, x: pos.x + NODE_RADIUS + 8 }}
                          transition={{ duration: 0.3 }}
                        >
                          {commit.hash}
                        </motion.text>

                        {/* Message */}
                        <motion.text
                          x={pos.x + NODE_RADIUS + 90}
                          y={pos.y + 3}
                          fontSize={9}
                          fontFamily="system-ui"
                          fill="#9ca3af"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isDimmed ? 0.15 : 0.8 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          {commit.message.length > 25 
                            ? commit.message.slice(0, 25) + "…" 
                            : commit.message}
                        </motion.text>

                        {/* Ref badges */}
                        {commit.refs?.filter(r => r.type !== "head").slice(0, 1).map((ref, refIndex) => (
                          <motion.g
                            key={`${commit.id}-ref-${refIndex}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: isDimmed ? 0.15 : 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: 0.15 }}
                          >
                            <rect
                              x={pos.x + 280}
                              y={pos.y - 6}
                              width={60}
                              height={12}
                              rx={2}
                              fill={
                                ref.type === "tag"
                                  ? "rgba(245, 158, 11, 0.15)"
                                  : "rgba(139, 92, 246, 0.15)"
                              }
                              stroke={
                                ref.type === "tag"
                                  ? "rgba(245, 158, 11, 0.3)"
                                  : "rgba(139, 92, 246, 0.3)"
                              }
                              strokeWidth={0.5}
                            />
                            <text
                              x={pos.x + 310}
                              y={pos.y + 2}
                              fontSize={7}
                              fontFamily="system-ui"
                              textAnchor="middle"
                              fill={
                                ref.type === "tag"
                                  ? "#f59e0b"
                                  : "#8b5cf6"
                              }
                            >
                              {ref.name.length > 12 ? ref.name.slice(0, 12) + "…" : ref.name}
                            </text>
                          </motion.g>
                        ))}
                      </motion.g>
                    )
                  })}
                </AnimatePresence>
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* Terminal - Second on mobile (bottom), First on desktop (left) */}
      <div className="flex-1 flex flex-col p-4 border-t md:border-t-0 md:border-r border-white/5 min-h-[200px] order-2 md:order-1">
        {/* Terminal header */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 text-[10px] text-zinc-500 font-medium">terminal</span>
        </div>

        {/* Terminal content */}
        <div className="flex-1 flex flex-col justify-end space-y-1.5 font-mono text-xs">
          {/* Command history */}
          <AnimatePresence mode="popLayout">
            {commandHistory.map((cmd, i) => (
              <motion.div
                key={`history-${i}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.5, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-zinc-500 min-h-[20px]"
              >
                <span className="text-emerald-400/50">$</span> {cmd}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Current command */}
          <div className="min-h-[20px]">
            {isTyping && currentAction && (
              <TypewriterText
                key={currentStep}
                text={currentAction.command}
                onComplete={handleTypingComplete}
              />
            )}
          </div>

          {/* Description */}
          <AnimatePresence mode="wait">
            {!isTyping && currentAction && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-zinc-500 mt-1"
              >
                → {currentAction.description}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-1 mt-4">
          {GIT_SEQUENCE.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 flex-1 rounded-full"
              animate={{
                backgroundColor: i === currentStep ? "#10b981" : i < currentStep ? "#10b98140" : "#1f1f2e",
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Gradient overlays */}
      <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none z-[5]" />
      <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-[5]" />
    </div>
  )
}
