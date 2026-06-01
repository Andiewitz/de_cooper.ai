"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, HelpCircle, RefreshCcw01, Check } from "@untitledui/icons";

interface FlashcardData {
    front: string;
    back: string;
}

interface FlashcardWidgetProps {
    cards: FlashcardData[];
}

const DEFAULT_CARDS = [
    { id: 1, q: "What is the powerhouse of the cell?", a: "The mitochondria — produces ATP through cellular respiration." },
    { id: 2, q: "What year did World War II end?", a: "1945 — Germany surrendered May 8, Japan on September 2." },
    { id: 3, q: "Newton's Second Law?", a: "F = ma — Force equals mass times acceleration." },
    { id: 4, q: "Capital of Australia?", a: "Canberra — not Sydney or Melbourne, despite common belief." },
    { id: 5, q: "What does DNA stand for?", a: "Deoxyribonucleic Acid — carries genetic information." },
];

// Stack depth layers — top card is layer 0
const DEPTH = [
    { scale: 1,     dy: 0,  rot: 0,    z: 10 },
    { scale: 0.96,  dy: 12, rot: -2.1, z: 9 },
    { scale: 0.92,  dy: 22, rot: 2.6,  z: 8 },
    { scale: 0.88,  dy: 30, rot: -1.3, z: 7 },
];

const W = 400;
const H = 260;
const THROW_PX = 88;
const THROW_VEL = 0.32;

