"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Send,
    Activity,
    Sparkles,
    BookOpen,
    HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { lessonsApi } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { MermaidRenderer } from "@/components/learn/mermaid-renderer";

/* ────────────────────────── Types ────────────────────────── */

interface Exchange {
    id: string;
    question: string;
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

/* ────────────────────────── Helpers ──────────────────────── */

/** Extract the first complete ```mermaid … ``` block from raw text */
function extractDiagram(text: string): string | null {
    const m = /```mermaid([\s\S]*?)```/.exec(text);
    return m ? m[1].trim() : null;
}

/** True when a ```mermaid block has been opened but not yet closed */
function isDiagramStreaming(text: string): boolean {
    const idx = text.lastIndexOf("```mermaid");
    if (idx === -1) return false;
    return !text.slice(idx + 10).includes("```");
}

/** Strip all complete AND incomplete mermaid fences from text */
function stripMermaid(text: string): string {
    let result = text.replace(/```mermaid[\s\S]*?```/g, "");
    // Also strip an incomplete opening block at the tail (still streaming)
    result = result.replace(/```mermaid[\s\S]*$/, "");
    return result.trim();
}

/* ────────────────────────── Sub‑components ───────────────── */

function ThinkingDots() {
    return (
        <span className="inline-flex items-center gap-2" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="size-2.5 rounded-full bg-brand-secondary"
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

    /* ── Auth guard ── */
    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push("/login");
    }, [isLoading, isAuthenticated, router]);

    /* ── Create lesson on mount ── */
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
            } catch (err) {
                console.error("Failed to create lesson:", err);
            }
        })();
    }, [token, topicId, lessonId]);

    /* ── Typewriter loop (fast: 3 chars / 6 ms) ── */
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

    /* ── Keyboard arrow navigation (when input not focused) ── */
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
        async (customText?: string) => {
            const text = customText || input.trim();
            if (!text || !lessonId || !token || isStreaming) return;

            const id = crypto.randomUUID();
            setExchanges((prev) => [
                ...prev,
                { id, question: text, answer: "", displayed: "", isStreaming: true },
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
    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-primary">
                <div className="animate-pulse text-lg text-tertiary">Loading...</div>
            </div>
        );
    }

    /* ── Derive slide data ── */
    const hasSlides = exchanges.length > 0;
    const active = hasSlides ? exchanges[currentSlide] : null;
    const diagram = active ? extractDiagram(active.answer) : null;
    const diagramPending = active ? isDiagramStreaming(active.answer) : false;
    const displayedText = active ? stripMermaid(active.displayed) : "";
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

    /* ── Quick actions ── */
    const quickActions = [
        {
            icon: Activity,
            label: "Explain with diagram",
            prompt:
                "Explain the current concepts with a clear visual diagram.",
        },
        {
            icon: Sparkles,
            label: "Visual analogy",
            prompt:
                "Give a concrete visual analogy for these concepts, with a diagram.",
        },
        {
            icon: BookOpen,
            label: "Real-world use",
            prompt:
                "Show a real-world application of this topic with a diagram.",
        },
        {
            icon: HelpCircle,
            label: "Quiz me",
            prompt:
                "Generate a quiz question about these notes with a supporting diagram.",
        },
    ];

    return (
        <div className="flex h-dvh flex-col bg-primary overflow-hidden">
            {/* ═══════════════ Header ═══════════════ */}
            <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-secondary/40">
                <button
                    type="button"
                    onClick={() => router.push("/learn")}
                    className="flex items-center gap-2 text-quaternary hover:text-secondary transition-colors cursor-pointer"
                >
                    <ArrowLeft className="size-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        Back
                    </span>
                </button>

                <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-brand-secondary animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                        {topicLabels[topicId] || topicId}
                    </span>
                </div>

                {/* Slide counter */}
                {hasSlides && (
                    <span className="text-[10px] font-mono text-quaternary tabular-nums">
                        {currentSlide + 1} / {exchanges.length}
                    </span>
                )}
                {!hasSlides && <div className="w-12" />}
            </header>

            {/* ═══════════════ Slide Viewer ═══════════════ */}
            <div className="flex-1 min-h-0 flex flex-col relative">
                {/* Dot indicators */}
                {hasSlides && exchanges.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-4 pb-2 shrink-0">
                        {exchanges.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goToSlide(i)}
                                className={`rounded-full transition-all duration-250 cursor-pointer ${
                                    i === currentSlide
                                        ? "w-6 h-2 bg-brand-secondary"
                                        : "size-2 bg-secondary/50 hover:bg-secondary"
                                }`}
                                aria-label={`Concept ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Main slide area */}
                <div className="flex-1 min-h-0 flex items-center justify-center relative overflow-hidden">
                    {/* Prev arrow */}
                    {hasSlides && currentSlide > 0 && (
                        <button
                            type="button"
                            onClick={() => goToSlide(currentSlide - 1)}
                            className="absolute left-4 z-20 size-10 rounded-full bg-secondary/50 hover:bg-secondary flex items-center justify-center text-tertiary hover:text-primary transition cursor-pointer backdrop-blur-sm"
                            aria-label="Previous concept"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                    )}

                    {/* Next arrow */}
                    {hasSlides && currentSlide < exchanges.length - 1 && (
                        <button
                            type="button"
                            onClick={() => goToSlide(currentSlide + 1)}
                            className="absolute right-4 z-20 size-10 rounded-full bg-secondary/50 hover:bg-secondary flex items-center justify-center text-tertiary hover:text-primary transition cursor-pointer backdrop-blur-sm"
                            aria-label="Next concept"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    )}

                    {/* ── Empty state ── */}
                    {!hasSlides && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center text-center px-6"
                        >
                            <div className="size-20 rounded-2xl bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/5 flex items-center justify-center mb-6 shadow-sm">
                                <Activity className="size-9 text-brand-secondary" />
                            </div>
                            <h1 className="font-display text-display-sm font-bold text-primary tracking-tight">
                                {topicLabels[topicId] || "STEM"}
                            </h1>
                            <p className="mt-3 text-sm text-tertiary max-w-sm leading-relaxed">
                                Ask a question below and watch visual concepts build in real time.
                            </p>
                        </motion.div>
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
                                className="absolute inset-0 flex flex-col items-center justify-center px-14 sm:px-20 lg:px-28 py-4 overflow-y-auto"
                            >
                                {/* Waiting state */}
                                {isWaiting && (
                                    <div className="flex flex-col items-center gap-3">
                                        <ThinkingDots />
                                        <span className="text-xs text-quaternary font-medium">
                                            Constructing visual...
                                        </span>
                                    </div>
                                )}

                                {/* Diagram: constructing placeholder */}
                                {!isWaiting && !diagram && diagramPending && (
                                    <div className="w-full max-w-2xl aspect-[16/9] rounded-2xl bg-[#F9F7F2] border border-secondary/40 flex flex-col items-center justify-center mb-6 bg-[linear-gradient(to_right,#F4F2EB_1px,transparent_1px),linear-gradient(to_bottom,#F4F2EB_1px,transparent_1px)] bg-[size:24px_24px]">
                                        <span className="size-4 rounded-full bg-brand-secondary/50 animate-ping mb-3" />
                                        <span className="text-xs font-semibold text-secondary">
                                            Constructing diagram...
                                        </span>
                                    </div>
                                )}

                                {/* Diagram: rendered */}
                                {!isWaiting && diagram && (
                                    <div className="w-full max-w-3xl rounded-2xl bg-[#F9F7F2] border border-secondary/40 p-5 mb-6 overflow-hidden bg-[linear-gradient(to_right,#F4F2EB_1px,transparent_1px),linear-gradient(to_bottom,#F4F2EB_1px,transparent_1px)] bg-[size:24px_24px] flex items-center justify-center min-h-[180px]">
                                        <MermaidRenderer
                                            chart={diagram}
                                            inline={false}
                                        />
                                    </div>
                                )}

                                {/* Text explanation (brief) */}
                                {!isWaiting && displayedText && (
                                    <div className="w-full max-w-2xl text-center">
                                        <div className="prose max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                    p: ({ children }) => (
                                                        <p className="text-base sm:text-lg text-secondary leading-relaxed mb-2 last:mb-0">
                                                            {children}
                                                        </p>
                                                    ),
                                                    strong: ({ children }) => (
                                                        <strong className="font-bold text-primary">
                                                            {children}
                                                        </strong>
                                                    ),
                                                    em: ({ children }) => (
                                                        <em className="italic text-tertiary">
                                                            {children}
                                                        </em>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <h3 className="text-lg font-bold text-primary mt-3 mb-1">
                                                            {children}
                                                        </h3>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h4 className="text-base font-bold text-primary mt-2 mb-1">
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
                                                                className="bg-secondary/40 px-1.5 py-0.5 rounded text-sm font-mono text-primary border border-secondary/50"
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
                                                <span className="ml-0.5 inline-block w-[2px] h-[0.85em] bg-brand-secondary align-middle animate-[caret-blink_1s_infinite]" />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* ═══════════════ Input Bar ═══════════════ */}
            <div className="shrink-0 border-t border-secondary/40 bg-[#F9F7F2] px-4 sm:px-8 py-4">
                <div className="max-w-2xl mx-auto space-y-3">
                    {/* Input row */}
                    <div className="flex items-center gap-3">
                        <input
                            ref={inputRef}
                            id="lesson-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Ask about ${topicLabels[topicId]?.toLowerCase() || "anything"}...`}
                            disabled={isStreaming || !lessonId}
                            className="flex-1 h-12 px-5 rounded-xl bg-white border-2 border-secondary/50 text-sm text-primary outline-none placeholder:text-placeholder focus:border-brand-secondary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] transition disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <button
                            type="button"
                            id="lesson-send-btn"
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isStreaming || !lessonId}
                            className="h-12 px-6 rounded-xl bg-brand-secondary text-white font-semibold text-sm flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                        >
                            <Send className="size-4" />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </div>

                    {/* Quick action pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                        {quickActions.map((action) => (
                            <button
                                key={action.label}
                                type="button"
                                disabled={isStreaming || !lessonId}
                                onClick={() => sendMessage(action.prompt)}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-secondary/40 bg-white text-[11px] font-medium text-tertiary hover:text-brand-secondary hover:border-brand-secondary/40 transition disabled:opacity-30 cursor-pointer"
                            >
                                <action.icon className="size-3" />
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
