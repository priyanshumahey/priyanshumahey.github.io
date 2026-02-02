"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    Code2,
    FileSearch,
    Hash,
    Play,
    RotateCcw,
    Search,
    Sparkles,
    Zap
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Sample codebase files to search through
const SAMPLE_FILES = [
    {
        name: "auth.ts",
        path: "src/services/auth.ts",
        language: "typescript",
        content: `import { hash, verify } from 'crypto';
import { User, Session } from './types';

export async function authenticateUser(
    email: string,
    password: string
): Promise<Session | null> {
    const user = await findUserByEmail(email);
    if (!user) return null;
    
    const isValid = await verify(password, user.passwordHash);
    if (!isValid) return null;
    
    return createSession(user);
}

export async function validateSession(
    token: string
): Promise<User | null> {
    const session = await findSession(token);
    if (!session || isExpired(session)) {
        return null;
    }
    return session.user;
}

function isExpired(session: Session): boolean {
    return Date.now() > session.expiresAt;
}`
    },
    {
        name: "database.ts",
        path: "src/services/database.ts",
        language: "typescript",
        content: `import { Pool, QueryResult } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20
});

export async function query<T>(
    sql: string,
    params?: unknown[]
): Promise<T[]> {
    const client = await pool.connect();
    try {
        const result = await client.query(sql, params);
        return result.rows as T[];
    } finally {
        client.release();
    }
}

export async function findUserByEmail(
    email: string
): Promise<User | null> {
    const users = await query<User>(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return users[0] || null;
}

export async function findSession(
    token: string
): Promise<Session | null> {
    const sessions = await query<Session>(
        'SELECT * FROM sessions WHERE token = $1',
        [token]
    );
    return sessions[0] || null;
}`
    },
    {
        name: "api.ts",
        path: "src/routes/api.ts",
        language: "typescript",
        content: `import { Router, Request, Response } from 'express';
import { authenticateUser, validateSession } from '../services/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const session = await authenticateUser(email, password);
    if (!session) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ token: session.token });
});

router.get('/me', async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = await validateSession(token);
    if (!user) {
        return res.status(401).json({ error: 'Invalid session' });
    }
    
    res.json({ user });
});

export default router;`
    }
];

// Predefined search patterns for the demo
const SEARCH_PATTERNS = [
    {
        label: "Find all async functions",
        pattern: "async function",
        isRegex: false,
        description: "Literal text search for async function declarations"
    },
    {
        label: "Find email parameters",
        pattern: "email",
        isRegex: false,
        description: "Simple keyword search across all files"
    },
    {
        label: "Find return statements",
        pattern: "return \\w+",
        isRegex: true,
        description: "Regex pattern matching return followed by a word"
    },
    {
        label: "Find null checks",
        pattern: "!\\w+|=== null|!== null",
        isRegex: true,
        description: "Regex to find null/undefined checks"
    },
    {
        label: "Find import statements",
        pattern: "^import .+ from",
        isRegex: true,
        description: "Regex matching import statements at line start"
    },
];

interface Match {
    fileIndex: number;
    lineNumber: number;
    lineContent: string;
    matchStart: number;
    matchEnd: number;
    matchText: string;
}

interface ScanState {
    currentFileIndex: number;
    currentLineIndex: number;
    isComplete: boolean;
    foundMatches: Match[];
}

// Color palette for files
const FILE_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

/**
 * GrepDemo - Interactive visualization of how grep searches through code
 * Shows pattern matching, line-by-line scanning, and result aggregation
 */
