"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, HelpCircle, Activity, BookOpen, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { lessonsApi } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { MermaidRenderer } from "@/components/learn/mermaid-renderer";

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
    general: "General STEM",
};

const emptyStatePrompts: Record<string, string> = {
    physics: "Physics Workspace",
    mathematics: "Mathematics Workspace",
    "computer-science": "Computer Science Workspace",
    chemistry: "Chemistry Workspace",
    astronomy: "Astronomy Workspace",
    general: "STEM Workspace",
};

interface LessonPageClientProps {
    topicId: string;
}

function ThinkingDots() {
    return (
        <span className="inline-flex items-center gap-1.5 py-1" aria-label="Drawing diagram">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="size-1.5 rounded-full bg-brand-secondary"
                    style={{
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                />
            ))}
        </span>
    );
}

// Extract the latest mermaid diagram code block from the entire session
const findLatestMermaid = (exchanges: Exchange[]): string | null => {
    for (let i = exchanges.length - 1; i >= 0; i--) {
        const text = exchanges[i].displayed || exchanges[i].answer;
        const match = /```mermaid([\s\S]*?)```/.exec(text);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    return null;
};

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

    // Character typewriter loop
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
        }, 8);
        return () => clearInterval(interval);
    }, []);

    // Scroll reading canvas
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [exchanges]);

    // Auto-resize textarea
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
    };

    const sendMessage = useCallback(async (customText?: string) => {
        const textToSend = customText || input.trim();
        if (!textToSend || !lessonId || !token || isStreaming) return;

        const exchangeId = crypto.randomUUID();

        setExchanges((prev) => [
            ...prev,
            { id: exchangeId, question: textToSend, answer: "", displayed: "", isStreaming: true },
        ]);
        
        if (!customText) {
            setInput("");
        }
        setIsStreaming(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            for await (const chunk of lessonsApi.streamChat(lessonId, textToSend, token)) {
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

    const isTypewriting =
        currentExchange &&
        currentExchange.displayed.length < currentExchange.answer.length;
    const isWaitingForFirstChunk =
        currentExchange?.isStreaming && currentExchange.answer.length === 0;

    const latestMermaid = findLatestMermaid(exchanges);

    return (
        <div className="flex h-dvh flex-col bg-primary overflow-hidden">
            {/* Seamless Top Workspace Header */}
            <header className="shrink-0 flex items-center justify-between px-6 py-4 sm:px-10 lg:px-12 border-b border-secondary/60">
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
                <div className="flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full bg-brand-secondary animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        {topicLabels[topicId] || topicId} Lecture Note
                    </p>
                </div>
                <div className="w-16" aria-hidden />
            </header>

            {/* Split Screen Lecture Canvas & Interactive Tools */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-secondary/60 overflow-hidden">
                
                {/* Left Side: Continuous Lecture Notes (Book layout) */}
                <main className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 bg-primary overflow-y-auto">
                    <div className="mx-auto max-w-2xl w-full px-6 py-12 sm:px-10 lg:px-8 flex-1">
                        
                        {/* Empty Initial Screen */}
                        {!hasExchanges && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-start pt-12 pb-10"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-4">
                                    de_cooper.ai / {topicLabels[topicId]}
                                </p>
                                <h1 className="font-display text-display-md font-bold text-primary leading-tight tracking-tight">
                                    {emptyStatePrompts[topicId] || "STEM Lecture Notes"}
                                </h1>
                                <p className="mt-4 text-md text-tertiary max-w-md leading-relaxed">
                                    Use the visual whiteboards and conceptual study actions on the right to formulate and construct your dynamic lesson plan.
                                </p>
                            </motion.div>
                        )}

                        {/* Beautiful Continuous Textbook Layout */}
                        {hasExchanges && (
                            <div className="space-y-12">
                                {/* Past expanded chapters */}
                                {pastExchanges.map((ex, idx) => (
                                    <article key={ex.id} className="group relative">
                                        <div className="absolute -left-4 top-1.5 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-quaternary">
                                            #{idx + 1}
                                        </div>
                                        <h3 className="text-xs font-bold text-quaternary uppercase tracking-widest mb-4 border-b border-secondary/40 pb-2">
                                            Note Focus: {ex.question}
                                        </h3>
                                        <div className="prose max-w-none text-tertiary">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                    p: ({ children }) => <p className="leading-relaxed mb-4 text-md">{children}</p>,
                                                    strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                                                    em: ({ children }) => <em className="italic text-tertiary">{children}</em>,
                                                    h2: ({ children }) => <h3 className="text-display-xs font-bold text-primary mt-6 mb-3 tracking-tight">{children}</h3>,
                                                    h3: ({ children }) => <h4 className="text-xl font-bold text-primary mt-4 mb-2 tracking-tight">{children}</h4>,
                                                    code: ({ className, children, ...props }) => {
                                                        const match = /language-(\w+)/.exec(className || "");
                                                        const isMermaid = match && match[1] === "mermaid";
                                                        if (isMermaid) {
                                                            return <MermaidRenderer chart={String(children).replace(/\n$/, "")} />;
                                                        }
                                                        return (
                                                            <code className="bg-secondary/40 px-1.5 py-0.5 rounded text-sm font-mono text-primary font-bold border border-secondary/50" {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }
                                                }}
                                            >
                                                {ex.displayed}
                                            </ReactMarkdown>
                                        </div>
                                    </article>
                                ))}

                                {/* Live current active textbook section */}
                                {currentExchange && (
                                    <motion.article
                                        key={currentExchange.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="relative"
                                    >
                                        <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-widest mb-4 border-b border-brand-secondary/30 pb-2">
                                            Currently Constructing: {currentExchange.question}
                                        </h3>

                                        <div className="prose max-w-none text-primary">
                                            {isWaitingForFirstChunk ? (
                                                <div className="py-4">
                                                    <ThinkingDots />
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                        components={{
                                                            p: ({ children }) => <p className="leading-relaxed mb-4 text-md">{children}</p>,
                                                            strong: ({ children }) => <strong className="font-extrabold text-brand-secondary tracking-tight">{children}</strong>,
                                                            em: ({ children }) => <em className="italic text-secondary font-medium">{children}</em>,
                                                            h2: ({ children }) => <h3 className="text-display-xs font-bold text-primary mt-6 mb-3 tracking-tight">{children}</h3>,
                                                            h3: ({ children }) => <h4 className="text-xl font-bold text-primary mt-4 mb-2 tracking-tight">{children}</h4>,
                                                            code: ({ className, children, ...props }) => {
                                                                const match = /language-(\w+)/.exec(className || "");
                                                                const isMermaid = match && match[1] === "mermaid";
                                                                if (isMermaid) {
                                                                    return <MermaidRenderer chart={String(children).replace(/\n$/, "")} />;
                                                                }
                                                                return (
                                                                    <code className="bg-secondary/40 px-1.5 py-0.5 rounded text-sm font-mono text-brand-secondary border border-secondary/50 font-bold" {...props}>
                                                                        {children}
                                                                    </code>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {currentExchange.displayed}
                                                    </ReactMarkdown>
                                                    {(isTypewriting || currentExchange.isStreaming) && (
                                                        <span className="ml-0.5 inline-block w-[2px] h-[0.85em] bg-brand-secondary align-middle animate-[caret-blink_1s_infinite]" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.article>
                                )}
                            </div>
                        )}

                        <div ref={bottomRef} className="h-16" />
                    </div>
                </main>

                {/* Right Side: Interactive Whiteboard, Structured Study Actions, & Expand Notes Input */}
                <aside className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 bg-[#F9F7F2] p-6 overflow-y-auto space-y-6">
                    
                    {/* Interactive Blueprint Drafting Whiteboard */}
                    <div className="flex flex-col space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-quaternary">
                            Interactive Whiteboard
                        </span>
                        <div className="relative aspect-square w-full rounded-2xl border border-secondary/80 bg-primary shadow-xs overflow-hidden bg-[linear-gradient(to_right,#F4F2EB_1px,transparent_1px),linear-gradient(to_bottom,#F4F2EB_1px,transparent_1px)] bg-[size:20px_20px] flex flex-col">
                            {latestMermaid ? (
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <div className="w-full max-h-full overflow-hidden flex items-center justify-center">
                                        <MermaidRenderer chart={latestMermaid} inline={false} />
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                    <div className="size-10 rounded-full bg-secondary/60 flex items-center justify-center mb-3">
                                        <BookOpen className="size-5 text-tertiary" />
                                    </div>
                                    <span className="text-xs font-semibold text-secondary">
                                        No diagram generated yet
                                    </span>
                                    <p className="mt-1 text-[10px] text-quaternary max-w-[200px]">
                                        Click &ldquo;Explain with diagram&rdquo; below to sketch a concept blueprint.
                                    </p>
                                </div>
                            )}
                            <div className="absolute bottom-3 left-3 bg-secondary/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-secondary/40 text-[9px] font-bold uppercase tracking-widest text-secondary z-10">
                                Vector Grid V1.0
                            </div>
                        </div>
                    </div>

                    {/* Quick Core Lecture Prompts */}
                    <div className="flex flex-col space-y-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-quaternary">
                            Whiteboard Actions
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                disabled={isStreaming || !lessonId}
                                onClick={() => sendMessage("Can you explain the current concepts with a visual mermaid diagram?")}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-secondary/80 bg-primary text-xs font-semibold text-secondary hover:text-brand-secondary hover:border-brand-secondary/60 hover:bg-secondary/10 transition duration-150 text-left disabled:opacity-40 cursor-pointer"
                            >
                                <Activity className="size-3.5 text-brand-secondary shrink-0" />
                                <span>Explain with diagram</span>
                            </button>
                            <button
                                type="button"
                                disabled={isStreaming || !lessonId}
                                onClick={() => sendMessage("Please give me a concrete, visual analogy to help understand these concepts.")}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-secondary/80 bg-primary text-xs font-semibold text-secondary hover:text-brand-secondary hover:border-brand-secondary/60 hover:bg-secondary/10 transition duration-150 text-left disabled:opacity-40 cursor-pointer"
                            >
                                <Sparkles className="size-3.5 text-brand-secondary shrink-0" />
                                <span>Give visual analogy</span>
                            </button>
                            <button
                                type="button"
                                disabled={isStreaming || !lessonId}
                                onClick={() => sendMessage("Show a highly concrete, real-world practical application of this subject.")}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-secondary/80 bg-primary text-xs font-semibold text-secondary hover:text-brand-secondary hover:border-brand-secondary/60 hover:bg-secondary/10 transition duration-150 text-left disabled:opacity-40 cursor-pointer"
                            >
                                <BookOpen className="size-3.5 text-brand-secondary shrink-0" />
                                <span>Real-world app</span>
                            </button>
                            <button
                                type="button"
                                disabled={isStreaming || !lessonId}
                                onClick={() => sendMessage("Generate a challenging conceptual quiz question to test my understanding of these notes.")}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-secondary/80 bg-primary text-xs font-semibold text-secondary hover:text-brand-secondary hover:border-brand-secondary/60 hover:bg-secondary/10 transition duration-150 text-left disabled:opacity-40 cursor-pointer"
                            >
                                <HelpCircle className="size-3.5 text-brand-secondary shrink-0" />
                                <span>Quiz me on notes</span>
                            </button>
                        </div>
                    </div>

                    {/* custom notes addition field */}
                    <div className="flex-1 flex flex-col justify-end">
                        <div className="flex flex-col space-y-2 mt-auto">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-quaternary">
                                Insert Note Section
                            </span>
                            <div className="flex items-end gap-3 border border-secondary bg-primary p-3 rounded-2xl focus-within:border-brand-secondary transition">
                                <textarea
                                    ref={textareaRef}
                                    id="lesson-input"
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Instruct to append a specific topic..."
                                    rows={1}
                                    disabled={isStreaming || !lessonId}
                                    className="flex-1 resize-none bg-transparent text-sm text-primary outline-none placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-40 leading-relaxed py-1"
                                />
                                <button
                                    type="button"
                                    id="lesson-send-btn"
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || isStreaming || !lessonId}
                                    aria-label="Insert Note"
                                    className="shrink-0 flex items-center justify-center size-8 rounded-lg bg-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white transition duration-150 disabled:bg-secondary/50 disabled:text-quaternary disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                            <p className="text-[9px] text-quaternary leading-relaxed pl-1">
                                Instruct what details, derivations, or expansions to compile directly into the study notes.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
