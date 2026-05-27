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
} from "@untitledui/icons";
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

/** Extract target schedule date from sheldon's response */
function extractScheduleDate(text: string): string | null {
    const m = /```schedule-flashcards([\s\S]*?)```/.exec(text);
    if (!m) return null;
    try {
        const parsed = JSON.parse(m[1].trim());
        return parsed.date || null;
    } catch {
        return null;
    }
}

/** Strip all complete AND incomplete special blocks (mermaid & schedule) from displayed text */
function stripSpecialBlocks(text: string): string {
    let result = text;
    // Strip mermaid
    result = result.replace(/```mermaid[\s\S]*?```/g, "");
    result = result.replace(/```mermaid[\s\S]*$/, "");
    // Strip schedule-flashcards
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
        } else if (msg.role === "sheldon") {
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
    const [isPageLoading, setIsPageLoading] = useState(true);

    /* ── Auth guard ── */
    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push("/login");
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setIsPageLoading(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

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
    if (isPageLoading) {
        return (
            <div className="flex h-dvh flex-col bg-primary overflow-hidden">
                {/* ═══════════════ Header ═══════════════ */}
                <header className="shrink-0 flex items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
                    <div className="flex items-center gap-2 text-quaternary">
                        <ArrowLeft className="size-4 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">
                            Workspace
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
                            {topicConfig[topicId] && (
                                <div className={`flex size-8 items-center justify-center rounded-lg ${topicConfig[topicId].gradient} text-white shadow-xs animate-pulse`}>
                                    {(() => { const TIcon = topicConfig[topicId].Icon; return <TIcon className="size-4" aria-hidden />; })()}
                                </div>
                            )}
                            <p className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">
                                {topicLabels[topicId] || topicId}
                            </p>
                        </div>
                    </div>
                </header>

                {/* ═══════════════ Slide Viewer (Skeleton) ═══════════════ */}
                <div className="flex-1 min-h-0 flex flex-col relative justify-center items-center px-16 sm:px-20 lg:px-28 py-6">
                    {/* Ambient glow */}
                    <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-secondary/40 opacity-30 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-20 -left-16 size-48 rounded-full bg-[#FEF08A]/10 opacity-30 blur-3xl" />

                    <div className="w-full max-w-3xl flex flex-col items-center animate-pulse">
                        <div className="h-4 w-28 rounded-full bg-secondary mb-3" />
                        <div className="h-8 w-1/2 rounded-lg bg-secondary mb-8" />
                        
                        {/* Shimmering Diagram block */}
                        <div className="w-full aspect-[16/9] max-h-[380px] rounded-2xl bg-brand-primary border border-brand/20 shadow-xs mb-8 flex items-center justify-center">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-brand-solid animate-pulse" />
                                <span className="text-xs font-bold text-brand-secondary">Establishing lesson...</span>
                            </div>
                        </div>

                        {/* Shimmering captions */}
                        <div className="w-full max-w-xl space-y-2.5">
                            <div className="h-4 w-full rounded-full bg-secondary/60" />
                            <div className="h-4 w-5/6 rounded-full bg-secondary/60 mx-auto" />
                        </div>
                    </div>
                </div>

                {/* ═══════════════ Input Bar (Disabled) ═══════════════ */}
                <div className="shrink-0 bg-primary px-4 sm:px-8 py-5">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 rounded-2xl border-2 border-secondary bg-primary p-2 opacity-50">
                            <input
                                disabled
                                placeholder="Connecting to Dr. Cooper..."
                                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none cursor-not-allowed"
                            />
                            <button
                                disabled
                                className="flex items-center gap-1.5 rounded-xl bg-brand-solid px-4 py-2.5 text-xs font-bold text-white shadow-xs shrink-0 cursor-not-allowed"
                            >
                                <ArrowRight className="size-4" />
                                <span>Explore</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    /* ── Derived slide data ── */
    const hasSlides = exchanges.length > 0;
    const active = hasSlides ? exchanges[currentSlide] : null;
    const diagram = active ? extractDiagram(active.answer) : null;
    const diagramPending = active ? isDiagramStreaming(active.answer) : false;
    const scheduleDate = active ? extractScheduleDate(active.answer) : null;
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
        <div className="flex h-dvh flex-col bg-primary overflow-hidden">
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
            </header>

            {/* ═══════════════ Slide Viewer ═══════════════ */}
            <div className="flex-1 min-h-0 flex flex-col relative">
                {/* Ambient glow — matches dashboard aesthetic */}
                <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-secondary/40 opacity-30 blur-3xl" />
                <div className="pointer-events-none absolute bottom-20 -left-16 size-48 rounded-full bg-[#FEF08A]/10 opacity-30 blur-3xl" />

                {/* Dot indicators */}
                {hasSlides && exchanges.length > 1 && (
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
                    {hasSlides && currentSlide > 0 && (
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
                    {hasSlides && currentSlide < exchanges.length - 1 && (
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
                                className="absolute inset-0 flex flex-col items-center justify-center px-16 sm:px-20 lg:px-28 py-6 overflow-y-auto relative z-10"
                            >
                                {/* Waiting state */}
                                {isWaiting && (
                                    <div className="flex flex-col items-center gap-4">
                                        <ThinkingDots />
                                        <span className="text-xs text-quaternary font-semibold">
                                            Constructing visual...
                                        </span>
                                    </div>
                                )}

                                {/* Concept label + display title */}
                                {!isWaiting && (
                                    <>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary mb-3 shrink-0">
                                            Concept Focus
                                        </p>
                                        <h2 className="font-display text-display-xs sm:text-display-sm font-bold text-primary tracking-tight text-center leading-tight max-w-3xl mb-6 shrink-0">
                                            {active.question}
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

                                {/* Schedule Widget: rendered */}
                                {!isWaiting && scheduleDate && (
                                    <div className="w-full max-w-md rounded-2xl bg-brand-primary border border-brand/30 p-5 shadow-xs mb-6 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-solid text-white shadow-sm">
                                            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-bold text-primary tracking-tight">Study Session Scheduled</h4>
                                            <p className="text-xs text-secondary mt-0.5 font-medium">
                                                Cooper scheduled flashcards for <strong className="text-brand-secondary">{new Date(scheduleDate + "T00:00:00").toLocaleDateString(undefined, { dateStyle: "long" })}</strong>
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center size-6 rounded-full bg-emerald-500/10 text-emerald-600">
                                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}

                                {/* Text caption */}
                                {!isWaiting && displayedText && (
                                    <div className="w-full max-w-2xl text-center shrink-0">
                                        <div className="prose max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                    p: ({ children }) => (
                                                        <p className="text-md sm:text-lg text-secondary leading-relaxed mb-3 last:mb-0">
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

            {/* ═══════════════ Input Bar ═══════════════ */}
            <div className="shrink-0 bg-primary px-4 sm:px-8 py-5">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 rounded-2xl border-2 border-secondary bg-primary p-2 shadow-xs focus-within:border-brand focus-within:shadow-md transition-all">
                        <input
                            ref={inputRef}
                            id="lesson-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`What do you want to explore in ${topicLabels[topicId]?.toLowerCase() || "STEM"}?`}
                            disabled={isStreaming || !lessonId}
                            className="flex-1 h-11 px-4 bg-transparent text-md text-primary outline-none placeholder:text-placeholder disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <button
                            type="button"
                            id="lesson-send-btn"
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isStreaming || !lessonId}
                            className="h-11 px-5 rounded-xl bg-brand-solid text-white font-bold text-sm flex items-center gap-2 hover:bg-brand-solid_hover shadow-xs active:scale-[0.97] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ArrowRight className="size-4" aria-hidden />
                            <span className="hidden sm:inline">Explore</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
