"use client"

import { AnimatePresence, motion } from "framer-motion"
import { RotateCcw } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

interface Step {
  id: number
  label: string
  description: string
  edges: string[] // which edges to highlight
}

const HIT_STEPS: Step[] = [
  { id: 0, label: "Request", description: "Client sends a request to the application server.", edges: ["client-app"] },
  { id: 1, label: "Check cache", description: "The app checks Redis first — is this data already cached?", edges: ["app-redis"] },
  { id: 2, label: "Cache hit", description: "Cache hit! Redis returns the data directly — fast, from memory.", edges: ["redis-app"] },
]

const MISS_STEPS: Step[] = [
  { id: 0, label: "Request", description: "Client sends a request to the application server.", edges: ["client-app"] },
  { id: 1, label: "Check cache", description: "The app checks Redis first — is this data already cached?", edges: ["app-redis"] },
  { id: 2, label: "Cache miss", description: "Cache miss — the key doesn't exist in Redis. The app falls back to the database.", edges: ["app-mysql"] },
  { id: 3, label: "DB returns data", description: "MySQL returns the requested data to the application.", edges: ["mysql-app"] },
  { id: 4, label: "Prime cache", description: "The app writes the data into Redis so the next request is a cache hit.", edges: ["app-redis"] },
  { id: 5, label: "Respond", description: "The app returns the data to the client.", edges: ["app-client"] },
]

type Scenario = "hit" | "miss"

// ─── SVG layout constants ───────────────────────────────────────────
// Laid out in a single row: Client — App — Redis — MySQL
const W = 540
const H = 80
const NODE_W = 72
const NODE_H = 44
const NODE_RX = 8

// X centers for each node (evenly spaced)
const CX = { client: 40, app: 190, redis: 340, mysql: 490 }
const CY = H / 2

// Edge endpoints (connect to box edges, not centers)
const EDGES: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
  "client-app": { x1: CX.client + NODE_W / 2, y1: CY, x2: CX.app - NODE_W / 2, y2: CY },
  "app-client": { x1: CX.app - NODE_W / 2, y1: CY, x2: CX.client + NODE_W / 2, y2: CY },
  "app-redis":  { x1: CX.app + NODE_W / 2, y1: CY, x2: CX.redis - NODE_W / 2, y2: CY },
  "redis-app":  { x1: CX.redis - NODE_W / 2, y1: CY, x2: CX.app + NODE_W / 2, y2: CY },
  "app-mysql":  { x1: CX.app + NODE_W / 2, y1: CY, x2: CX.mysql - NODE_W / 2, y2: CY },
  "mysql-app":  { x1: CX.mysql - NODE_W / 2, y1: CY, x2: CX.app + NODE_W / 2, y2: CY },
}

const EDGE_COLORS: Record<string, { dark: string; light: string }> = {
  "client-app": { dark: "#60a5fa", light: "#3b82f6" },
  "app-client": { dark: "#60a5fa", light: "#3b82f6" },
  "app-redis":  { dark: "#f87171", light: "#ef4444" },
  "redis-app":  { dark: "#4ade80", light: "#16a34a" },
  "app-mysql":  { dark: "#22d3ee", light: "#0891b2" },
  "mysql-app":  { dark: "#22d3ee", light: "#0891b2" },
}

// For app→mysql / mysql→app, curve the line below the boxes to avoid overlapping redis
const CURVED_EDGES = new Set(["app-mysql", "mysql-app"])