export function GrepDemo() {
    const [selectedPatternIndex, setSelectedPatternIndex] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanSpeed, setScanSpeed] = useState<"slow" | "fast">("fast");
    const [scanState, setScanState] = useState<ScanState>({
        currentFileIndex: 0,
        currentLineIndex: -1,
        isComplete: false,
        foundMatches: []
    });
    const [showResults, setShowResults] = useState(false);
    const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoad = useRef(true);

    const selectedPattern = SEARCH_PATTERNS[selectedPatternIndex];

    // Compute all matches for the current pattern
    const allMatches = useMemo(() => {
        const matches: Match[] = [];
        const pattern = selectedPattern.isRegex
            ? new RegExp(selectedPattern.pattern, "gi")
            : new RegExp(selectedPattern.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

        SAMPLE_FILES.forEach((file, fileIndex) => {
            const lines = file.content.split("\n");
            lines.forEach((line, lineIndex) => {
                let match;
                pattern.lastIndex = 0;
                while ((match = pattern.exec(line)) !== null) {
                    matches.push({
                        fileIndex,
                        lineNumber: lineIndex + 1,
                        lineContent: line,
                        matchStart: match.index,
                        matchEnd: match.index + match[0].length,
                        matchText: match[0]
                    });
                }
            });
        });
        return matches;
    }, [selectedPattern]);

    // Run the scanning animation
    const startScan = useCallback((instant = false) => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
        }

        setScanState({
            currentFileIndex: 0,
            currentLineIndex: -1,
            isComplete: false,
            foundMatches: []
        });
        setShowResults(false);

        if (instant) {
            // Skip animation, show results immediately
            setScanState({
                currentFileIndex: SAMPLE_FILES.length - 1,
                currentLineIndex: -1,
                isComplete: true,
                foundMatches: allMatches
            });
            setShowResults(true);
            return;
        }

        setIsScanning(true);

        // Build the sequence of all lines across all files
        const lineSequence: { fileIndex: number; lineIndex: number }[] = [];
        SAMPLE_FILES.forEach((file, fileIndex) => {
            const lineCount = file.content.split("\n").length;
            for (let i = 0; i < lineCount; i++) {
                lineSequence.push({ fileIndex, lineIndex: i });
            }
        });

        let seqIndex = 0;
        const matchesFound: Match[] = [];
        const interval = scanSpeed === "slow" ? 80 : 25;

        scanIntervalRef.current = setInterval(() => {
            if (seqIndex >= lineSequence.length) {
                // Scanning complete
                clearInterval(scanIntervalRef.current!);
                scanIntervalRef.current = null;
                setIsScanning(false);
                setScanState(prev => ({
                    ...prev,
                    currentLineIndex: -1,
                    isComplete: true
                }));
                setShowResults(true);
                return;
            }

            const { fileIndex, lineIndex } = lineSequence[seqIndex];

            // Check if this line has any matches
            const lineMatches = allMatches.filter(
                m => m.fileIndex === fileIndex && m.lineNumber === lineIndex + 1
            );
            lineMatches.forEach(m => matchesFound.push(m));

            setScanState({
                currentFileIndex: fileIndex,
                currentLineIndex: lineIndex,
                isComplete: false,
                foundMatches: [...matchesFound]
            });

            seqIndex++;
        }, interval);
    }, [allMatches, scanSpeed]);

    // Reset scan
    const resetScan = useCallback(() => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        setIsScanning(false);
        setScanState({
            currentFileIndex: 0,
            currentLineIndex: -1,
            isComplete: false,
            foundMatches: []
        });
        setShowResults(false);
    }, []);

    // Auto-run on first load and pattern change
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            startScan(true);
        } else {
            resetScan();
            const timer = setTimeout(() => startScan(false), 100);
            return () => clearTimeout(timer);
        }
    }, [selectedPatternIndex]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
            }
        };
    }, []);

    // Render highlighted line with match
    const renderHighlightedLine = (line: string, matches: Match[], lineNumber: number, fileIndex: number) => {
        const lineMatches = matches.filter(
            m => m.fileIndex === fileIndex && m.lineNumber === lineNumber
        );

        if (lineMatches.length === 0) {
            return <span className="text-zinc-400">{line || " "}</span>;
        }

        // Sort matches by position
        const sortedMatches = [...lineMatches].sort((a, b) => a.matchStart - b.matchStart);
        const parts: React.ReactNode[] = [];
        let lastEnd = 0;

        sortedMatches.forEach((match, idx) => {
            // Add text before match
            if (match.matchStart > lastEnd) {
                parts.push(
                    <span key={`pre-${idx}`} className="text-zinc-400">
                        {line.slice(lastEnd, match.matchStart)}
                    </span>
                );
            }
            // Add highlighted match
            parts.push(
                <motion.span
                    key={`match-${idx}`}
                    className="bg-yellow-500/30 text-yellow-200 rounded px-0.5"
                    initial={{ backgroundColor: "rgba(234, 179, 8, 0)" }}
                    animate={{ backgroundColor: "rgba(234, 179, 8, 0.3)" }}
                    transition={{ duration: 0.2 }}
                >
                    {line.slice(match.matchStart, match.matchEnd)}
                </motion.span>
            );
            lastEnd = match.matchEnd;
        });

        // Add remaining text
        if (lastEnd < line.length) {
            parts.push(
                <span key="post" className="text-zinc-400">
                    {line.slice(lastEnd)}
                </span>
            );
        }

        return <>{parts}</>;
    };

    return (
        <div className="w-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-zinc-800">
            {/* Controls */}
            <div className="p-3 border-b border-zinc-800 bg-zinc-900/30 flex flex-wrap items-center gap-3">
                {/* Pattern selector */}
                <div className="relative flex-1 min-w-[200px]">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={isScanning}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-colors disabled:opacity-50"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <Search className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                            <div className="text-left min-w-0">
                                <div className="text-xs text-zinc-200 truncate">{selectedPattern.label}</div>
                                <div className="text-[10px] text-zinc-500 truncate font-mono">
                                    {selectedPattern.isRegex ? "/" : ""}{selectedPattern.pattern}{selectedPattern.isRegex ? "/gi" : ""}
                                </div>
                            </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden"
                            >
                                {SEARCH_PATTERNS.map((pattern, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSelectedPatternIndex(i);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left hover:bg-zinc-800 transition-colors ${i === selectedPatternIndex ? "bg-zinc-800/50" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {pattern.isRegex ? (
                                                <Sparkles className="w-3 h-3 text-purple-400" />
                                            ) : (
                                                <Hash className="w-3 h-3 text-blue-400" />
                                            )}
                                            <span className="text-xs text-zinc-200">{pattern.label}</span>
                                        </div>
                                        <div className="mt-0.5 text-[10px] text-zinc-500 font-mono pl-5">
                                            {pattern.pattern}
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Speed toggle */}
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <button
                        onClick={() => setScanSpeed(scanSpeed === "slow" ? "fast" : "slow")}
                        disabled={isScanning}
                        className={`px-2 py-1 rounded transition-colors disabled:opacity-50 ${scanSpeed === "slow" ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800 hover:bg-zinc-700"}`}
                    >
                        <Zap className="w-3 h-3" />
                    </button>
                    <span>{scanSpeed === "slow" ? "Slow" : "Fast"}</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => startScan(false)}
                        disabled={isScanning}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                        <Play className="w-3 h-3" />
                        <span className="hidden sm:inline">Scan</span>
                    </button>
                    <button
                        onClick={resetScan}
                        disabled={isScanning}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                </div>
            </div>

            {/* Pattern info */}
            <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/20 flex items-center gap-2">
                {selectedPattern.isRegex ? (
                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] font-medium flex-shrink-0">REGEX</span>
                ) : (
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-medium flex-shrink-0">LITERAL</span>
                )}
                <span className="text-[10px] text-zinc-500 hidden sm:block truncate">{selectedPattern.description}</span>
            </div>

            {/* Main content - files view */}
            <div className="flex flex-col lg:flex-row">
                {/* Files panel */}
                <div className="flex-1 border-b lg:border-b-0 lg:border-r border-zinc-800">
                    <div className="p-2 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-[10px] sm:text-xs font-medium text-zinc-400">Source Files</span>
                        </div>
                        {isScanning && (
                            <motion.div
                                className="flex items-center gap-1.5"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                <span className="text-[10px] text-yellow-400">Scanning...</span>
                            </motion.div>
                        )}
                        {/* Mobile results count */}
                        {!isScanning && scanState.isComplete && scanState.foundMatches.length > 0 && (
                            <span className="lg:hidden text-[10px] text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded">
                                {scanState.foundMatches.length} found
                            </span>
                        )}
                    </div>

                    <ScrollArea className="h-[280px] sm:h-[320px] lg:h-[380px]">
                        <div className="p-2">
                            {SAMPLE_FILES.map((file, fileIndex) => {
                                const lines = file.content.split("\n");
                                const isActiveFile = scanState.currentFileIndex === fileIndex;
                                const fileColor = FILE_COLORS[fileIndex];
                                const fileMatches = scanState.foundMatches.filter(m => m.fileIndex === fileIndex);

                                return (
                                    <div key={file.path} className="mb-4 last:mb-0">
                                        {/* File header */}
                                        <div
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-t-lg border-l-2"
                                            style={{
                                                backgroundColor: isActiveFile ? fileColor + "15" : "transparent",
                                                borderLeftColor: fileColor
                                            }}
                                        >
                                            <Code2 className="w-3 h-3" style={{ color: fileColor }} />
                                            <span className="text-[10px] sm:text-xs font-medium text-zinc-300">{file.path}</span>
                                            {fileMatches.length > 0 && (
                                                <span
                                                    className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-medium"
                                                    style={{ backgroundColor: fileColor + "30", color: fileColor }}
                                                >
                                                    {fileMatches.length} match{fileMatches.length !== 1 ? "es" : ""}
                                                </span>
                                            )}
                                        </div>

                                        {/* File content */}
                                        <div className="bg-zinc-900/30 rounded-b-lg border border-zinc-800 border-t-0 overflow-hidden">
                                            <div className="font-mono text-[10px] sm:text-[11px] leading-relaxed overflow-x-auto">
                                                {lines.map((line, lineIndex) => {
                                                    const lineNumber = lineIndex + 1;
                                                    const isCurrentLine =
                                                        isScanning &&
                                                        scanState.currentFileIndex === fileIndex &&
                                                        scanState.currentLineIndex === lineIndex;
                                                    const hasMatch = scanState.foundMatches.some(
                                                        m => m.fileIndex === fileIndex && m.lineNumber === lineNumber
                                                    );

                                                    return (
                                                        <div
                                                            key={lineIndex}
                                                            className={`flex transition-all duration-75 ${isCurrentLine
                                                                ? "bg-yellow-500/20"
                                                                : hasMatch
                                                                    ? "bg-yellow-500/10"
                                                                    : "hover:bg-zinc-800/30"
                                                                }`}
                                                        >
                                                            <span
                                                                className={`w-8 sm:w-10 flex-shrink-0 text-right pr-2 select-none ${isCurrentLine
                                                                    ? "text-yellow-400"
                                                                    : hasMatch
                                                                        ? "text-yellow-500/70"
                                                                        : "text-zinc-600"
                                                                    }`}
                                                            >
                                                                {lineNumber}
                                                            </span>
                                                            <span className="pr-2 whitespace-pre">
                                                                {hasMatch
                                                                    ? renderHighlightedLine(line, scanState.foundMatches, lineNumber, fileIndex)
                                                                    : <span className="text-zinc-400">{line || " "}</span>
                                                                }
                                                            </span>
                                                            {isCurrentLine && (
                                                                <motion.span
                                                                    className="ml-auto pr-2 text-yellow-400"
                                                                    initial={{ opacity: 0, x: -4 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                >
                                                                    ◀
                                                                </motion.span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Results panel - hidden on mobile, sidebar on desktop */}
                <div className="hidden lg:block lg:w-48 flex-shrink-0">
                    <div className="p-2 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
                        <FileSearch className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[10px] font-medium text-zinc-400">Results</span>
                        {scanState.isComplete && (
                            <span className="ml-auto text-[10px] text-zinc-500">
                                {scanState.foundMatches.length}
                            </span>
                        )}
                    </div>

                    <ScrollArea className="h-[380px]">
                        <div className="p-2">
                            <AnimatePresence mode="popLayout">
                                {scanState.foundMatches.length === 0 && !isScanning ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-8 text-zinc-500 text-xs"
                                    >
                                        {scanState.isComplete ? "No matches found" : "Click Scan to search"}
                                    </motion.div>
                                ) : (
                                    scanState.foundMatches.map((match, i) => {
                                        const file = SAMPLE_FILES[match.fileIndex];
                                        const fileColor = FILE_COLORS[match.fileIndex];

                                        return (
                                            <motion.div
                                                key={`${match.fileIndex}-${match.lineNumber}-${match.matchStart}-${i}`}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 8 }}
                                                transition={{ duration: 0.15 }}
                                                className="mb-1.5 last:mb-0 p-1.5 bg-zinc-800/30 rounded border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <div
                                                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: fileColor }}
                                                    />
                                                    <span className="text-[9px] text-zinc-400 truncate">{file.name}</span>
                                                    <span className="text-[9px] text-zinc-600">:</span>
                                                    <span className="text-[9px] text-yellow-400 flex-shrink-0">{match.lineNumber}</span>
                                                </div>
                                                <div className="mt-1 overflow-hidden">
                                                    <span className="block px-1 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-[8px] font-mono truncate">
                                                        {match.matchText.length > 20 ? match.matchText.slice(0, 20) + "..." : match.matchText}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>

                            {/* Progress indicator while scanning */}
                            {isScanning && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50"
                                >
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                        Scanning {SAMPLE_FILES[scanState.currentFileIndex]?.name}...
                                    </div>
                                    <div className="mt-2 h-1 bg-zinc-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-yellow-400"
                                            initial={{ width: "0%" }}
                                            animate={{
                                                width: `${((scanState.currentFileIndex * 100 +
                                                    (scanState.currentLineIndex / SAMPLE_FILES[scanState.currentFileIndex]?.content.split("\n").length) * 100) /
                                                    SAMPLE_FILES.length)}%`
                                            }}
                                            transition={{ duration: 0.1 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Footer with explanation */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/30">
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-blue-400" />
                        <span>Literal = exact text match</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Regex = pattern matching</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1.5 bg-yellow-500/30 rounded" />
                        <span>Highlighted = match found</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
