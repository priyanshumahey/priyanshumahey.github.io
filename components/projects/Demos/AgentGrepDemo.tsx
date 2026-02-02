"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import {
    Bot,
    ChevronDown,
    Code2,
    FileSearch,
    MessageSquare,
    Sparkles,
    Terminal,
    Zap
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Simulated agent scenarios
interface AgentScenario {
    id: string;
    userPrompt: string;
    agentThinking: string[];
    grepCommand: string;
    grepResults: { file: string; line: number; content: string; isMatch: boolean }[];
    agentResponse: string;
}

const SCENARIOS: AgentScenario[] = [
    {
        id: "auth",
        userPrompt: "Where is user authentication handled in this codebase?",
        agentThinking: [
            "I need to find authentication-related code",
            "Searching for 'authenticate' or 'auth' patterns",
            "Using grep to scan the codebase..."
        ],
        grepCommand: "grep -rn 'authenticate|auth' src/",
        grepResults: [
            { file: "src/auth/login.ts", line: 12, content: "export async function authenticateUser(email, password) {", isMatch: true },
            { file: "src/auth/login.ts", line: 23, content: "  const isAuthenticated = await verifyCredentials(user);", isMatch: true },
            { file: "src/middleware/auth.ts", line: 5, content: "export function authMiddleware(req, res, next) {", isMatch: true },
            { file: "src/routes/api.ts", line: 8, content: "import { authMiddleware } from '../middleware/auth';", isMatch: true },
        ],
        agentResponse: "Authentication is handled in `src/auth/login.ts` with the `authenticateUser()` function. There's also middleware in `src/middleware/auth.ts` that protects routes."
    },
    {
        id: "database",
        userPrompt: "Find all database queries in the project",
        agentThinking: [
            "Looking for SQL queries or ORM calls",
            "Searching for query patterns like SELECT, INSERT, or .query()",
            "Scanning database-related files..."
        ],
        grepCommand: "grep -rn 'SELECT|INSERT|UPDATE|.query(' src/",
        grepResults: [
            { file: "src/db/users.ts", line: 15, content: "  return db.query('SELECT * FROM users WHERE id = ?', [id]);", isMatch: true },
            { file: "src/db/users.ts", line: 28, content: "  await db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);", isMatch: true },
            { file: "src/db/sessions.ts", line: 9, content: "  const result = await db.query('SELECT * FROM sessions WHERE token = ?', [token]);", isMatch: true },
        ],
        agentResponse: "Found 3 database queries in `src/db/`. Users are queried in `users.ts` (lines 15, 28) and sessions in `sessions.ts` (line 9). All use parameterized queries."
    },
    {
        id: "error",
        userPrompt: "How are errors handled in this API?",
        agentThinking: [
            "Need to find error handling patterns",
            "Looking for try/catch blocks and error responses",
            "Searching for error-related code..."
        ],
        grepCommand: "grep -rn 'catch|throw|Error|error:' src/",
        grepResults: [
            { file: "src/utils/errors.ts", line: 3, content: "export class AppError extends Error {", isMatch: true },
            { file: "src/utils/errors.ts", line: 12, content: "export class NotFoundError extends AppError {", isMatch: true },
            { file: "src/routes/api.ts", line: 34, content: "  } catch (error) {", isMatch: true },
            { file: "src/routes/api.ts", line: 35, content: "    return res.status(500).json({ error: error.message });", isMatch: true },
            { file: "src/middleware/errorHandler.ts", line: 8, content: "export function errorHandler(error, req, res, next) {", isMatch: true },
        ],
        agentResponse: "Errors use custom classes in `src/utils/errors.ts`. API routes catch errors and return JSON responses. There's a global error handler middleware in `errorHandler.ts`."
    },
    {
        id: "env",
        userPrompt: "What environment variables does this app use?",
        agentThinking: [
            "Environment variables accessed via process.env",
            "Searching for process.env patterns",
            "Looking across all source files..."
        ],
        grepCommand: "grep -rn 'process.env' src/",
        grepResults: [
            { file: "src/config/database.ts", line: 4, content: "  connectionString: process.env.DATABASE_URL,", isMatch: true },
            { file: "src/config/database.ts", line: 5, content: "  maxConnections: parseInt(process.env.DB_POOL_SIZE || '10'),", isMatch: true },
            { file: "src/config/auth.ts", line: 3, content: "  jwtSecret: process.env.JWT_SECRET,", isMatch: true },
            { file: "src/server.ts", line: 8, content: "const PORT = process.env.PORT || 3000;", isMatch: true },
        ],
        agentResponse: "The app uses 4 env variables: `DATABASE_URL`, `DB_POOL_SIZE`, `JWT_SECRET`, and `PORT`. They're configured in `src/config/` and `server.ts`."
    },
];

type AnimationPhase = "idle" | "thinking" | "searching" | "results" | "responding";

