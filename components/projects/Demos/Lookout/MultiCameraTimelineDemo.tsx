"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

// Twelve-hour multi-camera timeline. Each camera is a swimlane, each chunk
// is a tick on the lane. Preset queries light up matching chunks with their
// caption; hovered ticks show the caption inline. Meant as the "operator
// experience" — what does this system actually feel like to use?

type Camera = "cam-lab-1" | "cam-lab-2" | "cam-door" | "cam-hall"

const CAMERAS: { id: Camera; label: string; sub: string; color: string }[] = [
    { id: "cam-door", label: "cam-door", sub: "front porch", color: "#f59e0b" },
    { id: "cam-hall", label: "cam-hall", sub: "main hallway", color: "#ec4899" },
    { id: "cam-lab-1", label: "cam-lab-1", sub: "lab · west", color: "#22c55e" },
    { id: "cam-lab-2", label: "cam-lab-2", sub: "lab · east", color: "#06b6d4" },
]

interface Event {
    id: string
    camera: Camera
    // Time as fractional hour 0..24
    t: number
    caption: string
    // Score for the currently-selected query. -1 = not a match.
    matchIds: string[]
}

// Full 24h but we visualise 06:00–22:00 for density
const HOUR_MIN = 6
const HOUR_MAX = 22

const EVENTS: Omit<Event, "matchIds">[] = [
    // cam-door
    { id: "d1", camera: "cam-door", t: 7.92, caption: "Newspaper delivered, car pulls away" },
    { id: "d2", camera: "cam-door", t: 9.10, caption: "Resident leaves, locks door" },
    { id: "d3", camera: "cam-door", t: 11.35, caption: "Amazon van stops, driver walks up" },
    { id: "d4", camera: "cam-door", t: 14.03, caption: "Courier places a brown box on the porch" },
    { id: "d5", camera: "cam-door", t: 14.05, caption: "Package left on doorstep, van leaves" },
    { id: "d6", camera: "cam-door", t: 16.20, caption: "Neighbour walks dog past driveway" },
    { id: "d7", camera: "cam-door", t: 18.40, caption: "Resident returns with grocery bags" },
    { id: "d8", camera: "cam-door", t: 20.10, caption: "Porch light activates, empty frame" },

    // cam-hall
    { id: "h1", camera: "cam-hall", t: 6.80, caption: "Cleaner vacuums near entry" },
    { id: "h2", camera: "cam-hall", t: 9.12, caption: "Person with red backpack walks past hallway" },
    { id: "h3", camera: "cam-hall", t: 10.25, caption: "Two people cross toward the lab" },
    { id: "h4", camera: "cam-hall", t: 11.78, caption: "Red backpack leaves hallway frame" },
    { id: "h5", camera: "cam-hall", t: 13.00, caption: "Lunch rush, several people cross" },
    { id: "h6", camera: "cam-hall", t: 14.08, caption: "Dog barks toward the front door" },
    { id: "h7", camera: "cam-hall", t: 17.30, caption: "Person carries whiteboard across hallway" },
    { id: "h8", camera: "cam-hall", t: 20.45, caption: "Lights dim on motion-sensor cycle" },

    // cam-lab-1
    { id: "l1", camera: "cam-lab-1", t: 8.15, caption: "First researcher unlocks the lab" },
    { id: "l2", camera: "cam-lab-1", t: 10.40, caption: "Group reviews a whiteboard diagram" },
    { id: "l3", camera: "cam-lab-1", t: 13.25, caption: "Operator calibrates robot arm joints" },
    { id: "l4", camera: "cam-lab-1", t: 15.07, caption: "Two researchers enter the lab, lights on" },
    { id: "l5", camera: "cam-lab-1", t: 15.68, caption: "Badge swipe audible, lab door opens" },
    { id: "l6", camera: "cam-lab-1", t: 16.88, caption: "Researcher exits lab with notebook" },
    { id: "l7", camera: "cam-lab-1", t: 19.20, caption: "Last person out, overhead lights off" },

    // cam-lab-2
    { id: "b1", camera: "cam-lab-2", t: 9.18, caption: "Red backpack set down near whiteboard" },
    { id: "b2", camera: "cam-lab-2", t: 9.30, caption: "Red bag on desk, person seated" },
    { id: "b3", camera: "cam-lab-2", t: 13.33, caption: "Robotic arm picks up a cube from table" },
    { id: "b4", camera: "cam-lab-2", t: 13.35, caption: "Arm retracts, gripper closes" },
    { id: "b5", camera: "cam-lab-2", t: 14.80, caption: "Team gathers around monitor, discussion" },
    { id: "b6", camera: "cam-lab-2", t: 16.05, caption: "Person at workstation adjusts monitor" },
    { id: "b7", camera: "cam-lab-2", t: 18.00, caption: "Remote rebuild starts, fans spin up" },
]

