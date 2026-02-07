"use client"

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

type TokenType = "keyword" | "function" | "string" | "operator" | "punctuation" | "variable" | "comment" | "number" | "text";

interface Token { text: string; type: TokenType; }

const KEYWORDS = new Set(["def", "return", "class", "import", "from", "for", "in", "if", "else", "elif", "while", "try", "except", "with", "as", "lambda", "and", "or", "not", "True", "False", "None", "async", "await", "raise", "self"]);
const BUILTINS = new Set(["sum", "float", "str", "int", "list", "dict", "print", "len", "range", "open", "map", "filter", "sorted", "max", "min", "abs", "round", "isinstance", "Exception", "ValueError"]);

function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    let r = code;
    while (r.length > 0) {
        const numM = r.match(/^\d+\.?\d*/);
        if (numM) { tokens.push({ text: numM[0], type: "number" }); r = r.slice(numM[0].length); continue; }

        const strM = r.match(/^(f?"""[\s\S]*?"""|f?'''[\s\S]*?'''|f?"[^"]*"|f?'[^']*')/);
        if (strM) { tokens.push({ text: strM[0], type: "string" }); r = r.slice(strM[0].length); continue; }

        if (r.startsWith("#")) {
            const eol = r.indexOf("\n");
            const c = eol === -1 ? r : r.slice(0, eol);
            tokens.push({ text: c, type: "comment" }); r = r.slice(c.length); continue;
        }

        const wM = r.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
        if (wM) {
            const w = wM[0];
            if (KEYWORDS.has(w)) tokens.push({ text: w, type: "keyword" });
            else if (BUILTINS.has(w)) tokens.push({ text: w, type: "function" });
            else if (r.slice(w.length).match(/^\s*\(/)) tokens.push({ text: w, type: "function" });
            else tokens.push({ text: w, type: "variable" });
            r = r.slice(w.length); continue;
        }

        const opM = r.match(/^(==|!=|<=|>=|->|\+=|-=|\*=|\/=|\*\*|\/\/|[+\-*/%=<>|&^~])/);
        if (opM) { tokens.push({ text: opM[0], type: "operator" }); r = r.slice(opM[0].length); continue; }

        const pM = r.match(/^[()[\]{},.:]/);
        if (pM) { tokens.push({ text: pM[0], type: "punctuation" }); r = r.slice(1); continue; }

        tokens.push({ text: r[0], type: "text" }); r = r.slice(1);
    }
    return tokens;
}

const TOKEN_CSS: Record<TokenType, string> = {
    keyword: "#c678dd",
    function: "#61afef",
    string: "#e5c07b",
    operator: "#c678dd",
    punctuation: "#636d83",
    variable: "#e06c75",
    comment: "#5c6370",
    number: "#d19a66",
    text: "#abb2bf",
};

function HighlightedSpan({ code, ghost }: { code: string; ghost?: boolean }) {
    const tokens = useMemo(() => tokenize(code), [code]);
    return (
        <span style={{ opacity: ghost ? 0.38 : 1 }}>
            {tokens.map((t, i) => (
                <span key={i} style={{ color: TOKEN_CSS[t.type] }}>{t.text}</span>
            ))}
        </span>
    );
}

interface Scenario {
    /** Lines already visible when the scenario starts */
    existing: string[];
    /** Characters the user types (appended to the last existing line) */
    typed: string;
    /** Ghost prediction text shown after processing */
    prediction: string;
    /** Extra lines appended after accepting the prediction (for multi-line predictions) */
    extraLines?: string[];
}

const scenarios: Scenario[] = [
    {
        existing: [
            "def calculate_total(items):",
            "    total = sum(i.price for i in items)",
            "    ",
        ],
        typed: "tax = total",
        prediction: " * 0.13",
        extraLines: ["    return total + tax"],
    },
    {
        existing: [
            "class Config:",
            "    def __init__(self):",
            "        self.host = \"localhost\"",
            "        ",
        ],
        typed: "self.port",
        prediction: " = 8080",
        extraLines: ["        self.debug = False"],
    },
    {
        existing: [
            "async def fetch_data(url: str):",
            "    async with aiohttp.ClientSession() as s:",
            "        ",
        ],
        typed: "resp = await s",
        prediction: ".get(url)",
        extraLines: ["        return await resp.json()"],
    },
    {
        existing: [
            "def merge_sort(arr: list) -> list:",
            "    if len(arr) <= 1:",
            "        return arr",
            "    mid = len(arr)",
        ],
        typed: " // 2",
        prediction: "",
        extraLines: [
            "    left = merge_sort(arr[:mid])",
            "    right = merge_sort(arr[mid:])",
        ],
    },
];

// ─── Durations ──────────────────────────────────────────────────────

const TYPING_SPEED = 55;      // ms per character
const PAUSE_BEFORE = 600;     // pause after typing before processing
const PROCESSING_MS = 1400;   // canvas animation duration
const GHOST_SHOW_MS = 1800;   // how long ghost text is visible before accept
const ACCEPT_FLASH_MS = 350;  // green flash on accept
const HOLD_MS = 1600;         // hold final result
const INTER_SCENARIO_MS = 600;

// ─── Component ──────────────────────────────────────────────────────

function ProcessingDots() {
    return (
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
                inferring
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
    );
}

export function NextEditAnimatedDemo() {
    const [scenarioIdx, setScenarioIdx] = useState(0);
    const [phase, setPhase] = useState<'typing' | 'processing' | 'ghost' | 'accepting' | 'done'>('typing');
    const [typedSoFar, setTypedSoFar] = useState('');
    const [showGhost, setShowGhost] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [showExtra, setShowExtra] = useState(false);

    const phaseStartRef = useRef(Date.now());

    const scenario = scenarios[scenarioIdx];

    // ── Phase machine ────────────────────────────────────────────────

    // Typing effect
    useEffect(() => {
        if (phase !== 'typing') return;
        setTypedSoFar('');
        setShowGhost(false);
        setAccepted(false);
        setShowExtra(false);
        let idx = 0;
        const chars = scenario.typed;
        const iv = setInterval(() => {
            if (idx < chars.length) {
                setTypedSoFar(chars.slice(0, idx + 1));
                idx++;
            } else {
                clearInterval(iv);
                // Small pause then processing
                setTimeout(() => {
                    setPhase('processing');
                    phaseStartRef.current = Date.now();
                }, PAUSE_BEFORE);
            }
        }, TYPING_SPEED);
        return () => clearInterval(iv);
    }, [phase, scenarioIdx]);

    // Processing → ghost
    useEffect(() => {
        if (phase !== 'processing') return;
        const t = setTimeout(() => {
            setShowGhost(true);
            setPhase('ghost');
            phaseStartRef.current = Date.now();
        }, PROCESSING_MS);
        return () => clearTimeout(t);
    }, [phase]);

    // Ghost → accept
    useEffect(() => {
        if (phase !== 'ghost') return;
        const t = setTimeout(() => {
            setPhase('accepting');
            setAccepted(true);
            setShowGhost(false);
            phaseStartRef.current = Date.now();
        }, GHOST_SHOW_MS);
        return () => clearTimeout(t);
    }, [phase]);

    // Accept flash → done
    useEffect(() => {
        if (phase !== 'accepting') return;
        const t1 = setTimeout(() => setShowExtra(true), 100);
        const t2 = setTimeout(() => {
            setPhase('done');
            phaseStartRef.current = Date.now();
        }, ACCEPT_FLASH_MS);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [phase]);

    // Done → next scenario
    useEffect(() => {
        if (phase !== 'done') return;
        const t = setTimeout(() => {
            setScenarioIdx(prev => (prev + 1) % scenarios.length);
            setPhase('typing');
            phaseStartRef.current = Date.now();
        }, HOLD_MS + INTER_SCENARIO_MS);
        return () => clearTimeout(t);
    }, [phase]);

    // ── Build visible lines ──────────────────────────────────────────

    const lastLineIdx = scenario.existing.length - 1;
    const lines = scenario.existing.map((l, i) => {
        if (i === lastLineIdx) {
            // This is the active line
            return l + typedSoFar + (accepted ? scenario.prediction : '');
        }
        return l;
    });

    if (showExtra && scenario.extraLines) {
        lines.push(...scenario.extraLines);
    }

    const ghostText = showGhost ? scenario.prediction : '';
    const multiLineGhost = showGhost && scenario.extraLines ? scenario.extraLines : [];

    // ── Status label ─────────────────────────────────────────────────

    const statusColor =
        phase === 'typing' ? '#abb2bf'
            : phase === 'processing' ? '#8b5cf6'
                : phase === 'ghost' ? '#8b5cf6'
                    : phase === 'accepting' || phase === 'done' ? '#22c55e'
                        : '#abb2bf';

    const statusText =
        phase === 'typing' ? 'Editing...'
            : phase === 'processing' ? 'Predicting...'
                : phase === 'ghost' ? 'Suggestion ready'
                    : phase === 'accepting' || phase === 'done' ? 'Accepted'
                        : '';

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
                background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1025 50%, #12082e 100%)',
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
                        scale: phase === 'processing' ? [1, 1.3, 1] : 1,
                        opacity: phase === 'done' ? 0.6 : 1,
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
                    maxWidth: 420,
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.07)',
                    overflow: 'hidden',
                    boxShadow:
                        phase === 'processing'
                            ? '0 0 24px rgba(139,92,246,0.18)'
                            : phase === 'ghost'
                                ? '0 0 20px rgba(139,92,246,0.12)'
                                : (phase === 'accepting' || phase === 'done')
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
                        editor.py
                    </span>
                    <motion.div
                        style={{
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '2px 8px',
                            borderRadius: 5,
                            background: 'rgba(139,92,246,0.08)',
                            border: '1px solid rgba(139,92,246,0.18)',
                        }}
                        animate={{
                            borderColor:
                                phase === 'processing' || phase === 'ghost'
                                    ? ['rgba(139,92,246,0.2)', 'rgba(139,92,246,0.5)', 'rgba(139,92,246,0.2)']
                                    : 'rgba(139,92,246,0.18)',
                        }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                    >
                        <motion.div
                            style={{ width: 5, height: 5, borderRadius: '50%', background: '#8b5cf6' }}
                            animate={{
                                scale: (phase === 'processing' || phase === 'ghost') ? [1, 1.4, 1] : 1,
                                opacity: (phase === 'processing' || phase === 'ghost') ? 1 : 0.4,
                            }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                        />
                        <span style={{ fontSize: 9, color: 'rgba(139,92,246,0.85)', fontWeight: 500, fontFamily: 'system-ui, sans-serif' }}>
                            Next Edit
                        </span>
                    </motion.div>
                </div>

                {/* Code area */}
                <div style={{
                    fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
                    fontSize: 11,
                    lineHeight: '20px',
                    padding: '10px 12px',
                    minHeight: 120,
                    whiteSpace: 'pre',
                    overflowX: 'auto',
                }}>
                    {lines.map((line, i) => {
                        const isCursorLine = i === lastLineIdx;
                        const isExtraLine = i > lastLineIdx;
                        return (
                            <div key={i} style={{ display: 'flex', minHeight: 20 }}>
                                <span style={{
                                    width: 24,
                                    textAlign: 'right',
                                    paddingRight: 10,
                                    color: '#3d4455',
                                    fontSize: 10,
                                    userSelect: 'none',
                                    flexShrink: 0,
                                }}>
                                    {i + 1}
                                </span>
                                <span style={{ flex: 1 }}>
                                    {/* Accepted extra lines flash */}
                                    {isExtraLine ? (
                                        <motion.span
                                            initial={{ opacity: 0, backgroundColor: 'rgba(34,197,94,0.18)' }}
                                            animate={{ opacity: 1, backgroundColor: 'rgba(34,197,94,0)' }}
                                            transition={{ duration: 0.5 }}
                                            style={{ borderRadius: 2, padding: '0 2px' }}
                                        >
                                            <HighlightedSpan code={line} />
                                        </motion.span>
                                    ) : (
                                        <>
                                            <HighlightedSpan code={line} />
                                            {/* Ghost text on cursor line */}
                                            {isCursorLine && ghostText && (
                                                <HighlightedSpan code={ghostText} ghost />
                                            )}
                                            {/* Blinking cursor */}
                                            {isCursorLine && phase !== 'done' && !accepted && (
                                                <motion.span
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 1.5,
                                                        height: '1em',
                                                        background: '#abb2bf',
                                                        marginLeft: 1,
                                                        verticalAlign: 'middle',
                                                    }}
                                                    animate={{ opacity: [1, 0] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                                                />
                                            )}
                                        </>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                    {/* Ghost extra lines */}
                    {showGhost && multiLineGhost.map((line, i) => (
                        <div key={`ghost-${i}`} style={{ display: 'flex', minHeight: 20 }}>
                            <span style={{
                                width: 24,
                                textAlign: 'right',
                                paddingRight: 10,
                                color: '#3d4455',
                                fontSize: 10,
                                userSelect: 'none',
                                flexShrink: 0,
                                opacity: 0.4,
                            }}>
                                {lines.length + i + 1}
                            </span>
                            <HighlightedSpan code={line} ghost />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Processing indicator */}
            <AnimatePresence mode="wait">
                {phase === 'processing' && <ProcessingDots />}
            </AnimatePresence>

            {/* Tab hint */}
            <AnimatePresence>
                {phase === 'ghost' && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 10,
                            color: '#8b5cf6',
                            fontFamily: 'system-ui, sans-serif',
                        }}
                    >
                        Press
                        <span style={{
                            padding: '1px 6px',
                            background: 'rgba(139,92,246,0.15)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            borderRadius: 4,
                            fontSize: 9,
                            fontWeight: 600,
                            fontFamily: 'system-ui, sans-serif',
                        }}>
                            Tab
                        </span>
                        to accept
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Accept confirmation */}
            <AnimatePresence>
                {(phase === 'accepting' || phase === 'done') && (
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
                        Prediction accepted
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