export function AgentGrepDemo() {
    const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [phase, setPhase] = useState<AnimationPhase>("idle");
    const [thinkingIndex, setThinkingIndex] = useState(0);
    const [visibleResults, setVisibleResults] = useState(0);
    const [showResponse, setShowResponse] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoad = useRef(true);

    const scenario = SCENARIOS[selectedScenarioIndex];

    const runAnimation = useCallback((instant = false) => {
        // Clear any pending timeouts
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (instant) {
            setPhase("responding");
            setThinkingIndex(scenario.agentThinking.length);
            setVisibleResults(scenario.grepResults.length);
            setShowResponse(true);
            return;
        }

        // Reset state
        setPhase("thinking");
        setThinkingIndex(0);
        setVisibleResults(0);
        setShowResponse(false);

        // Animate thinking steps
        const animateThinking = (index: number) => {
            if (index >= scenario.agentThinking.length) {
                // Move to searching phase
                setPhase("searching");
                timeoutRef.current = setTimeout(() => {
                    setPhase("results");
                    animateResults(0);
                }, 800);
                return;
            }

            setThinkingIndex(index + 1);
            timeoutRef.current = setTimeout(() => animateThinking(index + 1), 600);
        };

        // Animate results appearing
        const animateResults = (index: number) => {
            if (index >= scenario.grepResults.length) {
                // Move to responding phase
                timeoutRef.current = setTimeout(() => {
                    setPhase("responding");
                    setShowResponse(true);
                }, 500);
                return;
            }

            setVisibleResults(index + 1);
            timeoutRef.current = setTimeout(() => animateResults(index + 1), 150);
        };

        timeoutRef.current = setTimeout(() => animateThinking(0), 300);
    }, [scenario]);

    // Auto-run on first load
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            runAnimation(true);
        }
    }, [runAnimation]);

    // Reset and run when scenario changes
    useEffect(() => {
        if (!isFirstLoad.current) {
            runAnimation(false);
        }
    }, [selectedScenarioIndex]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="w-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-zinc-800">
            {/* Scenario selector */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-colors"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                            <span className="text-xs text-zinc-100 truncate">{scenario.userPrompt}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden"
                            >
                                {SCENARIOS.map((s, i) => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setSelectedScenarioIndex(i);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left hover:bg-zinc-800 transition-colors ${i === selectedScenarioIndex ? "bg-zinc-800/50" : ""}`}
                                    >
                                        <span className="text-xs text-zinc-100">{s.userPrompt}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col">
                {/* Agent thinking */}
                <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">Agent Reasoning</span>
                    </div>
                    <div className="space-y-2">
                        {scenario.agentThinking.map((thought, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: i < thinkingIndex ? 1 : 0.3, x: 0 }}
                                className="flex items-start gap-2"
                            >
                                <span className="text-zinc-500 text-xs">→</span>
                                <span className={`text-xs ${i < thinkingIndex ? "text-zinc-200" : "text-zinc-500"}`}>
                                    {thought}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Grep command */}
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">Tool Call: grep</span>
                        {phase === "searching" && (
                            <motion.div
                                className="flex items-center gap-1.5 ml-auto"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                <span className="text-[10px] text-yellow-400">Searching...</span>
                            </motion.div>
                        )}
                    </div>
                    <div className="font-mono text-[11px] text-green-400 bg-zinc-950 rounded px-3 py-2 overflow-x-auto">
                        <span className="text-zinc-500">$ </span>
                        {scenario.grepCommand}
                    </div>
                </div>

                {/* Grep results */}
                <div className="border-b border-zinc-800">
                    <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/30 flex items-center gap-2">
                        <FileSearch className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[10px] font-medium text-zinc-300">Results</span>
                        <span className="text-[10px] text-zinc-500">
                            {visibleResults} / {scenario.grepResults.length} matches
                        </span>
                    </div>
                    <ScrollArea className="h-[240px]">
                        <div className="p-3 space-y-2">
                            <AnimatePresence mode="popLayout">
                                {scenario.grepResults.slice(0, visibleResults).map((result, i) => (
                                    <motion.div
                                        key={`${result.file}-${result.line}`}
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="font-mono text-[10px] bg-zinc-900/50 rounded px-2 py-1.5 border border-zinc-800"
                                    >
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <Code2 className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                            <span className="text-blue-400 truncate">{result.file}</span>
                                            <span className="text-zinc-600">:</span>
                                            <span className="text-yellow-400 flex-shrink-0">{result.line}</span>
                                        </div>
                                        <div className="text-zinc-300 truncate pl-5">
                                            {result.content}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {visibleResults === 0 && phase !== "results" && (
                                <div className="text-center py-4 text-zinc-500 text-xs">
                                    Waiting for search...
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Agent response */}
                <div className="p-4 bg-zinc-900/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">Agent Response</span>
                    </div>
                    <AnimatePresence>
                        {showResponse ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-zinc-200 leading-relaxed"
                            >
                                {scenario.agentResponse}
                            </motion.div>
                        ) : (
                            <div className="text-xs text-zinc-500 italic">
                                Analyzing results...
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span>Grep finds code by pattern matching</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Agent interprets the results</span>
                </div>
            </div>
        </div>
    );
}
