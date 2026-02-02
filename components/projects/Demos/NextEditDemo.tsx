"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * NextEditDemo - Shows typing, pausing, ghost prediction, then Tab to accept.
 * User actually types characters before predictions appear.
 */

type TokenType = "keyword" | "function" | "string" | "type" | "operator" | "punctuation" | "variable" | "comment" | "number" | "text" | "decorator";

interface Token {
    text: string;
    type: TokenType;
}

function tokenizePython(code: string): Token[] {
    const tokens: Token[] = [];
    const keywords = ["def", "return", "class", "import", "from", "for", "in", "if", "else", "elif", "while", "try", "except", "with", "as", "lambda", "and", "or", "not", "True", "False", "None", "async", "await", "raise", "finally", "pass", "break", "continue", "yield"];
    const builtins = ["sum", "float", "str", "int", "list", "dict", "print", "len", "range", "open", "map", "filter", "sorted", "max", "min", "abs", "round", "isinstance", "Exception", "ValueError", "TypeError", "KeyError"];

    let remaining = code;

    while (remaining.length > 0) {
        // Decorators
        if (remaining.startsWith("@")) {
            const match = remaining.match(/^@[a-zA-Z_][a-zA-Z0-9_]*/);
            if (match) {
                tokens.push({ text: match[0], type: "decorator" });
                remaining = remaining.slice(match[0].length);
                continue;
            }
        }

        // Numbers
        const numMatch = remaining.match(/^\d+\.?\d*/);
        if (numMatch) {
            tokens.push({ text: numMatch[0], type: "number" });
            remaining = remaining.slice(numMatch[0].length);
            continue;
        }

        // String literals (including f-strings)
        const stringMatch = remaining.match(/^(f?"""[\s\S]*?"""|f?'''[\s\S]*?'''|f?"[^"]*"|f?'[^']*')/);
        if (stringMatch) {
            tokens.push({ text: stringMatch[0], type: "string" });
            remaining = remaining.slice(stringMatch[0].length);
            continue;
        }

        // Comments
        if (remaining.startsWith("#")) {
            const endOfLine = remaining.indexOf("\n");
            const comment = endOfLine === -1 ? remaining : remaining.slice(0, endOfLine);
            tokens.push({ text: comment, type: "comment" });
            remaining = remaining.slice(comment.length);
            continue;
        }

        // Keywords and identifiers
        const wordMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
        if (wordMatch) {
            const word = wordMatch[0];
            if (keywords.includes(word)) {
                tokens.push({ text: word, type: "keyword" });
            } else if (builtins.includes(word)) {
                tokens.push({ text: word, type: "function" });
            } else if (remaining.slice(word.length).match(/^\s*\(/)) {
                tokens.push({ text: word, type: "function" });
            } else if (word === "self" || word === "cls") {
                tokens.push({ text: word, type: "keyword" });
            } else {
                tokens.push({ text: word, type: "variable" });
            }
            remaining = remaining.slice(word.length);
            continue;
        }

        // Operators
        const opMatch = remaining.match(/^(==|!=|<=|>=|->|\+=|-=|\*=|\/=|\*\*|\/\/|[+\-*/%=<>|&^~])/);
        if (opMatch) {
            tokens.push({ text: opMatch[0], type: "operator" });
            remaining = remaining.slice(opMatch[0].length);
            continue;
        }

        // Punctuation
        const punctMatch = remaining.match(/^[()[\]{},.:]/);
        if (punctMatch) {
            tokens.push({ text: punctMatch[0], type: "punctuation" });
            remaining = remaining.slice(1);
            continue;
        }

        // Everything else (whitespace, etc)
        tokens.push({ text: remaining[0], type: "text" });
        remaining = remaining.slice(1);
    }

    return tokens;
}

const TOKEN_COLORS: Record<TokenType, string> = {
    keyword: "text-purple-400",
    function: "text-blue-400",
    string: "text-amber-300",
    type: "text-cyan-400",
    operator: "text-pink-400",
    punctuation: "text-zinc-400",
    variable: "text-zinc-200",
    comment: "text-zinc-500",
    number: "text-orange-400",
    text: "text-zinc-300",
    decorator: "text-yellow-400",
};

function HighlightedCode({ code }: { code: string }) {
    const tokens = useMemo(() => tokenizePython(code), [code]);
    return (
        <>
            {tokens.map((token, i) => (
                <span key={i} className={TOKEN_COLORS[token.type]}>
                    {token.text}
                </span>
            ))}
        </>
    );
}

function GhostPrediction({ text, showTab }: { text: string; showTab: boolean }) {
    const tokens = useMemo(() => tokenizePython(text), [text]);
    if (!text) return null;

    return (
        <span className="relative inline">
            <AnimatePresence>
                {showTab && (
                    <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        className="absolute -top-8 -left-1 flex items-center px-1.5 py-0.5 bg-zinc-800 border border-zinc-600 rounded text-[9px] font-sans whitespace-nowrap z-50 shadow-lg"
                    >
                        <kbd className="px-1 py-px bg-zinc-700 rounded text-[8px] font-medium font-mono text-zinc-300 border border-zinc-500">Tab</kbd>
                    </motion.span>
                )}
            </AnimatePresence>
            <span className="opacity-40">
                {tokens.map((token, i) => (
                    <span key={i} className={TOKEN_COLORS[token.type]}>
                        {token.text}
                    </span>
                ))}
            </span>
        </span>
    );
}

function Cursor() {
    return (
        <motion.span
            className="inline-block w-[2px] h-[1em] bg-zinc-100 ml-px align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
    );
}

// The complete final code we're building towards
const FINAL_CODE = `class UserService:
    def __init__(self, db_client):
        self.db = db_client
        self.cache = {}

    async def get_user(self, user_id: str) -> dict:
        if user_id in self.cache:
            return self.cache[user_id]
        
        user = await self.db.users.find_one({"_id": user_id})
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        self.cache[user_id] = user
        return user`;

interface TypewriterState {
    displayedLines: string[];  // What's currently shown
    cursorLine: number;        // Which line has the cursor
    cursorPos: number;         // Position in that line
    ghost: string;             // Ghost prediction text
    phase: "typing" | "waiting" | "accepting";
}

// Sequence of actions: type characters, wait, show ghost, accept
interface Action {
    type: "type" | "newline" | "wait" | "ghost" | "accept" | "pause";
    chars?: string;      // For type action
    ghost?: string;      // For ghost action
    duration?: number;   // For wait/pause
}

// Build the action sequence
const ACTIONS: Action[] = [
    // Line 1: class UserService:
    { type: "type", chars: "class User" },
    { type: "wait", duration: 400 },
    { type: "ghost", ghost: "Service:" },
    { type: "wait", duration: 1200 },
    { type: "accept" },
    { type: "newline" },

    // Line 2: def __init__(self, db_client):
    { type: "type", chars: "    def __i" },
    { type: "wait", duration: 350 },
    { type: "ghost", ghost: "nit__(self, db_client):" },
    { type: "wait", duration: 1100 },
    { type: "accept" },
    { type: "newline" },

    // Line 3: self.db = db_client
    { type: "type", chars: "        self.db" },
    { type: "wait", duration: 300 },
    { type: "ghost", ghost: " = db_client" },
    { type: "wait", duration: 1000 },
    { type: "accept" },
    { type: "newline" },

    // Line 4: self.cache = {}
    { type: "type", chars: "        self.ca" },
    { type: "wait", duration: 350 },
    { type: "ghost", ghost: "che = {}" },
    { type: "wait", duration: 1100 },
    { type: "accept" },
    { type: "newline" },

    // Blank line
    { type: "newline" },

    // Line 6: async def get_user(self, user_id: str) -> dict:
    { type: "type", chars: "    async def get" },
    { type: "wait", duration: 400 },
    { type: "ghost", ghost: "_user(self, user_id: str) -> dict:" },
    { type: "wait", duration: 1300 },
    { type: "accept" },
    { type: "newline" },

    // Line 7: if user_id in self.cache:
    { type: "type", chars: "        if user_id in" },
    { type: "wait", duration: 350 },
    { type: "ghost", ghost: " self.cache:" },
    { type: "wait", duration: 1000 },
    { type: "accept" },
    { type: "newline" },

    // Line 8: return self.cache[user_id]
    { type: "type", chars: "            return self" },
    { type: "wait", duration: 300 },
    { type: "ghost", ghost: ".cache[user_id]" },
    { type: "wait", duration: 1100 },
    { type: "accept" },

    // Final pause before loop
    { type: "pause", duration: 2000 },
];

export function NextEditDemo() {
    const [lines, setLines] = useState<string[]>([""]);
    const [cursorLine, setCursorLine] = useState(0);
    const [ghost, setGhost] = useState("");
    const [showTab, setShowTab] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);

    // Use refs to track mutable state that needs to be current in callbacks
    const actionIndexRef = useRef(0);
    const charIndexRef = useRef(0);
    const cursorLineRef = useRef(0);
    const ghostRef = useRef("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Keep refs in sync with state
    useEffect(() => {
        cursorLineRef.current = cursorLine;
    }, [cursorLine]);

    useEffect(() => {
        ghostRef.current = ghost;
    }, [ghost]);

    useEffect(() => {
        const runNext = () => {
            const actionIdx = actionIndexRef.current;
            if (actionIdx >= ACTIONS.length) {
                // Reset and loop
                actionIndexRef.current = 0;
                charIndexRef.current = 0;
                cursorLineRef.current = 0;
                ghostRef.current = "";
                setLines([""]);
                setCursorLine(0);
                setGhost("");
                setShowTab(false);
                setIsAccepting(false);
                timeoutRef.current = setTimeout(runNext, 1000);
                return;
            }

            const action = ACTIONS[actionIdx];
            const currentCursorLine = cursorLineRef.current;

            switch (action.type) {
                case "type": {
                    const chars = action.chars || "";
                    const charIdx = charIndexRef.current;

                    if (charIdx < chars.length) {
                        // Type next character
                        setLines(prev => {
                            const newLines = [...prev];
                            newLines[currentCursorLine] = (newLines[currentCursorLine] || "") + chars[charIdx];
                            return newLines;
                        });
                        charIndexRef.current++;
                        timeoutRef.current = setTimeout(runNext, 35 + Math.random() * 25);
                    } else {
                        // Done typing this action
                        charIndexRef.current = 0;
                        actionIndexRef.current++;
                        timeoutRef.current = setTimeout(runNext, 50);
                    }
                    break;
                }

                case "newline": {
                    const newCursorLine = currentCursorLine + 1;
                    cursorLineRef.current = newCursorLine;
                    setLines(prev => [...prev, ""]);
                    setCursorLine(newCursorLine);
                    actionIndexRef.current++;
                    timeoutRef.current = setTimeout(runNext, 80);
                    break;
                }

                case "wait": {
                    actionIndexRef.current++;
                    timeoutRef.current = setTimeout(runNext, action.duration || 500);
                    break;
                }

                case "ghost": {
                    const ghostText = action.ghost || "";
                    ghostRef.current = ghostText;
                    setGhost(ghostText);
                    setShowTab(true);
                    actionIndexRef.current++;
                    timeoutRef.current = setTimeout(runNext, 50);
                    break;
                }

                case "accept": {
                    const currentGhost = ghostRef.current;
                    setIsAccepting(true);
                    // Add ghost to current line
                    setLines(prev => {
                        const newLines = [...prev];
                        newLines[currentCursorLine] = (newLines[currentCursorLine] || "") + currentGhost;
                        return newLines;
                    });
                    ghostRef.current = "";
                    setGhost("");
                    setShowTab(false);

                    setTimeout(() => setIsAccepting(false), 200);
                    actionIndexRef.current++;
                    timeoutRef.current = setTimeout(runNext, 250);
                    break;
                }

                case "pause": {
                    actionIndexRef.current++;
                    timeoutRef.current = setTimeout(runNext, action.duration || 1000);
                    break;
                }
            }
        };

        // Start the animation
        timeoutRef.current = setTimeout(runNext, 500);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="w-full bg-[#0d0d0d] rounded-xl overflow-hidden border border-zinc-800">
            {/* Editor header */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-zinc-800 bg-[#161616]">
                <div className="flex gap-1.5">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-400 ml-3 px-2 py-0.5 bg-zinc-800 rounded">
                    user_service.py
                </span>
                <div className="ml-auto">
                    <motion.div
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20"
                        animate={{
                            borderColor: showTab
                                ? ["rgba(139, 92, 246, 0.3)", "rgba(139, 92, 246, 0.6)", "rgba(139, 92, 246, 0.3)"]
                                : "rgba(139, 92, 246, 0.2)"
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-violet-400"
                            animate={{
                                scale: showTab ? [1, 1.3, 1] : 1,
                                opacity: showTab ? 1 : 0.5
                            }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                        />
                        <span className="text-[9px] sm:text-[10px] text-violet-300/90 font-medium">
                            Next Edit
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* Code area */}
            <div className="font-mono text-[10px] sm:text-[11px] md:text-[12px] leading-5 sm:leading-6 p-3 sm:p-4 pt-6 sm:pt-8 min-h-[220px] sm:min-h-[260px] overflow-x-auto overflow-y-visible">
                {lines.map((line, i) => {
                    const isCursorLine = i === cursorLine;
                    const isAcceptingLine = isCursorLine && isAccepting;

                    return (
                        <div key={i} className="flex min-h-[1.4em] sm:min-h-[1.5em]">
                            <span className="w-5 sm:w-6 text-right pr-2 sm:pr-3 text-zinc-600 select-none flex-shrink-0 text-[9px] sm:text-[10px]">
                                {i + 1}
                            </span>
                            <div className="flex-1 whitespace-pre">
                                <motion.span
                                    animate={{
                                        backgroundColor: isAcceptingLine ? "rgba(139, 92, 246, 0.15)" : "transparent"
                                    }}
                                    transition={{ duration: 0.15 }}
                                    className="rounded px-0.5"
                                >
                                    <HighlightedCode code={line} />
                                    {isCursorLine && ghost && (
                                        <GhostPrediction text={ghost} showTab={showTab} />
                                    )}
                                </motion.span>
                                {isCursorLine && !isAccepting && <Cursor />}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Status bar */}
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-t border-zinc-800 bg-[#161616] flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] text-zinc-500">
                    {showTab ? (
                        <motion.span
                            className="text-violet-400"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                        >
                            ● Suggestion available
                        </motion.span>
                    ) : isAccepting ? (
                        <span className="text-green-400">✓ Accepted</span>
                    ) : (
                        <span>Ln {cursorLine + 1}, Col {(lines[cursorLine]?.length || 0) + 1}</span>
                    )}
                </span>
                <div className="flex items-center gap-2 text-[9px] text-zinc-600">
                    <span>Python</span>
                    <span>•</span>
                    <span>UTF-8</span>
                </div>
            </div>
        </div>
    );
}
