"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/providers/auth-provider";
import { lessonsApi, type MessageResponse } from "@/lib/api";

interface ChatMessage {
    id: string;
    role: "student" | "sheldon";
    content: string;
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

interface LessonPageClientProps {
    topicId: string;
}

export default function LessonPageClient({ topicId }: LessonPageClientProps) {
    const router = useRouter();
    const { token, isLoading, isAuthenticated } = useAuth();
    const [lessonId, setLessonId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
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

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-resize textarea
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
        }
    };

    const sendMessage = useCallback(async () => {
        if (!input.trim() || !lessonId || !token || isStreaming) return;

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "student",
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsStreaming(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        // Add placeholder for Sheldon's response
        const sheldonId = crypto.randomUUID();
        setMessages((prev) => [
            ...prev,
            { id: sheldonId, role: "sheldon", content: "", isStreaming: true },
        ]);

        try {
            for await (const chunk of lessonsApi.streamChat(lessonId, userMessage.content, token)) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === sheldonId
                            ? { ...msg, content: msg.content + chunk }
                            : msg
                    )
                );
            }
        } catch (err) {
            console.error("Chat error:", err);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === sheldonId
                        ? {
                              ...msg,
                              content: "*sighs* Something went wrong with my neural pathways. Even my failures are more sophisticated than your successes. Try again.",
                          }
                        : msg
                )
            );
        } finally {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === sheldonId ? { ...msg, isStreaming: false } : msg
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

    return (
        <div className="flex h-dvh flex-col bg-primary">
            {/* Header */}
            <header className="shrink-0 border-b border-secondary px-4 py-3">
                <div className="mx-auto flex max-w-4xl items-center gap-3">
                    <Button
                        color="tertiary"
                        size="sm"
                        iconLeading={ArrowLeft}
                        onClick={() => router.push("/learn")}
                    />
                    <div>
                        <h1 className="font-display text-md font-semibold text-primary">
                            {topicLabels[topicId] || topicId}
                        </h1>
                        <p className="text-xs text-tertiary">with Dr. Sheldon Cooper</p>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-4xl px-4 py-6">
                    {messages.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="font-display text-display-xs font-semibold text-primary">
                                Ask Dr. Cooper anything about {topicLabels[topicId]?.toLowerCase() || "anything"}
                            </p>
                            <p className="mt-2 text-sm text-tertiary">
                                He&apos;ll explain it brilliantly. And make you feel bad about yourself. It&apos;s his gift.
                            </p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "sheldon" ? (
                                    <div className="max-w-[80%] border-l-2 border-brand-secondary/60 pl-4 py-0.5">
                                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-brand-secondary">
                                            Dr. Cooper
                                        </span>
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-primary">
                                            {msg.content}
                                            {msg.isStreaming && (
                                                <span className="ml-1 inline-block size-2 animate-pulse rounded-full bg-brand-secondary" />
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-brand-solid text-white">
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {msg.content}
                                            {msg.isStreaming && (
                                                <span className="ml-1 inline-block size-2 animate-pulse rounded-full bg-current" />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-secondary px-4 py-4">
                <div className="mx-auto flex max-w-4xl items-end gap-3">
                    <div className="flex min-h-[44px] flex-1 items-end rounded-xl border border-secondary bg-primary px-4 py-3 shadow-xs transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Dr. Cooper a question..."
                            rows={1}
                            disabled={isStreaming || !lessonId}
                            className="w-full resize-none bg-transparent text-sm text-primary outline-none placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Button
                        color="primary"
                        size="md"
                        iconLeading={Send01}
                        onClick={sendMessage}
                        isDisabled={!input.trim() || isStreaming || !lessonId}
                        isLoading={isStreaming}
                    />
                </div>
            </div>
        </div>
    );
}
