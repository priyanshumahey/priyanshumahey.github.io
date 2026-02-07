"use client"

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * FileWatcherDemo — Animated demo showing the file watching + index pipeline.
 * Files appear one by one, get processed, and are indexed or filtered out.
 * Styled to match NextEditAnimatedDemo / IvDemo aesthetic.
 */

// ─── Types ──────────────────────────────────────────────────────────

type EventType = 'create' | 'modify' | 'delete';
type FileStatus = 'entering' | 'processing' | 'indexed' | 'filtered';

interface FileEntry {
    filename: string;
    ext: string;
    eventType: EventType;
    status: FileStatus;
    filterReason?: string;
}

// ─── Scenarios ──────────────────────────────────────────────────────

interface ScenarioFile {
    filename: string;
    ext: string;
    eventType: EventType;
    filterOut?: boolean;
    filterReason?: string;
}

const scenarios: ScenarioFile[][] = [
    [
        { filename: "auth.ts", ext: "ts", eventType: "modify" },
        { filename: "utils.py", ext: "py", eventType: "modify" },
        { filename: "schema.graphql", ext: "graphql", eventType: "create" },
        { filename: "package-lock.json", ext: "json", eventType: "modify", filterOut: true, filterReason: "lock file" },
        { filename: "api.rs", ext: "rs", eventType: "modify" },
    ],
    [
        { filename: "main.py", ext: "py", eventType: "modify" },
        { filename: "node_modules/react/index.js", ext: "js", eventType: "modify", filterOut: true, filterReason: "node_modules" },
        { filename: "config.toml", ext: "toml", eventType: "modify" },
        { filename: "handler.go", ext: "go", eventType: "create" },
        { filename: ".env", ext: "env", eventType: "modify", filterOut: true, filterReason: "dotfile" },
        { filename: "routes.ts", ext: "ts", eventType: "modify" },
    ],
    [
        { filename: "old_service.py", ext: "py", eventType: "delete" },
        { filename: "service.py", ext: "py", eventType: "create" },
        { filename: "test_service.py", ext: "py", eventType: "modify" },
        { filename: "image.png", ext: "png", eventType: "create", filterOut: true, filterReason: "binary" },
        { filename: "models.rs", ext: "rs", eventType: "modify" },
    ],
];

// ─── Colors ─────────────────────────────────────────────────────────

const EVENT_COLORS: Record<EventType, string> = {
    create: '#22c55e',
    modify: '#3b82f6',
    delete: '#ef4444',
};

const EXT_COLORS: Record<string, string> = {
    ts: '#3178c6', js: '#f7df1e', py: '#3572a5', rs: '#dea584',
    go: '#00add8', graphql: '#e535ab', toml: '#9c4221', json: '#636d83',
    png: '#636d83', env: '#636d83',
};

// ─── Timing ─────────────────────────────────────────────────────────

const FILE_STAGGER = 450;       // ms between each file appearing
const PROCESS_DELAY = 350;      // ms after appearing before processing starts
const PROCESS_DURATION = 900;   // ms of processing animation
const HOLD_MS = 1800;           // hold final state
const INTER_SCENARIO_MS = 800;  // gap between scenarios

// ─── Component ──────────────────────────────────────────────────────

