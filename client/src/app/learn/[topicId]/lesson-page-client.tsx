"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Atom01,
    Calculator,
    Code01,
    Lightbulb02,
    Globe01,
    BookOpen01,
    ChevronDown,
} from "@untitledui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { lessonsApi } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { MermaidRenderer } from "@/components/learn/mermaid-renderer";
import { FlashcardWidget } from "@/components/learn/flashcard-widget";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";

/* ────────────────────────── Types ────────────────────────── */

interface Exchange {
    id: string;
    question: string;
    displayQuestion?: string;
    answer: string;
    displayed: string;
    isStreaming?: boolean;
}

interface LessonPageClientProps {
    topicId: string;
}

/* ────────────────────────── Constants ────────────────────── */

const topicLabels: Record<string, string> = {
    physics: "Physics",
    mathematics: "Mathematics",
    "computer-science": "Computer Science",
    chemistry: "Chemistry",
    astronomy: "Astronomy",
    general: "General STEM",
};

const topicConfig: Record<string, { Icon: React.ComponentType<{ className?: string }>; gradient: string }> = {
    physics: { Icon: Atom01, gradient: "bg-linear-to-tr from-purple-500 to-indigo-500" },
    mathematics: { Icon: Calculator, gradient: "bg-linear-to-tr from-blue-500 to-cyan-500" },
    "computer-science": { Icon: Code01, gradient: "bg-linear-to-tr from-emerald-500 to-teal-500" },
    chemistry: { Icon: Lightbulb02, gradient: "bg-linear-to-tr from-amber-500 to-orange-500" },
    astronomy: { Icon: Globe01, gradient: "bg-linear-to-tr from-pink-500 to-rose-500" },
    general: { Icon: BookOpen01, gradient: "bg-linear-to-tr from-slate-500 to-neutral-500" },
};

/* ────────────────────────── Helpers ──────────────────────── */

/** Extract the first complete ```mermaid … ``` block from raw answer text */
function extractDiagram(text: string): string | null {
    const m = /```mermaid([\s\S]*?)```/.exec(text);
    return m ? m[1].trim() : null;
}

/** True when a ```mermaid block has been opened but not yet closed (still streaming) */
function isDiagramStreaming(text: string): boolean {
    const idx = text.lastIndexOf("```mermaid");
    if (idx === -1) return false;
    return !text.slice(idx + 10).includes("```");
}

/** Extract flashcards JSON from a ```flashcards block */
function extractFlashcards(text: string): { front: string; back: string }[] | null {
    const m = /```flashcards\s*([\s\S]*?)\s*```/.exec(text);
    if (!m) return null;
    try {
        const parsed = JSON.parse(m[1].trim());
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].front && parsed[0].back) {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
}

/** True when a ```flashcards block has been opened but not yet closed (still streaming) */
function isFlashcardsStreaming(text: string): boolean {
    const idx = text.lastIndexOf("```flashcards");
    if (idx === -1) return false;
    return !text.slice(idx + 13).includes("```");
}

