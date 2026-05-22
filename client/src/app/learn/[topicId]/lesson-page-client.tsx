"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@untitledui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { lessonsApi } from "@/lib/api";

interface Exchange {
    id: string;
    question: string;
    answer: string;
    displayed: string;
    isStreaming?: boolean;
}

const topicLabels: Record<string, string> = {
    physics: "Physics",
    mathematics: "Mathematics",
    "computer-science": "Computer Science",
    chemistry: "Chemistry",
    astronomy: "Astronomy",
    general: "Ask Anything",
};

const emptyStatePrompts: Record<string, string> = {
    physics: "What would you like to understand about physics?",
    mathematics: "What mathematical concept shall we dissect?",
    "computer-science": "What would you like to know about computer science?",
    chemistry: "What chemical mystery shall we unravel?",
    astronomy: "What cosmic question is on your mind?",
    general: "What do you want to learn today?",
};

interface LessonPageClientProps {
    topicId: string;
}

// Animated dots for loading state
function ThinkingDots() {
    return (
        <span className="inline-flex items-center gap-1.5 py-1" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="size-1.5 rounded-full bg-quaternary"
                    style={{
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                />
            ))}
        </span>
    );
}

export default function LessonPageClient({ topicId }: LessonPageClientProps) {
    const router = useRouter();
    const { token, isLoading, isAuthenticated } = useAuth();
    const [lessonId, setLessonId] = useState<string | null>(null);
    const [exchanges, setExchanges] = useState<Exchange[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auth guard
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    // Create lesson on mount
    useEffect(() => {
        if (!token || lessonId) return;
        const createLesson = async () => {
            try {
                const topicLabel = topicLabels[topicId] || topicId;
                const lesson = await lessonsApi.create(
                    { topic_id: topicId, title: `${topicLabel} Lesson` },
                    token
                );
                setLessonId(lesson.id);
            } catch (err) {
                console.error("Failed to create lesson:", err);
            }
        };
        createLesson();
    }, [token, topicId, lessonId]);

    // Typewriter: drain pending chars from answer → displayed, one char at a time
    useEffect(() => {
        const interval = setInterval(() => {
            setExchanges((prev) => {
                let changed = false;
                const next = prev.map((ex) => {
                    if (ex.displayed.length < ex.answer.length) {
                        changed = true;
                        return { ...ex, displayed: ex.answer.slice(0, ex.displayed.length + 1) };
                    }
                    return ex;
                });
                return changed ? next : prev;
            });
        }, 12); // ~83 chars/sec — fast enough to feel live
        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [exchanges]);

    // Auto-resize textarea
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 160) + "px";
        }
    };

    const sendMessage = useCallback(async () => {
        if (!input.trim() || !lessonId || !token || isStreaming) return;

        const question = input.trim();
        const exchangeId = crypto.randomUUID();

        setExchanges((prev) => [
            ...prev,
            { id: exchangeId, question, answer: "", displayed: "", isStreaming: true },
        ]);
        setInput("");
        setIsStreaming(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            for await (const chunk of lessonsApi.streamChat(lessonId, question, token)) {
                setExchanges((prev) =>
                    prev.map((ex) =>
                        ex.id === exchangeId
                            ? { ...ex, answer: ex.answer + chunk }
                            : ex
                    )
                );
            }
        } catch {
            setExchanges((prev) =>
                prev.map((ex) =>
                    ex.id === exchangeId
                        ? {
                              ...ex,
                              answer: "Something went wrong. Please try again.",
                          }
                        : ex
                )
            );
        } finally {
            setExchanges((prev) =>
                prev.map((ex) =>
                    ex.id === exchangeId ? { ...ex, isStreaming: false } : ex
                )
            );
            setIsStreaming(false);
        }
    }, [input, lessonId, token, isStreaming]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-primary">
                <div className="animate-pulse text-lg text-tertiary">Loading...</div>
            </div>
        );
    }

    const currentExchange = exchanges[exchanges.length - 1];
    const pastExchanges = exchanges.slice(0, -1);
    const hasExchanges = exchanges.length > 0;

    // Whether the current exchange is still mid-typewriter (displayed hasn't caught up to answer)
    const isTypewriting =
        currentExchange &&
        currentExchange.displayed.length < currentExchange.answer.length;
    const isWaitingForFirstChunk =
        currentExchange?.isStreaming && currentExchange.answer.length === 0;

    return (
        <div className="flex h-dvh flex-col bg-primary">
            {/* Minimal header */}
            <header className="shrink-0 flex items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
                <button
                    type="button"
                    aria-label="Back to workspace"
                    onClick={() => router.push("/learn")}
                    className="flex items-center gap-2 text-quaternary hover:text-secondary transition-colors duration-150 cursor-pointer"
                >
                    <ArrowLeft className="size-4" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-widest">
                        Back
                    </span>
                </button>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-secondary">
                    {topicLabels[topicId] || topicId}
                </p>
                <div className="w-14" aria-hidden />
            </header>

            {/* Content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl px-6 py-6 sm:px-10 lg:px-0">

                    {/* Empty state */}
                    {!hasExchanges && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-start pt-16 pb-10"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-quaternary mb-6">
                                de_cooper.ai — {topicLabels[topicId]}
                            </p>
                            <h2 className="font-display text-display-sm font-bold text-primary leading-tight sm:text-display-md">
                                {emptyStatePrompts[topicId] || "What would you like to learn?"}
                            </h2>
                            <p className="mt-5 text-sm text-quaternary max-w-sm leading-relaxed">
                                Type below. Clear answers, no hand-holding.
                            </p>
                        </motion.div>
                    )}

                    {/* Past exchanges — compact */}
                    {pastExchanges.length > 0 && (
                        <div className="space-y-10 pb-10">
                            {pastExchanges.map((ex) => (
                                <div key={ex.id} className="border-t border-secondary/60 pt-8">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-quaternary mb-3">
                                        You asked
                                    </p>
                                    <p className="text-sm font-medium text-secondary mb-6 leading-relaxed">
                                        {ex.question}
                                    </p>
                                    <p className="text-md text-tertiary leading-relaxed whitespace-pre-wrap">
                                        {ex.displayed}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Current exchange — editorial big response */}
                    <AnimatePresence>
                        {currentExchange && (
                            <motion.div
                                key={currentExchange.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className={pastExchanges.length > 0 ? "border-t border-secondary/60 pt-8" : "pt-4"}
                            >
                                <p className="text-[10px] font-bold uppercase tracking-widest text-quaternary mb-3">
                                    You asked
                                </p>
                                <p className="text-sm font-semibold text-secondary mb-8 leading-relaxed">
                                    {currentExchange.question}
                                </p>

                                {/* Big answer */}
                                <div className="font-display text-display-xs font-semibold text-primary leading-snug sm:text-display-sm whitespace-pre-wrap">
                                    {isWaitingForFirstChunk ? (
                                        <ThinkingDots />
                                    ) : (
                                        <>
                                            {currentExchange.displayed}
                                            {(isTypewriting || currentExchange.isStreaming) && (
                                                <span className="ml-0.5 inline-block w-[2px] h-[0.85em] bg-brand-secondary align-middle animate-[caret-blink_1s_infinite]" />
                                            )}
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={bottomRef} className="h-10" />
                </div>
            </div>

            {/* Input — flat, minimal */}
            <div className="shrink-0 border-t border-secondary/60 bg-primary">
                <div className="mx-auto max-w-3xl px-6 py-5 sm:px-10 lg:px-0">
                    <div className="flex items-end gap-4">
                        <textarea
                            ref={textareaRef}
                            id="lesson-input"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                hasExchanges
                                    ? "Ask a follow-up..."
                                    : "Type your question here..."
                            }
                            rows={1}
                            disabled={isStreaming || !lessonId}
                            className="flex-1 resize-none bg-transparent text-md text-primary outline-none placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-40 leading-relaxed py-1"
                        />
                        <button
                            type="button"
                            id="lesson-send-btn"
                            onClick={sendMessage}
                            disabled={!input.trim() || isStreaming || !lessonId}
                            aria-label="Send question"
                            className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-secondary hover:text-brand-solid transition-colors duration-150 disabled:text-quaternary disabled:cursor-not-allowed pb-1"
                        >
                            {isStreaming ? "···" : "Ask →"}
                        </button>
                    </div>
                    <p className="mt-1.5 text-[10px] text-quaternary">
                        Enter to send · Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}
