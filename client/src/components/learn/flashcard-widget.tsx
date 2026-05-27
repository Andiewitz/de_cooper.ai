"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";

interface FlashcardData {
    front: string;
    back: string;
}

interface FlashcardWidgetProps {
    cards: FlashcardData[];
}

function FlipCard({
    card,
    index,
    total,
}: {
    card: FlashcardData;
    index: number;
    total: number;
}) {
    const [flipped, setFlipped] = useState(false);

    // Reset flip state when card changes
    useEffect(() => {
        setFlipped(false);
    }, [index]);

    return (
        <div
            className="relative cursor-pointer select-none"
            style={{ perspective: "1000px" }}
            onClick={() => setFlipped((f) => !f)}
        >
            <motion.div
                className="relative w-full rounded-2xl"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
                {/* Front */}
                <div
                    className="w-full rounded-2xl border border-secondary bg-primary p-6 shadow-xs"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary mb-2">
                        Question · {index + 1}/{total}
                    </p>
                    <p className="text-sm font-semibold text-primary leading-relaxed min-h-[60px] flex items-center">
                        {card.front}
                    </p>
                    <p className="mt-3 text-[10px] text-quaternary font-medium">
                        Tap to reveal answer
                    </p>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-xs"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">
                        Answer · {index + 1}/{total}
                    </p>
                    <p className="text-sm font-semibold text-primary leading-relaxed min-h-[60px] flex items-center">
                        {card.back}
                    </p>
                    <p className="mt-3 text-[10px] text-quaternary font-medium">
                        Tap to see question
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export function FlashcardWidget({ cards }: FlashcardWidgetProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!cards || cards.length === 0) return null;

    const card = cards[currentIndex];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full max-w-md rounded-2xl border border-brand/20 bg-brand-primary p-5 shadow-xs"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-solid text-white shadow-sm">
                    <svg
                        className="size-4.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-primary tracking-tight">
                        Flashcards
                    </h4>
                    <p className="text-[10px] text-secondary mt-0.5 font-medium">
                        {cards.length} cards generated — tap to flip
                    </p>
                </div>
            </div>

            {/* Flip Card */}
            <FlipCard
                card={card}
                index={currentIndex}
                total={cards.length}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex((i) => Math.max(0, i - 1));
                    }}
                    disabled={currentIndex === 0}
                    className="flex size-8 items-center justify-center rounded-lg text-quaternary hover:bg-primary_hover hover:text-secondary transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <div className="flex items-center gap-1.5">
                    {cards.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(i);
                            }}
                            className={`rounded-full transition-all duration-200 cursor-pointer ${
                                i === currentIndex
                                    ? "w-5 h-1.5 bg-brand-solid"
                                    : "size-1.5 bg-secondary/60 hover:bg-secondary"
                            }`}
                            aria-label={`Card ${i + 1}`}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex((i) =>
                            Math.min(cards.length - 1, i + 1)
                        );
                    }}
                    disabled={currentIndex === cards.length - 1}
                    className="flex size-8 items-center justify-center rounded-lg text-quaternary hover:bg-primary_hover hover:text-secondary transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </motion.div>
    );
}