/** Strip all complete AND incomplete special blocks from displayed text */
function stripSpecialBlocks(text: string): string {
    let result = text;
    // Strip mermaid
    result = result.replace(/```mermaid[\s\S]*?```/g, "");
    result = result.replace(/```mermaid[\s\S]*$/, "");
    // Strip flashcards
    result = result.replace(/```flashcards[\s\S]*?```/g, "");
    result = result.replace(/```flashcards[\s\S]*$/, "");
    // Strip legacy schedule-flashcards (backward compat)
    result = result.replace(/```schedule-flashcards[\s\S]*?```/g, "");
    result = result.replace(/```schedule-flashcards[\s\S]*$/, "");
    return result.trim();
}

/** Group flat backend message responses into alternating Exchange items */
function groupMessagesToExchanges(messages: any[]): Exchange[] {
    const list: Exchange[] = [];
    let currentExchange: Partial<Exchange> | null = null;

    for (const msg of messages) {
        if (msg.role === "student") {
            if (currentExchange) {
                list.push({
                    id: currentExchange.id || crypto.randomUUID(),
                    question: currentExchange.question || "",
                    answer: currentExchange.answer || "",
                    displayed: currentExchange.displayed || currentExchange.answer || "",
                });
            }
            currentExchange = {
                id: msg.id,
                question: msg.content,
                answer: "",
                displayed: "",
            };
        } else if (msg.role === "sheldon" || msg.role === "assistant" || msg.role === "tutor") {
            if (currentExchange) {
                currentExchange.answer = msg.content;
                currentExchange.displayed = msg.content;
                list.push(currentExchange as Exchange);
                currentExchange = null;
            } else {
                list.push({
                    id: msg.id,
                    question: "Introduction",
                    answer: msg.content,
                    displayed: msg.content,
                });
            }
        }
    }
    if (currentExchange) {
        list.push({
            id: currentExchange.id || crypto.randomUUID(),
            question: currentExchange.question || "",
            answer: currentExchange.answer || "",
            displayed: currentExchange.displayed || "",
        });
    }
    return list;
}

/* ────────────────────────── Sub‑components ───────────────── */

function ThinkingDots() {
    return (
        <span className="inline-flex items-center gap-2" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="size-2.5 rounded-full bg-brand-solid"
                    style={{
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                />
            ))}
        </span>
    );
}



/* ────────────────────────── Main Component ───────────────── */

export default function LessonPageClient({ topicId }: LessonPageClientProps) {
    const router = useRouter();
    const { token, isLoading, isAuthenticated } = useAuth();

    const [lessonId, setLessonId] = useState<string | null>(null);
    const [exchanges, setExchanges] = useState<Exchange[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [navDirection, setNavDirection] = useState(1);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Premium input widget states
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [showModelMenu, setShowModelMenu] = useState(false);
    const [selectedModel, setSelectedModel] = useState("Llama 3.1 Flash");
    const plusMenuRef = useRef<HTMLDivElement>(null);
    const modelMenuRef = useRef<HTMLDivElement>(null);

    /* ── Auth guard ── */
    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push("/login");
    }, [isLoading, isAuthenticated, router]);

    /* ── Create or get lesson on mount ── */
    useEffect(() => {
        if (!token || lessonId) return;
        (async () => {
            try {
                const label = topicLabels[topicId] || topicId;
                const lesson = await lessonsApi.create(
                    { topic_id: topicId, title: `${label} Lesson` },
                    token
                );
                setLessonId(lesson.id);
                
                // Fetch existing conversation messages
                const messages = await lessonsApi.getMessages(lesson.id, token);
                const grouped = groupMessagesToExchanges(messages);
                setExchanges(grouped);
                if (grouped.length > 0) {
                    setCurrentSlide(grouped.length - 1);
                }
            } catch (err) {
                console.error("Failed to establish lesson or fetch history:", err);
            }
        })();
    }, [token, topicId, lessonId]);



    /* ── Click outside helper for menus ── */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
                setShowPlusMenu(false);
            }
            if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
                setShowModelMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ── Typewriter loop (3 chars / 6 ms — snappy) ── */
    useEffect(() => {
        const interval = setInterval(() => {
            setExchanges((prev) => {
                let changed = false;
                const next = prev.map((ex) => {
                    if (ex.displayed.length < ex.answer.length) {
                        changed = true;
                        const step = Math.min(3, ex.answer.length - ex.displayed.length);
                        return {
                            ...ex,
                            displayed: ex.answer.slice(0, ex.displayed.length + step),
                        };
                    }
                    return ex;
                });
                return changed ? next : prev;
            });
        }, 6);
        return () => clearInterval(interval);
    }, []);

    /* ── Auto‑advance to latest slide ── */
    useEffect(() => {
        if (exchanges.length > 0) {
            setNavDirection(1);
            setCurrentSlide(exchanges.length - 1);
        }
    }, [exchanges.length]);

    /* ── Keyboard arrow navigation ── */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (document.activeElement === inputRef.current) return;
            if (e.key === "ArrowLeft" && currentSlide > 0) {
                setNavDirection(-1);
                setCurrentSlide((s) => s - 1);
            }
            if (e.key === "ArrowRight" && currentSlide < exchanges.length - 1) {
                setNavDirection(1);
                setCurrentSlide((s) => s + 1);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [currentSlide, exchanges.length]);

    /* ── Send a message ── */
    const sendMessage = useCallback(
        async (customText?: string, displayVal?: string) => {
            const text = customText || input.trim();
            if (!text || !lessonId || !token || isStreaming) return;

            const id = crypto.randomUUID();
            setExchanges((prev) => [
                ...prev,
                { id, question: text, displayQuestion: displayVal, answer: "", displayed: "", isStreaming: true },
            ]);
            if (!customText) setInput("");
            setIsStreaming(true);

            try {
                for await (const chunk of lessonsApi.streamChat(lessonId, text, token)) {
                    setExchanges((prev) =>
                        prev.map((ex) =>
                            ex.id === id ? { ...ex, answer: ex.answer + chunk } : ex
                        )
                    );
                }
            } catch {
                setExchanges((prev) =>
                    prev.map((ex) =>
                        ex.id === id
                            ? { ...ex, answer: "Something went wrong. Please try again." }
                            : ex
                    )
                );
            } finally {
                setExchanges((prev) =>
                    prev.map((ex) => (ex.id === id ? { ...ex, isStreaming: false } : ex))
                );
                setIsStreaming(false);
            }
        },
        [input, lessonId, token, isStreaming]
    );


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const goToSlide = (idx: number) => {
        setNavDirection(idx > currentSlide ? 1 : -1);
        setCurrentSlide(idx);
    };

    /* ── Loading guard ── */
    if (isLoading) {
        return (
            <div className="flex h-dvh flex-col items-center justify-center bg-primary">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center gap-6"
                >
                    {topicConfig[topicId] && (
                        <div className={`flex size-14 items-center justify-center rounded-2xl ${topicConfig[topicId].gradient} text-white shadow-lg`}>
                            {(() => { const TIcon = topicConfig[topicId].Icon; return <TIcon className="size-6" aria-hidden />; })()}
                        </div>
                    )}
                    <LoadingIndicator type="dot-circle" size="md" />
                    <p className="text-sm font-bold text-secondary">
                        Preparing {topicLabels[topicId]?.toLowerCase() || "lesson"}…
                    </p>
                </motion.div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    /* ── Derived slide data ── */
    const hasSlides = exchanges.length > 0;
    const active = hasSlides ? exchanges[currentSlide] : null;
    const diagram = active ? extractDiagram(active.answer) : null;
    const diagramPending = active ? isDiagramStreaming(active.answer) : false;
    const flashcards = active ? extractFlashcards(active.answer) : null;
    const flashcardsPending = active ? isFlashcardsStreaming(active.answer) : false;
    const displayedText = active ? stripSpecialBlocks(active.displayed) : "";
    const isWaiting = !!(active?.isStreaming && active.answer.length === 0);
    const isTyping = active
        ? active.displayed.length < active.answer.length
        : false;

    /* ── Slide animation ── */
    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 320 : -320, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -320 : 320, opacity: 0 }),
    };

    return (
        <div className={`flex h-dvh flex-col ${flashcards ? "bg-[#efebe3]" : "bg-primary"} overflow-hidden transition-colors duration-300`}>
            {/* ═══════════════ Header ═══════════════ */}
            <header className="shrink-0 flex items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
                <button
                    type="button"
                    aria-label="Back to workspace"
                    onClick={() => router.push("/learn")}
                    className="flex items-center gap-2 text-quaternary hover:text-secondary transition-colors duration-150 cursor-pointer"
                >
                    <ArrowLeft className="size-4" aria-hidden />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        Workspace
                    </span>
                </button>

                {!flashcards && (
                    <div className="flex items-center gap-4">
                        {hasSlides && (
                            <span className="text-[10px] font-mono text-quaternary tabular-nums">
                                {currentSlide + 1} / {exchanges.length}
                            </span>
                        )}
                        <div className="flex items-center gap-2.5">
                            {topicConfig[topicId] && (
                                <div className={`flex size-8 items-center justify-center rounded-lg ${topicConfig[topicId].gradient} text-white shadow-xs`}>
                                    {(() => { const TIcon = topicConfig[topicId].Icon; return <TIcon className="size-4" aria-hidden />; })()}
                                </div>
                            )}
                            <p className="text-xs font-bold uppercase tracking-widest text-primary">
                                {topicLabels[topicId] || topicId}
                            </p>
                        </div>
                    </div>
                )}
            </header>

            {/* ═══════════════ Slide Viewer ═══════════════ */}
            <div className="flex-1 min-h-0 flex flex-col relative">
                {/* Ambient glow — matches dashboard aesthetic */}
                <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-secondary/40 opacity-30 blur-3xl" />
                <div className="pointer-events-none absolute bottom-20 -left-16 size-48 rounded-full bg-[#FEF08A]/10 opacity-30 blur-3xl" />

                {/* Dot indicators */}
                {hasSlides && exchanges.length > 1 && !flashcards && (
                    <div className="flex items-center justify-center gap-1.5 pt-4 pb-2 shrink-0 relative z-10">
                        {exchanges.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goToSlide(i)}
                                className={`rounded-full transition-all duration-200 cursor-pointer ${
                                    i === currentSlide
                                        ? "w-6 h-2 bg-brand-solid"
                                        : "size-2 bg-secondary/60 hover:bg-secondary"
                                }`}
                                aria-label={`Concept ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Main slide area */}
                <div className="flex-1 min-h-0 flex items-center justify-center relative overflow-hidden">
                    {/* Prev arrow */}
                    {hasSlides && currentSlide > 0 && !flashcards && (
                        <button
                            type="button"
                            onClick={() => goToSlide(currentSlide - 1)}
                            className="absolute left-4 z-20 size-11 rounded-full bg-primary border border-secondary/80 shadow-xs flex items-center justify-center text-tertiary hover:text-brand-secondary hover:border-brand/40 transition cursor-pointer"
                            aria-label="Previous concept"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                    )}

                    {/* Next arrow */}
                    {hasSlides && currentSlide < exchanges.length - 1 && !flashcards && (
                        <button
                            type="button"
                            onClick={() => goToSlide(currentSlide + 1)}
                            className="absolute right-4 z-20 size-11 rounded-full bg-primary border border-secondary/80 shadow-xs flex items-center justify-center text-tertiary hover:text-brand-secondary hover:border-brand/40 transition cursor-pointer"
                            aria-label="Next concept"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    )}



                    {/* ── Active slide ── */}
                    {active && (
                        <AnimatePresence mode="wait" custom={navDirection}>
                            <motion.div
                                key={active.id + currentSlide}
                                custom={navDirection}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                                className="absolute inset-0 flex flex-col items-center justify-center px-16 sm:px-20 lg:px-28 py-6 overflow-y-auto overflow-x-hidden relative z-10"
                            >
                                {/* Waiting state */}
                                {isWaiting && (
                                    <div className="flex flex-col items-center gap-4">
                                        <ThinkingDots />
                                        <span className="text-xs text-tertiary font-semibold">
                                            Constructing visual...
                                        </span>
                                    </div>
                                )}

                                {/* Concept label + display title */}
                                {!isWaiting && !flashcards && (
                                    <>
                                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-secondary mb-3 shrink-0">
                                            Concept Focus
                                        </p>
                                        <h2 className="font-display text-display-xs sm:text-display-sm font-bold text-primary tracking-tight text-center leading-tight max-w-3xl mb-6 shrink-0">
                                            {active.displayQuestion || active.question}
                                        </h2>
                                    </>
                                )}

                                {/* Diagram: constructing placeholder */}
                                {!isWaiting && !diagram && diagramPending && (
                                    <div className="w-full max-w-3xl aspect-[16/9] rounded-2xl bg-brand-primary border border-brand/20 flex flex-col items-center justify-center mb-6 shadow-xs">
                                        <div className="flex items-center gap-2.5">
                                            <span className="size-2.5 rounded-full bg-brand-solid animate-pulse" />
                                            <span className="text-xs font-bold text-brand-secondary">
                                                Constructing diagram...
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Diagram: rendered */}
                                {!isWaiting && diagram && (
                                    <div className="w-full max-w-3xl rounded-2xl bg-brand-primary border border-brand/20 p-6 shadow-xs overflow-hidden mb-6 min-h-[180px] flex items-center justify-center">
                                        <MermaidRenderer
                                            chart={diagram}
                                            inline={false}
                                        />
                                    </div>
                                )}

                                {/* Flashcard Widget: constructing placeholder */}
                                {!isWaiting && !flashcards && flashcardsPending && (
                                    <div className="w-full max-w-md aspect-[4/3] rounded-2xl bg-brand-primary border border-brand/20 flex flex-col items-center justify-center mb-6 shadow-xs">
                                        <div className="flex items-center gap-2.5">
                                            <span className="size-2.5 rounded-full bg-brand-solid animate-pulse" />
                                            <span className="text-xs font-bold text-brand-secondary">
                                                Generating flashcards...
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Flashcard Widget: rendered */}
                                {!isWaiting && flashcards && (
                                    <div className="mb-6">
                                        <FlashcardWidget
                                            cards={flashcards}
                                            onComplete={(results) => {
                                                const summary = results.map((r, i) => {
                                                    return `Card ${i + 1}: Question: "${r.q}", Answer: "${r.a}". User ${r.flipped ? "flipped the card to reveal the answer" : "did not flip the card to reveal the answer"}. Time spent: ${r.timeSpent.toFixed(1)} seconds.`;
                                                }).join("\n");

                                                const prompt = `[System Notification: The user has completed the flashcard review. Here are the detailed results of their interactions:\n${summary}\n\nPlease greet the user, congratulate them on finishing, evaluate their study performance based on these metrics, point out any concepts they might have struggled with (or got quickly), and ask how they want to proceed.]`;
                                                
                                                sendMessage(prompt, "I've completed reviewing the flashcards.");
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Text caption */}
                                {!isWaiting && displayedText && !flashcards && (
                                    <div className={`w-full max-w-2xl text-center shrink-0 ${flashcards ? "mt-2" : ""}`}>
                                        <div className="prose max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                    p: ({ children }) => (
                                                        <p className={`leading-relaxed mb-3 last:mb-0 ${flashcards ? "text-xs text-tertiary" : "text-md sm:text-lg text-primary"}`}>
                                                            {children}
                                                        </p>
                                                    ),
                                                    strong: ({ children }) => (
                                                        <strong className="font-extrabold text-brand-secondary tracking-tight">
                                                            {children}
                                                        </strong>
                                                    ),
                                                    em: ({ children }) => (
                                                        <em className="italic text-tertiary">
                                                            {children}
                                                        </em>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <h3 className="text-display-xs font-bold text-primary mt-4 mb-2 tracking-tight">
                                                            {children}
                                                        </h3>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h4 className="text-xl font-bold text-primary mt-3 mb-2 tracking-tight">
                                                            {children}
                                                        </h4>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="text-left text-sm text-secondary list-disc list-inside space-y-1 my-2">
                                                            {children}
                                                        </ul>
                                                    ),
                                                    ol: ({ children }) => (
                                                        <ol className="text-left text-sm text-secondary list-decimal list-inside space-y-1 my-2">
                                                            {children}
                                                        </ol>
                                                    ),
                                                    code: ({
                                                        className,
                                                        children,
                                                        ...props
                                                    }) => {
                                                        const match =
                                                            /language-(\w+)/.exec(
                                                                className || ""
                                                            );
                                                        if (
                                                            match &&
                                                            match[1] === "mermaid"
                                                        )
                                                            return null;
                                                        return (
                                                            <code
                                                                className="bg-brand-primary px-1.5 py-0.5 rounded text-sm font-mono text-brand-secondary border border-brand/20 font-bold"
                                                                {...props}
                                                            >
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                }}
                                            >
                                                {displayedText}
                                            </ReactMarkdown>
                                            {(isTyping || active.isStreaming) && (
                                                <span className="ml-0.5 inline-block w-[2px] h-[0.85em] bg-brand-solid align-middle animate-[caret-blink_1s_infinite]" />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* ═══════════════ Premium Prompt Input Card ═══════════════ */}
            <div className={`shrink-0 ${flashcards ? "bg-[#efebe3]" : "bg-primary"} px-4 sm:px-8 py-5 border-t border-secondary/50 transition-colors duration-300`}>
                <div className="max-w-2xl mx-auto space-y-4">
                    
                    {/* Prompt Box */}
                    <div className="relative rounded-3xl border-2 border-secondary bg-primary p-4 shadow-md focus-within:border-brand focus-within:shadow-xl transition-all duration-200">
                        
                        {/* Textarea for Multi-line / Expanding feel */}
                        <textarea
                            rows={2}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder={`How can I help you today in ${topicLabels[topicId]?.toLowerCase() || "STEM"}?`}
                            disabled={isStreaming || !lessonId}
                            className="w-full resize-none bg-transparent px-3 py-1 text-[15px] leading-relaxed text-primary outline-none placeholder:text-placeholder disabled:opacity-40 disabled:cursor-not-allowed"
                        />

                        {/* Toolbar Area */}
                        <div className="flex items-center justify-between border-t border-secondary/80 pt-3 mt-2">
                            
                            {/* Left Side Actions: Plus Popover */}
                            <div className="relative" ref={plusMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPlusMenu(!showPlusMenu);
                                    }}
                                    disabled={isStreaming || !lessonId}
                                    className="flex size-9 items-center justify-center rounded-full bg-secondary/80 text-primary hover:bg-brand-secondary hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label="Add options"
                                >
                                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>

                                {/* Gorgeous Floating Dropdown */}
                                <AnimatePresence>
                                    {showPlusMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute bottom-12 left-0 z-50 w-64 rounded-2xl border-2 border-secondary bg-primary p-2.5 shadow-xl animate-in fade-in zoom-in-95 duration-100"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPlusMenu(false);
                                                    sendMessage("Review my flashcards for this lesson");
                                                }}
                                                className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left text-xs font-bold text-primary hover:bg-primary_hover transition-colors cursor-pointer"
                                            >
                                                <div className="flex size-7 items-center justify-center rounded-lg bg-brand-solid/10 text-brand-solid">
                                                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary">Review Flashcards</p>
                                                    <p className="text-[10px] text-quaternary font-normal mt-0.5">Generate study cards from this lesson</p>
                                                </div>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Right Side Actions: Model Selection, Mic, Voice Wave, Send button */}
                            <div className="flex items-center gap-2.5">
                                
                                {/* Model selection dropdown */}
                                <div className="relative" ref={modelMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModelMenu(!showModelMenu)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/30 hover:bg-secondary/60 text-xs font-semibold text-secondary active:scale-[0.97] transition cursor-pointer"
                                    >
                                        <span>{selectedModel}</span>
                                        <ChevronDown className="size-3.5 text-tertiary" />
                                    </button>

                                    {/* Floating Model Dropdown */}
                                    <AnimatePresence>
                                        {showModelMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute bottom-10 right-0 z-50 w-52 rounded-2xl border border-secondary bg-primary p-1.5 shadow-xl"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedModel("Llama 3.1 Flash");
                                                        setShowModelMenu(false);
                                                    }}
                                                    className={`w-full text-left text-xs font-semibold rounded-xl px-3 py-2 transition ${selectedModel === "Llama 3.1 Flash" ? "bg-brand-solid/10 text-brand-secondary" : "text-primary hover:bg-primary_hover"} cursor-pointer`}
                                                >
                                                    Llama 3.1 Flash
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedModel("Llama 3.1 70B");
                                                        setShowModelMenu(false);
                                                    }}
                                                    className={`w-full text-left text-xs font-semibold rounded-xl px-3 py-2 transition ${selectedModel === "Llama 3.1 70B" ? "bg-brand-solid/10 text-brand-secondary" : "text-primary hover:bg-primary_hover"} cursor-pointer`}
                                                >
                                                    Llama 3.1 70B
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Microphone Icon */}
                                <button
                                    type="button"
                                    className="flex size-9 items-center justify-center rounded-full hover:bg-secondary/50 text-secondary hover:text-primary transition cursor-pointer"
                                    aria-label="Voice input"
                                >
                                    <svg className="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </button>

                                {/* Soundwave Icon */}
                                <button
                                    type="button"
                                    className="flex size-9 items-center justify-center rounded-full hover:bg-secondary/50 text-secondary hover:text-primary transition cursor-pointer"
                                    aria-label="Voice visualizer"
                                >
                                    <svg className="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </button>

                                {/* Send / Explore button */}
                                <button
                                    type="button"
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || isStreaming || !lessonId}
                                    className="flex size-9 items-center justify-center rounded-full bg-brand-solid text-white hover:bg-brand-solid_hover shadow-xs active:scale-[0.95] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ArrowRight className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Curated STEM Pills below the text area */}
                    {!flashcards && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5">
                            <button
                                type="button"
                                onClick={() => setInput("Explain the formulas and derivations of ")}
                                className="flex items-center gap-1.5 rounded-full border border-secondary px-4.5 py-2 text-xs font-semibold text-secondary hover:bg-primary_hover active:scale-[0.98] transition cursor-pointer"
                            >
                                <span className="text-brand-secondary">✎</span>
                                <span>Write</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setInput("Teach me the core concepts of ")}
                                className="flex items-center gap-1.5 rounded-full border border-secondary px-4.5 py-2 text-xs font-semibold text-secondary hover:bg-primary_hover active:scale-[0.98] transition cursor-pointer"
                            >
                                <span>🎓</span>
                                <span>Learn</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setInput("Provide a practical algorithm or code for ")}
                                className="flex items-center gap-1.5 rounded-full border border-secondary px-4.5 py-2 text-xs font-semibold text-secondary hover:bg-primary_hover active:scale-[0.98] transition cursor-pointer"
                            >
                                <span className="font-mono text-brand-secondary">&lt;/&gt;</span>
                                <span>Code</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setInput("Give me the fundamental equations for ")}
                                className="flex items-center gap-1.5 rounded-full border border-secondary px-4.5 py-2 text-xs font-semibold text-secondary hover:bg-primary_hover active:scale-[0.98] transition cursor-pointer"
                            >
                                <span>💡</span>
                                <span>Formulas</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => sendMessage("Surprise me with a challenging STEM problem!")}
                                className="flex items-center gap-1.5 rounded-full border border-secondary px-4.5 py-2 text-xs font-semibold text-secondary hover:bg-primary_hover active:scale-[0.98] transition cursor-pointer"
                            >
                                <span>🔮</span>
                                <span>Tutor's Choice</span>
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