export function FlashcardWidget({ cards }: FlashcardWidgetProps) {
    const [deck, setDeck] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [drag, setDrag] = useState({ on: false, x: 0, y: 0, ox: 0, oy: 0 });
    const [exit, setExit] = useState<any>(null);
    const [completed, setCompleted] = useState(false);

    const topRef = useRef<HTMLDivElement>(null);
    const velBuf = useRef<any[]>([]);

    // Sync incoming cards
    useEffect(() => {
        if (cards && cards.length > 0) {
            setDeck(cards.map((c, i) => ({ id: i + 1, q: c.front, a: c.back })));
        } else {
            setDeck(DEFAULT_CARDS);
        }
        setCurrentIndex(0);
        setFlipped(false);
        setCompleted(false);
    }, [cards]);

    const totalCards = deck.length;
    const remaining = deck.slice(currentIndex);

    const advanceCard = useCallback(() => {
        const nextIdx = currentIndex + 1;
        if (nextIdx >= totalCards) {
            setCompleted(true);
        }
        setCurrentIndex(nextIdx);
        setFlipped(false);
    }, [currentIndex, totalCards]);

    const goBack = useCallback(() => {
        if (currentIndex <= 0) return;
        setCurrentIndex(prev => prev - 1);
        setFlipped(false);
        setCompleted(false);
    }, [currentIndex]);

    const restart = useCallback(() => {
        setCurrentIndex(0);
        setFlipped(false);
        setCompleted(false);
    }, []);

    const doThrow = useCallback((vx: number, vy: number, dir: "left" | "right") => {
        if (exit || remaining.length === 0) return;
        const speed = Math.max(Math.abs(vx) * 280, 460);
        const ex = dir === "left" ? -speed : speed;
        const ey = vy * 60 - 55;
        const er = dir === "left"
            ? -(14 + Math.random() * 14)
            : (14 + Math.random() * 14);
        
        setExit({ x: ex, y: ey, rot: er });
        setFlipped(false);
        setTimeout(() => {
            advanceCard();
            setExit(null);
        }, 420);
    }, [exit, remaining.length, advanceCard]);

    const onPD = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (exit) return;
        topRef.current?.setPointerCapture(e.pointerId);
        velBuf.current = [{ x: e.clientX, y: e.clientY, t: Date.now() }];
        setDrag({ on: true, x: 0, y: 0, ox: e.clientX, oy: e.clientY });
    }, [exit]);

    const onPM = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!drag.on) return;
        velBuf.current.push({ x: e.clientX, y: e.clientY, t: Date.now() });
        if (velBuf.current.length > 7) velBuf.current.shift();
        setDrag(d => ({ ...d, x: e.clientX - d.ox, y: e.clientY - d.oy }));
    }, [drag.on]);

    const onPU = useCallback(() => {
        if (!drag.on) return;
        const dx = drag.x;
        const buf = velBuf.current;
        let vx = 0, vy = 0;
        if (buf.length >= 2) {
            const s = buf.slice(-5);
            const dt = Math.max(s[s.length - 1].t - s[0].t, 1);
            vx = (s[s.length - 1].x - s[0].x) / dt;
            vy = (s[s.length - 1].y - s[0].y) / dt;
        }
        setDrag({ on: false, x: 0, y: 0, ox: 0, oy: 0 });
        if (Math.abs(dx) > THROW_PX || Math.abs(vx) > THROW_VEL) {
            doThrow(vx, vy, dx < 0 || vx < -THROW_VEL ? "left" : "right");
        }
    }, [drag, doThrow]);

    // Keyboard controls — only arrow keys advance/go back, space flips
    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") doThrow(0, 0, "left");
            else if (e.key === "ArrowLeft") goBack();
            else if (e.key === " ") {
                e.preventDefault();
                if (!exit && !drag.on && !completed) setFlipped(f => !f);
            }
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [doThrow, goBack, exit, drag.on, completed]);

    if (deck.length === 0) return null;

    // Completed state
    if (completed) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="w-full max-w-lg select-none"
            >
                <div className="rounded-2xl border border-brand/20 bg-brand-primary p-8 flex flex-col items-center gap-5">
                    <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Check className="size-7 text-emerald-500" />
                    </div>
                    <div className="text-center">
                        <h4 className="text-lg font-bold text-primary mb-1">
                            Deck Complete!
                        </h4>
                        <p className="text-sm text-secondary">
                            You reviewed all {totalCards} cards
                        </p>
                    </div>
                    {/* Progress bar — full */}
                    <div className="w-full max-w-xs h-1.5 rounded-full bg-secondary/30 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: "100%" }} />
                    </div>
                    <button
                        type="button"
                        onClick={restart}
                        className="flex items-center gap-2 rounded-xl border border-secondary bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-secondary hover:bg-secondary/40 transition duration-150 cursor-pointer"
                    >
                        <RefreshCcw01 className="size-3.5" />
                        Review Again
                    </button>
                </div>
            </motion.div>
        );
    }

    const dragRot = drag.on ? drag.x * 0.07 : 0;
    const dragLift = drag.on ? Math.min(Math.abs(drag.x) * 0.065, 14) : 0;
    const sp = drag.on ? Math.min(1, Math.abs(drag.x) / THROW_PX) : 0;
    const sd = drag.on ? (drag.x > 22 ? "r" : drag.x < -22 ? "l" : null) : null;

    // As you drag the top card away, the stack underneath rises toward you
    const stackRise = sp;
    const visible = remaining.slice(0, 4);

    // Progress
    const progressPct = totalCards > 0 ? ((currentIndex) / totalCards) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="w-full max-w-lg select-none overflow-visible relative"
        >
            {/* Stack Area */}
            <div className="relative mx-auto" style={{ width: W, height: H + 34 }}>
                {/* Render back-to-front so top card is last in DOM */}
                {[...visible].reverse().map((card, ri) => {
                    const idx = visible.length - 1 - ri;
                    const isTop = idx === 0;
                    const d = DEPTH[idx] ?? DEPTH[DEPTH.length - 1];

                    // Interpolate stack card toward top position as drag increases
                    let scale = d.scale;
                    let dy = d.dy;
                    let rot = d.rot;

                    if (!isTop && stackRise > 0) {
                        const nd = DEPTH[idx - 1] ?? DEPTH[0];
                        scale = d.scale + (nd.scale - d.scale) * stackRise;
                        dy = d.dy + (nd.dy - d.dy) * stackRise;
                        rot = d.rot * (1 - stackRise * 0.6);
                    }

                    // When top card is thrown, remaining cards cascade forward
                    if (!isTop && exit) {
                        const nd = DEPTH[idx - 1] ?? DEPTH[0];
                        scale = nd.scale;
                        dy = nd.dy;
                        rot = nd.rot;
                    }

                    let tf, tr;
                    if (isTop && exit) {
                        tf = `translateX(${exit.x}px) translateY(${exit.y}px) rotate(${exit.rot}deg)`;
                        tr = "transform 0.42s cubic-bezier(0.18, 0, 0.5, 1)";
                    } else if (isTop && drag.on) {
                        tf = `translateX(${drag.x}px) translateY(${drag.y * 0.2 - dragLift}px) rotate(${dragRot}deg)`;
                        tr = "none";
                    } else if (isTop) {
                        tf = "translateX(0) translateY(0) rotate(0deg)";
                        tr = "transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)";
                    } else {
                        tf = `scale(${scale}) translateY(${dy}px) rotate(${rot}deg)`;
                        tr = exit
                            ? "transform 0.36s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s"
                            : drag.on
                            ? "none"
                            : "transform 0.32s ease";
                    }

                    return (
                        <div
                            key={card.id}
                            ref={isTop ? topRef : null}
                            onPointerDown={isTop ? onPD : undefined}
                            onPointerMove={isTop ? onPM : undefined}
                            onPointerUp={isTop ? onPU : undefined}
                            onClick={isTop && !exit ? () => { if (Math.abs(drag.x) < 6) setFlipped(f => !f); } : undefined}
                            className={`absolute inset-0 rounded-2xl transition-shadow duration-200 overflow-hidden ${
                                isTop ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                            }`}
                            style={{
                                width: W,
                                height: H,
                                zIndex: d.z,
                                transform: tf,
                                transition: tr,
                                transformOrigin: isTop ? "50% 68%" : "50% 50%",
                                boxShadow: isTop
                                    ? (drag.on || exit)
                                        ? "0 28px 56px rgba(158,119,237,0.22), 0 8px 20px rgba(0,0,0,0.12)"
                                        : "0 12px 36px rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.04)"
                                    : `0 ${3 + idx * 2}px ${8 + idx * 4}px rgba(0,0,0,${0.04 + idx * 0.02})`,
                                touchAction: "none",
                             }}
                        >
                            {isTop ? (
                                <TopCard
                                    card={card}
                                    cardNumber={currentIndex + 1}
                                    totalCards={totalCards}
                                    flipped={flipped}
                                    sd={sd}
                                    sp={sp}
                                />
                            ) : (
                                <CardBack idx={idx} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6 justify-center">
                <button
                    type="button"
                    onClick={goBack}
                    disabled={currentIndex <= 0}
                    className="flex items-center gap-1.5 rounded-lg border border-secondary bg-primary px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-secondary hover:bg-secondary/40 transition duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="size-3.5 stroke-[2.5]" />
                    Back
                </button>
                <button
                    type="button"
                    onClick={() => doThrow(0, 0, "left")}
                    disabled={remaining.length === 0}
                    className="flex items-center gap-1.5 rounded-lg border border-secondary bg-primary px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-secondary hover:bg-secondary/40 transition duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Next
                    <ChevronRight className="size-3.5 stroke-[2.5]" />
                </button>
            </div>
        </motion.div>
    );
}

/* ────────────────────────── Sub-components ────────────────────────── */

interface TopCardProps {
    card: any;
    cardNumber: number;
    totalCards: number;
    flipped: boolean;
    sd: "l" | "r" | null;
    sp: number;
}

function TopCard({ card, cardNumber, totalCards, flipped, sd, sp }: TopCardProps) {
    return (
        <div
            className="w-full h-full relative transition-transform duration-500"
            style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
        >
            {/* Question Side */}
            <div
                className="absolute inset-0 rounded-2xl border border-secondary bg-primary flex flex-col p-6 justify-between overflow-hidden"
                style={{ backfaceVisibility: "hidden" }}
            >
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-brand-secondary">
                        Question Focus
                    </span>
                    <span className="text-[10px] font-mono font-bold text-quaternary">
                        {cardNumber} / {totalCards}
                    </span>
                </div>

                <div className="flex-1 flex items-center justify-center text-base font-bold text-primary text-center px-3 py-5 leading-relaxed font-sans">
                    {card.q}
                </div>

                <div className="text-center text-[9px] font-extrabold uppercase tracking-[0.18em] text-quaternary">
                    tap to reveal answer
                </div>

                {/* Swipe Overlay Tints */}
                {sd === "l" && (
                    <div
                        className="absolute inset-0 rounded-2xl flex items-center justify-end pr-8 pointer-events-none transition duration-75"
                        style={{ background: `rgba(240,68,56,${sp * 0.08})` }}
                    >
                        <span
                            className="text-[10px] font-extrabold uppercase tracking-widest text-red-500"
                            style={{ opacity: sp }}
                        >
                            next →
                        </span>
                    </div>
                )}
                {sd === "r" && (
                    <div
                        className="absolute inset-0 rounded-2xl flex items-center justify-start pl-8 pointer-events-none transition duration-75"
                        style={{ background: `rgba(18,183,106,${sp * 0.08})` }}
                    >
                        <span
                            className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600"
                            style={{ opacity: sp }}
                        >
                            ← back
                        </span>
                    </div>
                )}
            </div>

            {/* Answer Side */}
            <div
                className="absolute inset-0 rounded-2xl border border-brand-secondary bg-[#1c1917] flex flex-col p-6 justify-between"
                style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                }}
            >
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-brand-secondary">
                        Answer Core
                    </span>
                    <span className="text-[10px] font-mono font-bold text-brand-secondary">
                        {cardNumber} / {totalCards}
                    </span>
                </div>

                <div className="flex-1 flex items-center justify-center text-sm font-semibold text-[#f0ebe3] text-center px-3 py-5 leading-relaxed font-sans">
                    {card.a}
                </div>

                <div className="text-center text-[9px] font-extrabold uppercase tracking-[0.18em] text-brand-secondary">
                    swipe to continue
                </div>
            </div>
        </div>
    );
}

function CardBack({ idx }: { idx: number }) {
    const tints = ["bg-secondary", "bg-secondary/95", "bg-secondary/90"];
    const bgClass = tints[idx - 1] ?? tints[tints.length - 1];

    return (
        <div
            className={`w-full h-full rounded-2xl border border-secondary flex items-center justify-center ${bgClass}`}
            style={{
                backgroundImage: `
                    repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 7px,
                        rgba(0,0,0,0.012) 7px,
                        rgba(0,0,0,0.012) 8px
                    )
                `,
            }}
        >
            <div className="w-[82%] h-[80%] border-1.5 border-dashed border-secondary-solid/20 rounded-xl flex items-center justify-center">
                <div className="w-[70%] h-[68%] border border-secondary-solid/10 rounded-lg flex items-center justify-center text-[10px] text-tertiary select-none">
                    ✦
                </div>
            </div>
        </div>
    );
}