export function RedisCacheDemo() {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  const [scenario, setScenario] = useState<Scenario>("hit")
  const [stepIndex, setStepIndex] = useState(0)

  const steps = scenario === "hit" ? HIT_STEPS : MISS_STEPS
  const currentStep = steps[stepIndex]
  const isLast = stepIndex === steps.length - 1

  const reset = () => setStepIndex(0)
  const next = () => { if (!isLast) setStepIndex(stepIndex + 1) }
  const switchScenario = (s: Scenario) => { setScenario(s); setStepIndex(0) }

  const activeEdges = new Set(currentStep.edges)
  const activeNodes = new Set<string>()
  for (const e of currentStep.edges) {
    const [a, b] = e.split("-")
    activeNodes.add(a)
    activeNodes.add(b)
  }

  const dimStroke = dark ? "#3f3f46" : "#d4d4d8"
  const dimFill = dark ? "#18181b" : "#fafafa"
  const dimText = dark ? "#71717a" : "#a1a1aa"

  const nodeColors: Record<string, { stroke: string; fill: string; text: string }> = {
    client: { stroke: dark ? "#fbbf24" : "#f59e0b", fill: dark ? "rgba(120,80,0,0.2)" : "#fffbeb", text: dark ? "#fcd34d" : "#92400e" },
    app:    { stroke: dark ? "#60a5fa" : "#3b82f6", fill: dark ? "rgba(30,64,175,0.15)" : "#eff6ff", text: dark ? "#93c5fd" : "#1e40af" },
    redis:  { stroke: dark ? "#f87171" : "#ef4444", fill: dark ? "rgba(153,27,27,0.15)" : "#fef2f2", text: dark ? "#fca5a5" : "#991b1b" },
    mysql:  { stroke: dark ? "#22d3ee" : "#0891b2", fill: dark ? "rgba(8,145,178,0.12)" : "#ecfeff", text: dark ? "#67e8f9" : "#155e75" },
  }

  const nodeLabel: Record<string, string> = { client: "Client", app: "App", redis: "Redis", mysql: "MySQL" }

  return (
    <div className="rounded-xl border border-current/5 bg-muted/20 p-4 sm:p-6 space-y-4">
      {/* Scenario tabs */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <button
          onClick={() => switchScenario("hit")}
          className={`rounded-md px-3 py-1.5 transition-colors ${scenario === "hit" ? (dark ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-800") : (dark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500")}`}
        >
          Cache Hit
        </button>
        <button
          onClick={() => switchScenario("miss")}
          className={`rounded-md px-3 py-1.5 transition-colors ${scenario === "miss" ? (dark ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-800") : (dark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500")}`}
        >
          Cache Miss
        </button>
      </div>

      {/* SVG Diagram */}
      <svg viewBox={`0 0 ${W} ${H + 40}`} className="w-full max-w-[540px] mx-auto" style={{ height: "auto" }}>
        {/* Edges */}
        {Object.entries(EDGES).map(([key, { x1, y1, x2, y2 }]) => {
          const active = activeEdges.has(key)
          const colors = EDGE_COLORS[key]
          const stroke = active ? (dark ? colors.dark : colors.light) : dimStroke
          const opacity = active ? 1 : 0.4
          const curved = CURVED_EDGES.has(key)

          if (curved) {
            // Draw a curved path below the nodes
            const midX = (x1 + x2) / 2
            const bulge = H + 12
            const d = `M ${x1} ${y1} Q ${midX} ${bulge} ${x2} ${y2}`
            return (
              <g key={key}>
                <path
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={active ? 2 : 1.5}
                  opacity={opacity}
                  strokeDasharray={active ? "none" : "4 3"}
                />
                {active && <ArrowHead x={x2} y={y2} fromX={midX} fromY={bulge} color={stroke} />}
              </g>
            )
          }

          return (
            <g key={key}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={stroke}
                strokeWidth={active ? 2 : 1.5}
                opacity={opacity}
                strokeDasharray={active ? "none" : "4 3"}
              />
              {active && <ArrowHead x={x2} y={y2} fromX={x1} fromY={y1} color={stroke} />}
            </g>
          )
        })}

        {/* Nodes */}
        {(["client", "app", "redis", "mysql"] as const).map((key) => {
          const cx = CX[key]
          const active = activeNodes.has(key)
          const c = nodeColors[key]
          return (
            <g key={key}>
              <rect
                x={cx - NODE_W / 2} y={CY - NODE_H / 2}
                width={NODE_W} height={NODE_H}
                rx={NODE_RX}
                fill={active ? c.fill : dimFill}
                stroke={active ? c.stroke : dimStroke}
                strokeWidth={active ? 2 : 1.5}
                style={{ transition: "all 0.3s" }}
              />
              <text
                x={cx} y={CY + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={600}
                fill={active ? c.text : dimText}
                style={{ transition: "fill 0.3s" }}
              >
                {nodeLabel[key]}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Step description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${scenario}-${stepIndex}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-semibold mb-1">
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${dark ? "bg-zinc-700 text-zinc-300" : "bg-zinc-200 text-zinc-600"}`}>
              {stepIndex + 1}
            </span>
            {currentStep.label}
          </div>
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={reset}
          className={`rounded-md p-1.5 text-xs transition-colors ${dark ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={next}
          disabled={isLast}
          className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${isLast ? "opacity-40 cursor-not-allowed" : ""} ${dark ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-600" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"}`}
        >
          Next →
        </button>
        <div className="flex items-center gap-1 ml-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === stepIndex ? (dark ? "bg-zinc-300" : "bg-zinc-600") : (dark ? "bg-zinc-700" : "bg-zinc-300")}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ArrowHead({ x, y, fromX, fromY, color }: { x: number; y: number; fromX: number; fromY: number; color: string }) {
  const dx = x - fromX
  const dy = y - fromY
  const len = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / len
  const uy = dy / len
  // perpendicular
  const px = -uy
  const py = ux
  const size = 5
  const tip = { x, y }
  const left = { x: x - ux * size + px * size * 0.5, y: y - uy * size + py * size * 0.5 }
  const right = { x: x - ux * size - px * size * 0.5, y: y - uy * size - py * size * 0.5 }
  return <polygon points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`} fill={color} />
}