interface Query {
    id: string
    label: string
    prompt: string
    matches: string[]
    answer: string
}

const QUERIES: Query[] = [
    {
        id: "package",
        label: "when did the package arrive?",
        prompt: "when did the package arrive today?",
        matches: ["d3", "d4", "d5", "h6"],
        answer: "Package delivered to the porch at 14:03 (cam-door). The van first pulled up at 11:21, came back at 14:03, and left after the drop.",
    },
    {
        id: "backpack",
        label: "which camera saw the red backpack?",
        prompt: "which camera saw the red backpack, and when?",
        matches: ["h2", "h4", "b1", "b2"],
        answer: "First seen on cam-hall at 09:07 entering the hallway, then on cam-lab-2 at 09:11 and 09:18. Last seen leaving on cam-hall at 11:47.",
    },
    {
        id: "lab",
        label: "who entered the lab 3–5 pm?",
        prompt: "did anyone enter the lab between 15:00 and 17:00?",
        matches: ["l4", "l5", "l6", "b5", "b6"],
        answer: "Two researchers entered at 15:04 (cam-lab-1). Badge swipe at 15:41. cam-lab-2 caught a workstation adjustment at 16:02. One person exited with a notebook at 16:53.",
    },
    {
        id: "robot",
        label: "what happened with the robot arm?",
        prompt: "summarise the robotic arm session around 13:20",
        matches: ["l3", "b3", "b4"],
        answer: "Operator calibrated joints from 13:15 (cam-lab-1). The arm picked up a cube at 13:20 (cam-lab-2) and the gripper closed at 13:21.",
    },
    {
        id: "first",
        label: "who opened the lab first?",
        prompt: "who unlocked the lab first today?",
        matches: ["l1"],
        answer: "First researcher unlocked cam-lab-1 at 08:09.",
    },
]