export function FileWatcherDemo() {
    const [scenarioIdx, setScenarioIdx] = useState(0);
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [indexedCount, setIndexedCount] = useState(0);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    const scenario = scenarios[scenarioIdx];

    const clearTimeouts = () => {
        timeoutsRef.current.forEach(t => clearTimeout(t));
        timeoutsRef.current = [];
    };

    const addTimeout = (fn: () => void, ms: number) => {
        const t = setTimeout(fn, ms);
        timeoutsRef.current.push(t);
    };

    // ── Run scenario ─────────────────────────────────────────────────

    useEffect(() => {
        clearTimeouts();
        setFiles([]);
        setIndexedCount(0);

        let indexed = 0;

        scenario.forEach((file, i) => {
            const baseDelay = i * FILE_STAGGER;

            // File appears
            addTimeout(() => {
                setFiles(prev => [...prev, {
                    filename: file.filename,
                    ext: file.ext,
                    eventType: file.eventType,
                    status: 'entering',
                    filterReason: file.filterReason,
                }]);
            }, baseDelay);

            // Start processing
            addTimeout(() => {
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'processing' } : f
                ));
            }, baseDelay + PROCESS_DELAY);

            // Finish processing
            addTimeout(() => {
                const status: FileStatus = file.filterOut ? 'filtered' : 'indexed';
                if (!file.filterOut) {
                    indexed++;
                    setIndexedCount(indexed);
                }
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status } : f
                ));
            }, baseDelay + PROCESS_DELAY + PROCESS_DURATION);
        });

        // Next scenario
        const totalDuration = scenario.length * FILE_STAGGER + PROCESS_DELAY + PROCESS_DURATION + HOLD_MS;
        addTimeout(() => {
            setScenarioIdx(prev => (prev + 1) % scenarios.length);
        }, totalDuration + INTER_SCENARIO_MS);

        return () => clearTimeouts();
    }, [scenarioIdx]);

    // ── Derived state ────────────────────────────────────────────────

    const allDone = files.length === scenario.length &&
        files.every(f => f.status === 'indexed' || f.status === 'filtered');
    const isProcessing = files.some(f => f.status === 'processing');

    const statusColor = allDone ? '#22c55e' : isProcessing ? '#8b5cf6' : '#f59e0b';
    const statusText = allDone ? 'Index up to date' : isProcessing ? 'Indexing...' : 'Watching...';

    // ── Render ───────────────────────────────────────────────────────

    return (
        <div
            className="select-none pointer-events-none"
            style={{
                width: '100%',
                height: '100%',
                minHeight: 340,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                background: 'linear-gradient(135deg, #0d0d0d 0%, #0d1525 50%, #0d0d1a 100%)',
                borderRadius: 12,
                overflow: 'hidden',
            }}
        >
            {/* Status indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: statusColor,
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                <motion.div
                    animate={{
                        scale: isProcessing ? [1, 1.3, 1] : 1,
                        opacity: allDone ? 0.6 : 1,
                    }}
                    transition={{
                        scale: { repeat: Infinity, duration: 0.8 },
                    }}
                    style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: statusColor,
                    }}
                />
                {statusText}
            </motion.div>

            {/* Code card */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '88%',
                    maxWidth: 400,
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.07)',
                    overflow: 'hidden',
                    boxShadow:
                        isProcessing
                            ? '0 0 24px rgba(139,92,246,0.18)'
                            : allDone
                                ? '0 0 20px rgba(34,197,94,0.15)'
                                : '0 0 12px rgba(0,0,0,0.3)',
                }}
            >
                {/* Title bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
                    </div>
                    <span style={{
                        fontSize: 10,
                        color: '#636d83',
                        marginLeft: 10,
                        fontFamily: 'system-ui, sans-serif',
                    }}>
                        file watcher
                    </span>
                    <motion.div
                        style={{
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '2px 8px',
                            borderRadius: 5,
                            background: isProcessing ? 'rgba(139,92,246,0.08)' : 'rgba(245,158,11,0.08)',
                            border: `1px solid ${isProcessing ? 'rgba(139,92,246,0.18)' : 'rgba(245,158,11,0.18)'}`,
                        }}
                        animate={{
                            borderColor: isProcessing
                                ? ['rgba(139,92,246,0.2)', 'rgba(139,92,246,0.5)', 'rgba(139,92,246,0.2)']
                                : 'rgba(245,158,11,0.18)',
                        }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                    >
                        <motion.div
                            style={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                background: isProcessing ? '#8b5cf6' : '#f59e0b',
                            }}
                            animate={{
                                scale: isProcessing ? [1, 1.4, 1] : [1, 1.15, 1],
                            }}
                            transition={{ duration: isProcessing ? 0.6 : 2, repeat: Infinity }}
                        />
                        <span style={{
                            fontSize: 9,
                            color: isProcessing ? 'rgba(139,92,246,0.85)' : 'rgba(245,158,11,0.85)',
                            fontWeight: 500,
                            fontFamily: 'system-ui, sans-serif',
                        }}>
                            {isProcessing ? 'Indexing' : 'Watching'}
                        </span>
                    </motion.div>
                </div>

                {/* File list */}
                <div style={{
                    padding: '8px 10px',
                    minHeight: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                }}>
                    <AnimatePresence mode="popLayout">
                        {files.map((file, i) => {
                            const eventColor = EVENT_COLORS[file.eventType];
                            const extColor = EXT_COLORS[file.ext] || '#636d83';
                            const isFiltered = file.status === 'filtered';
                            const isIndexed = file.status === 'indexed';
                            const isProcessingFile = file.status === 'processing';

                            return (
                                <motion.div
                                    key={`${scenarioIdx}-${i}`}
                                    initial={{ opacity: 0, x: -16, height: 0 }}
                                    animate={{
                                        opacity: isFiltered ? 0.35 : 1,
                                        x: 0,
                                        height: 28,
                                    }}
                                    transition={{
                                        opacity: { duration: 0.3 },
                                        x: { type: 'spring', stiffness: 300, damping: 25 },
                                        height: { duration: 0.2 },
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '0 8px',
                                        borderRadius: 6,
                                        background: isProcessingFile
                                            ? 'rgba(139,92,246,0.06)'
                                            : isIndexed
                                                ? 'rgba(34,197,94,0.04)'
                                                : 'transparent',
                                        overflow: 'hidden',
                                        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
                                    }}
                                >
                                    {/* Processing shimmer */}
                                    {isProcessingFile && (
                                        <motion.div
                                            animate={{ opacity: [0.03, 0.1, 0.03] }}
                                            transition={{ duration: 1.2, repeat: Infinity }}
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                borderRadius: 6,
                                                background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.08), transparent)',
                                            }}
                                        />
                                    )}

                                    {/* Extension color dot */}
                                    <div style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: extColor,
                                        flexShrink: 0,
                                        opacity: isFiltered ? 0.4 : 0.8,
                                    }} />

                                    {/* Filename */}
                                    <span style={{
                                        color: isFiltered ? '#4b5563' : '#e5e7eb',
                                        flex: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        textDecoration: isFiltered ? 'line-through' : 'none',
                                        fontSize: 11,
                                    }}>
                                        {file.filename}
                                    </span>

                                    {/* Event type badge */}
                                    <span style={{
                                        fontSize: 8,
                                        fontWeight: 600,
                                        letterSpacing: '0.5px',
                                        color: eventColor,
                                        opacity: isFiltered ? 0.4 : 0.7,
                                        textTransform: 'uppercase',
                                        flexShrink: 0,
                                    }}>
                                        {file.eventType}
                                    </span>

                                    {/* Status indicator */}
                                    <div style={{ width: 18, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                                        {isProcessingFile && (
                                            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                {[0, 1, 2].map(j => (
                                                    <motion.div
                                                        key={j}
                                                        animate={{
                                                            scale: [1, 1.4, 1],
                                                            opacity: [0.3, 1, 0.3],
                                                        }}
                                                        transition={{
                                                            duration: 0.8,
                                                            repeat: Infinity,
                                                            delay: j * 0.15,
                                                            ease: 'easeInOut',
                                                        }}
                                                        style={{
                                                            width: 2.5,
                                                            height: 2.5,
                                                            borderRadius: '50%',
                                                            background: '#8b5cf6',
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {isIndexed && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                                style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}
                                            >
                                                ✓
                                            </motion.span>
                                        )}
                                        {isFiltered && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                                style={{ color: '#ef4444', fontSize: 10, opacity: 0.5 }}
                                            >
                                                ✕
                                            </motion.span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Processing indicator pill */}
            <AnimatePresence mode="wait">
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '6px 16px',
                            background: 'rgba(0,0,0,0.45)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: 20,
                            border: '1px solid rgba(139,92,246,0.15)',
                        }}
                    >
                        <span style={{
                            fontSize: 9,
                            color: 'rgba(139,92,246,0.7)',
                            fontWeight: 500,
                            fontFamily: 'system-ui, sans-serif',
                            letterSpacing: '0.3px',
                        }}>
                            chunk → embed → store
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3],
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: 'easeInOut',
                                    }}
                                    style={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        background: '#8b5cf6',
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion message */}
            <AnimatePresence>
                {allDone && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 10,
                            color: '#22c55e',
                            fontFamily: 'system-ui, sans-serif',
                            fontWeight: 500,
                        }}
                    >
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                            ✓
                        </motion.span>
                        {indexedCount} files indexed
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Branding */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                style={{
                    position: 'absolute',
                    bottom: 12,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: '#fff',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                fleur
            </motion.div>
        </div>
    );
}
