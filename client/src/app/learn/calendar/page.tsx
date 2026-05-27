"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash01,
    ChevronLeft,
    ChevronRight,
    RefreshCw01,
    BookOpen01,
    Zap,
    AlertCircle,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { LearnDashboardLayout } from "@/components/learn/learn-dashboard-layout";
import { useAuth } from "@/providers/auth-provider";
import {
    calendarApi,
    lessonsApi,
    type CalendarEntryResponse,
    type FlashcardResponse,
    type LessonResponse as LessonRes,
} from "@/lib/api";

/* ─── Helpers ─── */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dateKey = (y: number, m: number, d: number) =>
    `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const todayKey = () => {
    const now = new Date();
    return dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
};

const monthKey = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon-start
}

/* ─── Flashcard Flip Card ─── */
function FlashcardCard({
    card,
    index,
    total,
    onPrev,
    onNext,
}: {
    card: FlashcardResponse;
    index: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
}) {
    const [flipped, setFlipped] = useState(false);

    // Reset flip on card change
    useEffect(() => { setFlipped(false); }, [card.id]);

    return (
        <div className="space-y-4">
            {/* Card */}
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
                        className="w-full rounded-2xl border border-secondary bg-primary p-8 shadow-xs"
                        style={{ backfaceVisibility: "hidden" }}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">Question</p>
                        <p className="text-md font-semibold text-primary leading-relaxed min-h-[80px] flex items-center">
                            {card.front}
                        </p>
                        <p className="mt-4 text-xs text-quaternary">Tap to reveal answer</p>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 w-full rounded-2xl border border-brand-secondary/30 bg-brand-secondary/5 p-8 shadow-xs"
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">Answer</p>
                        <p className="text-md font-semibold text-primary leading-relaxed min-h-[80px] flex items-center">
                            {card.back}
                        </p>
                        <p className="mt-4 text-xs text-quaternary">Tap to see question</p>
                    </div>
                </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={index === 0}
                    className="flex size-9 items-center justify-center rounded-lg text-quaternary hover:bg-primary_hover hover:text-secondary transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <span className="text-xs font-semibold text-tertiary">
                    {index + 1} / {total}
                </span>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={index === total - 1}
                    className="flex size-9 items-center justify-center rounded-lg text-quaternary hover:bg-primary_hover hover:text-secondary transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function LearnCalendarPage() {
    const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
    const now = new Date();

    // Calendar state
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
    const [selectedDay, setSelectedDay] = useState(todayKey());

    // Data state
    const [monthEntries, setMonthEntries] = useState<CalendarEntryResponse[]>([]);
    const [lessons, setLessons] = useState<LessonRes[]>([]);
    const [monthLoading, setMonthLoading] = useState(false);

    // Day panel state
    const [dayCards, setDayCards] = useState<FlashcardResponse[]>([]);
    const [dayLesson, setDayLesson] = useState<LessonRes | null>(null);
    const [dayLoading, setDayLoading] = useState(false);
    const [dayError, setDayError] = useState<string | null>(null);
    const [cardIndex, setCardIndex] = useState(0);

    // Schedule form
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState("");

    // Mapped entries for dot display
    const entryDates = useMemo(() => {
        const map = new Map<string, CalendarEntryResponse>();
        monthEntries.forEach((e) => map.set(e.scheduled_date, e));
        return map;
    }, [monthEntries]);

    // Fetch month entries
    const fetchMonth = useCallback(async () => {
        if (!token) return;
        setMonthLoading(true);
        try {
            const entries = await calendarApi.getMonth(monthKey(viewYear, viewMonth), token);
            setMonthEntries(entries);
        } catch {
            setMonthEntries([]);
        } finally {
            setMonthLoading(false);
        }
    }, [token, viewYear, viewMonth]);

    // Fetch user lessons (for schedule dropdown)
    const fetchLessons = useCallback(async () => {
        if (!token) return;
        try {
            const data = await lessonsApi.getAll(token);
            setLessons(data);
        } catch {
            setLessons([]);
        }
    }, [token]);

    // Fetch flashcards for selected day
    const fetchDay = useCallback(async () => {
        if (!token) return;
        const entry = entryDates.get(selectedDay);

        if (!entry) {
            setDayCards([]);
            setDayLesson(null);
            setDayError(null);
            return;
        }

        setDayLoading(true);
        setDayError(null);
        setCardIndex(0);
        try {
            const res = await calendarApi.getDayFlashcards(selectedDay, token);
            setDayLesson(res.lesson);
            setDayCards(res.flashcards);
        } catch (err: any) {
            setDayError(err?.detail || err?.message || "Failed to load flashcards");
            setDayCards([]);
            setDayLesson(null);
        } finally {
            setDayLoading(false);
        }
    }, [token, selectedDay, entryDates]);

    // Initial load
    useEffect(() => { fetchMonth(); }, [fetchMonth]);
    useEffect(() => { fetchLessons(); }, [fetchLessons]);
    useEffect(() => { fetchDay(); }, [fetchDay]);

    // Month navigation
    const prevMonth = () => {
        if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
        else setViewMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
        else setViewMonth((m) => m + 1);
    };
    const goToday = () => {
        const n = new Date();
        setViewYear(n.getFullYear()); setViewMonth(n.getMonth() + 1);
        setSelectedDay(todayKey());
    };

    // Schedule a lesson on the selected day
    const handleSchedule = async () => {
        if (!token || !selectedLessonId) return;
        try {
            await calendarApi.createEntry({ lesson_id: selectedLessonId, scheduled_date: selectedDay }, token);
            setShowScheduleForm(false);
            setSelectedLessonId("");
            await fetchMonth();
        } catch (err: any) {
            setDayError(err?.detail || "Failed to schedule lesson");
        }
    };

    // Delete entry for the selected day
    const handleDelete = async () => {
        if (!token) return;
        try {
            await calendarApi.deleteEntry(selectedDay, token);
            setDayCards([]);
            setDayLesson(null);
            await fetchMonth();
        } catch {}
    };

    // Calendar grid
    const calendarGrid = useMemo(() => {
        const daysInMonth = getDaysInMonth(viewYear, viewMonth);
        const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
        const tk = todayKey();

        const cells: { day: number; key: string; isToday: boolean; isSelected: boolean; hasEntry: boolean; isCurrentMonth: boolean }[] = [];

        // Prev month padding
        const prevDays = viewMonth === 1 ? getDaysInMonth(viewYear - 1, 12) : getDaysInMonth(viewYear, viewMonth - 1);
        const prevY = viewMonth === 1 ? viewYear - 1 : viewYear;
        const prevM = viewMonth === 1 ? 12 : viewMonth - 1;
        for (let i = firstDay - 1; i >= 0; i--) {
            const d = prevDays - i;
            const k = dateKey(prevY, prevM, d);
            cells.push({ day: d, key: k, isToday: k === tk, isSelected: k === selectedDay, hasEntry: entryDates.has(k), isCurrentMonth: false });
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const k = dateKey(viewYear, viewMonth, d);
            cells.push({ day: d, key: k, isToday: k === tk, isSelected: k === selectedDay, hasEntry: entryDates.has(k), isCurrentMonth: true });
        }

        // Next month padding
        const remaining = 42 - cells.length;
        const nextY = viewMonth === 12 ? viewYear + 1 : viewYear;
        const nextM = viewMonth === 12 ? 1 : viewMonth + 1;
        for (let d = 1; d <= remaining; d++) {
            const k = dateKey(nextY, nextM, d);
            cells.push({ day: d, key: k, isToday: k === tk, isSelected: k === selectedDay, hasEntry: entryDates.has(k), isCurrentMonth: false });
        }
        return cells;
    }, [viewYear, viewMonth, selectedDay, entryDates]);

    // Selected day label
    const selectedLabel = useMemo(() => {
        const [y, m, d] = selectedDay.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    }, [selectedDay]);

    const isToday = selectedDay === todayKey();
    const hasEntry = entryDates.has(selectedDay);

    if (authLoading || !isAuthenticated) return null;

    return (
        <LearnDashboardLayout title="Calendar" subtitle="Schedule lessons and review flashcards">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-5xl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* ═══ Calendar Grid ═══ */}
                    <div className="lg:col-span-7">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-display-xs font-bold text-primary sm:text-display-sm">
                                {MONTHS[viewMonth - 1]} {viewYear}
                            </h2>
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={goToday} className="mr-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-secondary hover:bg-brand-secondary/10 transition cursor-pointer">
                                    Today
                                </button>
                                <button type="button" onClick={prevMonth} className="flex size-8 items-center justify-center rounded-lg text-quaternary hover:bg-primary_hover hover:text-secondary transition cursor-pointer">
                                    <ChevronLeft className="size-4" />
                                </button>
                                <button type="button" onClick={nextMonth} className="flex size-8 items-center justify-center rounded-lg text-quaternary hover:bg-primary_hover hover:text-secondary transition cursor-pointer">
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {WEEKDAYS.map((wd) => (
                                <div key={wd} className="py-2 text-center text-xs font-semibold text-quaternary uppercase tracking-wider">{wd}</div>
                            ))}
                        </div>

                        {/* Day cells */}
                        <div className="grid grid-cols-7">
                            {calendarGrid.map((cell) => (
                                <button
                                    key={cell.key}
                                    type="button"
                                    onClick={() => setSelectedDay(cell.key)}
                                    className={`
                                        relative flex flex-col items-center justify-center py-3 cursor-pointer transition-all duration-100 rounded-xl
                                        ${!cell.isCurrentMonth ? "opacity-30" : ""}
                                        ${cell.isSelected
                                            ? "bg-brand-solid text-white shadow-sm"
                                            : cell.isToday
                                                ? "bg-brand-secondary/15 text-brand-secondary font-bold"
                                                : "hover:bg-primary_hover text-primary"
                                        }
                                    `}
                                >
                                    <span className={`text-sm font-medium ${cell.isSelected ? "font-bold" : ""}`}>{cell.day}</span>
                                    {cell.hasEntry && (
                                        <span className={`absolute bottom-1.5 size-1.5 rounded-full ${cell.isSelected ? "bg-white/70" : "bg-brand-secondary"}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ═══ Day Panel ═══ */}
                    <div className="lg:col-span-5 lg:border-l lg:border-secondary/80 lg:pl-8 space-y-6">
                        {/* Day header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
                                    {isToday ? "Today" : "Selected Date"}
                                </p>
                                <h3 className="mt-1 font-display text-lg font-bold text-primary">{selectedLabel}</h3>
                            </div>
                            {hasEntry && (
                                <Button size="xs" color="tertiary" iconLeading={Trash01} onClick={handleDelete} />
                            )}
                        </div>

                        {/* Content */}
                        {dayLoading ? (
                            /* Loading skeleton */
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 w-2/3 bg-secondary/60 rounded" />
                                <div className="h-40 bg-secondary/40 rounded-2xl" />
                                <div className="flex justify-between">
                                    <div className="h-8 w-8 bg-secondary/40 rounded" />
                                    <div className="h-4 w-12 bg-secondary/40 rounded" />
                                    <div className="h-8 w-8 bg-secondary/40 rounded" />
                                </div>
                            </div>
                        ) : dayError ? (
                            /* Error state */
                            <div className="rounded-2xl border border-error-secondary bg-error-primary/5 p-6 text-center space-y-3">
                                <AlertCircle className="size-8 text-error-primary mx-auto" />
                                <p className="text-sm font-semibold text-error-primary">{dayError}</p>
                                <Button size="sm" color="secondary" iconLeading={RefreshCw01} onClick={fetchDay}>
                                    Retry
                                </Button>
                            </div>
                        ) : !hasEntry ? (
                            /* No lesson scheduled */
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-dashed border-secondary/80 py-12 flex flex-col items-center justify-center text-center space-y-3">
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary/40 text-quaternary">
                                        <BookOpen01 className="size-5" />
                                    </div>
                                    <p className="text-sm font-semibold text-secondary">No lesson scheduled</p>
                                    <p className="text-xs text-quaternary max-w-xs">
                                        Assign a lesson to this day to generate flashcards for review.
                                    </p>
                                </div>

                                {!showScheduleForm ? (
                                    <Button
                                        size="sm"
                                        color="primary"
                                        iconLeading={Plus}
                                        className="w-full justify-center"
                                        onClick={() => setShowScheduleForm(true)}
                                    >
                                        Schedule Lesson
                                    </Button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-2xl border border-secondary bg-primary p-5 shadow-xs space-y-4"
                                    >
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-tertiary">Pick a Lesson</h4>

                                        {lessons.length === 0 ? (
                                            <p className="text-xs text-quaternary py-4 text-center">
                                                No lessons yet. Start a STEM session first to create one.
                                            </p>
                                        ) : (
                                            <>
                                                <select
                                                    value={selectedLessonId}
                                                    onChange={(e) => setSelectedLessonId(e.target.value)}
                                                    className="w-full rounded-lg border border-secondary bg-primary px-3.5 py-2.5 text-sm text-primary shadow-xs focus:outline-hidden focus:ring-2 focus:ring-brand-secondary/30 transition"
                                                >
                                                    <option value="">Select a lesson...</option>
                                                    {lessons.map((l) => (
                                                        <option key={l.id} value={l.id}>{l.title}</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        color="primary"
                                                        className="flex-1 justify-center"
                                                        onClick={handleSchedule}
                                                        disabled={!selectedLessonId}
                                                    >
                                                        Schedule
                                                    </Button>
                                                    <Button size="sm" color="secondary" onClick={() => setShowScheduleForm(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            /* Has entry — show lesson + flashcards */
                            <div className="space-y-6">
                                {/* Lesson info */}
                                {dayLesson && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                                            <Zap className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-quaternary">{dayLesson.topic_id}</p>
                                            <p className="text-sm font-bold text-primary truncate">{dayLesson.title}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Flashcards */}
                                {dayCards.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-secondary/80 py-10 flex flex-col items-center justify-center text-center space-y-3">
                                        <p className="text-sm font-semibold text-secondary">No flashcards yet</p>
                                        <p className="text-xs text-quaternary max-w-xs">
                                            This lesson needs at least one chat exchange with Dr. Cooper before flashcards can be generated.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-px bg-secondary/60 w-full" />
                                        <p className="text-xs font-bold uppercase tracking-wider text-tertiary">
                                            Flashcards · {dayCards.length} cards
                                        </p>
                                        <FlashcardCard
                                            card={dayCards[cardIndex]}
                                            index={cardIndex}
                                            total={dayCards.length}
                                            onPrev={() => setCardIndex((i) => Math.max(0, i - 1))}
                                            onNext={() => setCardIndex((i) => Math.min(dayCards.length - 1, i + 1))}
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </motion.div>
        </LearnDashboardLayout>
    );
}