function fmtTime(t: number): string {
    const h = Math.floor(t)
    const m = Math.round((t - h) * 60)
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

export function MultiCameraTimelineDemo() {
    const [activeQuery, setActiveQuery] = useState<string>("package")
    const [hovered, setHovered] = useState<Event | null>(null)
    const [playhead, setPlayhead] = useState<number | null>(null)

    const query = useMemo(() => QUERIES.find((q) => q.id === activeQuery)!, [activeQuery])
    const events: Event[] = useMemo(
        () => EVENTS.map((e) => ({ ...e, matchIds: query.matches })),
        [query]
    )

    // Auto-play the match "wave" across the day when a query changes
    useEffect(() => {
        setPlayhead(HOUR_MIN)
        const start = performance.now()
        let raf = 0
        const tick = (now: number) => {
            const dt = (now - start) / 1000
            const t = HOUR_MIN + dt * ((HOUR_MAX - HOUR_MIN) / 3.5) // 3.5s sweep
            if (t >= HOUR_MAX) {
                setPlayhead(null)
                return
            }
            setPlayhead(t)
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [activeQuery])

    const W = 720, H = 320
    const LANE_X = 140
    const LANE_W = W - LANE_X - 20
    const LANE_H = 44
    const LANE_Y0 = 68

    const laneY = (i: number) => LANE_Y0 + i * LANE_H
    const timeX = (t: number) => LANE_X + ((t - HOUR_MIN) / (HOUR_MAX - HOUR_MIN)) * LANE_W

    const matchSet = new Set(query.matches)

    return (
        <div className="w-full bg-[#08080c] rounded-2xl border border-[#1a1a24] overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 px-4 pt-4">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 mr-2">Preset queries</span>
                {QUERIES.map((q) => (
                    <button
                        key={q.id}
                        onClick={() => setActiveQuery(q.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeQuery === q.id
                            ? "bg-[#1a1a2e] border-[#444ce7] text-white"
                            : "bg-transparent border-[#1f1f2e] text-zinc-400 hover:text-white hover:border-[#2a2a40]"
                            }`}
                    >
                        {q.label}
                    </button>
                ))}
            </div>

            <div className="p-4">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                    {/* Hour gridlines + labels */}
                    {Array.from({ length: HOUR_MAX - HOUR_MIN + 1 }).map((_, i) => {
                        const h = HOUR_MIN + i
                        const x = timeX(h)
                        const isQuarter = h % 3 === 0
                        return (
                            <g key={h}>
                                <line x1={x} y1={LANE_Y0 - 8} x2={x} y2={LANE_Y0 + CAMERAS.length * LANE_H - 4}
                                    stroke={isQuarter ? "#1a1a2e" : "#11111e"} strokeWidth={1} />
                                {isQuarter && (
                                    <text x={x} y={LANE_Y0 - 14} fill="#3f3f5a" fontSize={9} textAnchor="middle"
                                        fontFamily="monospace">{h.toString().padStart(2, "0")}:00</text>
                                )}
                            </g>
                        )
                    })}

                    {/* Swimlanes */}
                    {CAMERAS.map((cam, i) => (
                        <g key={cam.id}>
                            <rect x={LANE_X} y={laneY(i)} width={LANE_W} height={LANE_H - 8} rx={6}
                                fill="#0a0a14" stroke="#15152a" />
                            <rect x={LANE_X} y={laneY(i)} width={3} height={LANE_H - 8} rx={1.5}
                                fill={cam.color} opacity={0.9} />
                            <text x={LANE_X - 10} y={laneY(i) + 16} fill="#d4d4e0" fontSize={11} fontWeight={600}
                                textAnchor="end" fontFamily="system-ui, sans-serif">{cam.label}</text>
                            <text x={LANE_X - 10} y={laneY(i) + 28} fill="#6b7280" fontSize={9}
                                textAnchor="end" fontFamily="system-ui, sans-serif">{cam.sub}</text>
                        </g>
                    ))}

                    {/* Playhead sweep */}
                    {playhead !== null && (
                        <motion.line
                            x1={timeX(playhead)} y1={LANE_Y0 - 6}
                            x2={timeX(playhead)} y2={LANE_Y0 + CAMERAS.length * LANE_H - 4}
                            stroke="#444ce7" strokeWidth={1.5} strokeOpacity={0.4}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        />
                    )}

                    {/* Events */}
                    {events.map((ev) => {
                        const i = CAMERAS.findIndex((c) => c.id === ev.camera)
                        const x = timeX(ev.t)
                        const y = laneY(i) + (LANE_H - 8) / 2
                        const isMatch = matchSet.has(ev.id)
                        const past = playhead !== null && ev.t <= playhead
                        const revealed = playhead === null || past
                        const color = CAMERAS[i].color
                        return (
                            <g key={ev.id}
                                onMouseEnter={() => setHovered(ev)}
                                onMouseLeave={() => setHovered(null)}
                                style={{ cursor: "pointer" }}
                            >
                                {/* Hit area */}
                                <rect x={x - 7} y={y - 12} width={14} height={24} fill="transparent" />
                                {/* Base tick */}
                                <circle cx={x} cy={y} r={isMatch ? 5 : 2.5}
                                    fill={color}
                                    fillOpacity={isMatch ? (revealed ? 1 : 0.3) : 0.45}
                                    stroke={isMatch && revealed ? "#fff" : "none"}
                                    strokeWidth={isMatch ? 1 : 0} />
                                {/* Pulse on matched + revealed */}
                                {isMatch && revealed && (
                                    <motion.circle cx={x} cy={y} r={6}
                                        fill="none" stroke={color} strokeWidth={1}
                                        initial={{ r: 6, opacity: 0.8 }}
                                        animate={{ r: 14, opacity: 0 }}
                                        transition={{ duration: 1.4, repeat: Infinity }} />
                                )}
                            </g>
                        )
                    })}

                    {/* Hover tooltip */}
                    {hovered && (() => {
                        const i = CAMERAS.findIndex((c) => c.id === hovered.camera)
                        const x = timeX(hovered.t)
                        const y = laneY(i)
                        const tipX = Math.min(Math.max(x - 120, 20), W - 260)
                        const tipY = y - 36
                        return (
                            <g>
                                <rect x={tipX} y={tipY} width={240} height={32} rx={6}
                                    fill="#0c0c18" stroke="#1f1f2e" />
                                <text x={tipX + 10} y={tipY + 13} fill="#6b7280" fontSize={9}
                                    fontFamily="monospace">
                                    {hovered.camera} · {fmtTime(hovered.t)}
                                </text>
                                <text x={tipX + 10} y={tipY + 25} fill="#d4d4e0" fontSize={10}
                                    fontFamily="system-ui, sans-serif">
                                    {hovered.caption.length > 44
                                        ? hovered.caption.slice(0, 44) + "…"
                                        : hovered.caption}
                                </text>
                            </g>
                        )
                    })()}
                </svg>
            </div>

            {/* Answer panel */}
            <div className="px-4 pb-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={query.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-lg border border-[#444ce740] bg-[#444ce71a] p-3"
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7a82ff]" />
                            <span className="text-[10px] uppercase tracking-widest text-[#7a82ff]">
                                Gemma answer · {query.matches.length} citations
                            </span>
                        </div>
                        <div className="text-sm text-zinc-200 mb-2">{query.prompt}</div>
                        <div className="text-[12px] text-zinc-300 leading-snug">{query.answer}</div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
