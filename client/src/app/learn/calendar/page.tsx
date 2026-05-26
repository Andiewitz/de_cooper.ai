"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash01,
    CheckCircle,
    Circle,
    ChevronLeft,
    ChevronRight,
} from "@untitledui/icons";
import { LearnDashboardLayout } from "@/components/learn/learn-dashboard-layout";
import { CalendarDate, getLocalTimeZone, today, getDayOfWeek } from "@internationalized/date";
import { useAuth } from "@/providers/auth-provider";

/* ─── Types ─── */
interface FlashcardNote {
    id: string;
    text: string;
    done: boolean;
}

type CalendarData = Record<string, FlashcardNote[]>;

/* ─── Helpers ─── */
const STORAGE_KEY = "decooper-calendar-notes";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const dateKey = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
    // 0=Sun..6=Sat → convert to Mon-start: Mon=0..Sun=6
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

/* Default seed data */
function seedDefaults(): CalendarData {
    const t = today(getLocalTimeZone());
    return {
        [dateKey(t.year, t.month, t.day)]: [
            { id: "1", text: "Review Quantum Mechanics flashcards", done: false },
            { id: "2", text: "Create Linear Algebra eigenvalue cards", done: false },
        ],
        [dateKey(t.add({ days: 1 }).year, t.add({ days: 1 }).month, t.add({ days: 1 }).day)]: [
            { id: "3", text: "Thermodynamics review deck", done: false },
        ],
        [dateKey(t.subtract({ days: 2 }).year, t.subtract({ days: 2 }).month, t.subtract({ days: 2 }).day)]: [
            { id: "4", text: "Heisenberg principle cards", done: true },
        ],
    };
}

/* ─── Component ─── */
export default function LearnCalendarPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const t = today(getLocalTimeZone());

    const [viewYear, setViewYear] = useState(t.year);
    const [viewMonth, setViewMonth] = useState(t.month);
    const [selectedDay, setSelectedDay] = useState<string>(dateKey(t.year, t.month, t.day));
    const [data, setData] = useState<CalendarData>({});
    const [newText, setNewText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    /* Persistence */
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) { setData(JSON.parse(raw)); return; }
        } catch {}
        const defaults = seedDefaults();
        setData(defaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }, []);

    const save = useCallback((next: CalendarData) => {
        setData(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }, []);

    /* Actions */
    const addNote = () => {
        const text = newText.trim();
        if (!text) return;
        const notes = data[selectedDay] || [];
        const next = { ...data, [selectedDay]: [...notes, { id: String(Date.now()), text, done: false }] };
        save(next);
        setNewText("");
        inputRef.current?.focus();
    };

    const toggleNote = (id: string) => {
        const notes = data[selectedDay] || [];
        const next = { ...data, [selectedDay]: notes.map((n) => n.id === id ? { ...n, done: !n.done } : n) };
        save(next);
    };

    const deleteNote = (id: string) => {
        const notes = (data[selectedDay] || []).filter((n) => n.id !== id);
        const next = { ...data };
        if (notes.length === 0) delete next[selectedDay]; else next[selectedDay] = notes;
        save(next);
    };

    /* Navigation */
    const prevMonth = () => {
        if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
        else setViewMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
        else setViewMonth((m) => m + 1);
    };
    const goToday = () => {
        setViewYear(t.year); setViewMonth(t.month);
        setSelectedDay(dateKey(t.year, t.month, t.day));
    };

    /* Calendar grid data */
    const calendarGrid = useMemo(() => {
        const daysInMonth = getDaysInMonth(viewYear, viewMonth);
        const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
        const todayKey = dateKey(t.year, t.month, t.day);

        const cells: { day: number; key: string; isToday: boolean; isSelected: boolean; hasDots: boolean; isCurrentMonth: boolean }[] = [];

        // Previous month padding
        const prevMonthDays = viewMonth === 1 ? getDaysInMonth(viewYear - 1, 12) : getDaysInMonth(viewYear, viewMonth - 1);
        const prevY = viewMonth === 1 ? viewYear - 1 : viewYear;
        const prevM = viewMonth === 1 ? 12 : viewMonth - 1;
        for (let i = firstDay - 1; i >= 0; i--) {
            const d = prevMonthDays - i;
            const k = dateKey(prevY, prevM, d);
            cells.push({ day: d, key: k, isToday: k === todayKey, isSelected: k === selectedDay, hasDots: (data[k]?.length ?? 0) > 0, isCurrentMonth: false });
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const k = dateKey(viewYear, viewMonth, d);
            cells.push({ day: d, key: k, isToday: k === todayKey, isSelected: k === selectedDay, hasDots: (data[k]?.length ?? 0) > 0, isCurrentMonth: true });
        }

        // Next month padding (fill to 42 cells = 6 rows)
        const remaining = 42 - cells.length;
        const nextY = viewMonth === 12 ? viewYear + 1 : viewYear;
        const nextM = viewMonth === 12 ? 1 : viewMonth + 1;
        for (let d = 1; d <= remaining; d++) {
            const k = dateKey(nextY, nextM, d);
            cells.push({ day: d, key: k, isToday: k === todayKey, isSelected: k === selectedDay, hasDots: (data[k]?.length ?? 0) > 0, isCurrentMonth: false });
        }

        return cells;
    }, [viewYear, viewMonth, selectedDay, data, t]);

    /* Selected day label */
    const selectedLabel = useMemo(() => {
        const [y, m, d] = selectedDay.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    }, [selectedDay]);

    const selectedNotes = data[selectedDay] || [];
    const doneCount = selectedNotes.filter((n) => n.done).length;

    if (isLoading || !isAuthenticated) return null;

    return (
        <LearnDashboardLayout title="Calendar" subtitle="Schedule your flashcard sessions">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-5xl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* ═══ Calendar Grid ═══ */}
                    <div className="lg:col-span-7">
                        {/* Month nav */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-display-xs font-bold text-primary sm:text-display-sm">
                                {MONTHS[viewMonth - 1]} {viewYear}
                            </h2>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={goToday}
                                    className="mr-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-secondary hover:bg-brand-secondary/10 transition cursor-pointer"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="flex size-8 items-center justify-center rounded-lg text-quaternary hover:bg-primary_hover hover:text-secondary transition cursor-pointer"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="flex size-8 items-center justify-center rounded-lg text-quaternary hover:bg-primary_hover hover:text-secondary transition cursor-pointer"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {WEEKDAYS.map((wd) => (
                                <div key={wd} className="py-2 text-center text-xs font-semibold text-quaternary uppercase tracking-wider">
                                    {wd}
                                </div>
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
                                        relative flex flex-col items-center justify-center py-3 cursor-pointer transition-all duration-100
                                        rounded-xl
                                        ${!cell.isCurrentMonth ? "opacity-30" : ""}
                                        ${cell.isSelected
                                            ? "bg-brand-solid text-white shadow-sm"
                                            : cell.isToday
                                                ? "bg-brand-secondary/15 text-brand-secondary font-bold"
                                                : "hover:bg-primary_hover text-primary"
                                        }
                                    `}
                                >
                                    <span className={`text-sm font-medium ${cell.isSelected ? "font-bold" : ""}`}>
                                        {cell.day}
                                    </span>
                                    {/* Dot indicator */}
                                    {cell.hasDots && (
                                        <span className={`absolute bottom-1.5 size-1 rounded-full ${cell.isSelected ? "bg-white/70" : "bg-brand-secondary"}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ═══ Day Panel ═══ */}
                    <div className="lg:col-span-5 lg:border-l lg:border-secondary/80 lg:pl-8 space-y-6">
                        {/* Day header */}
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
                                {selectedNotes.length > 0
                                    ? `${doneCount}/${selectedNotes.length} completed`
                                    : "No items"
                                }
                            </p>
                            <h3 className="mt-1 font-display text-lg font-bold text-primary">{selectedLabel}</h3>
                        </div>

                        {/* Quick add */}
                        <form
                            onSubmit={(e) => { e.preventDefault(); addNote(); }}
                            className="flex gap-2"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={newText}
                                onChange={(e) => setNewText(e.target.value)}
                                placeholder="Add flashcard note..."
                                className="flex-1 rounded-lg border border-secondary bg-primary px-3.5 py-2 text-sm text-primary placeholder-quaternary shadow-xs focus:outline-hidden focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary/40 transition"
                            />
                            <button
                                type="submit"
                                disabled={!newText.trim()}
                                className="flex size-9 items-center justify-center rounded-lg bg-brand-solid text-white shadow-xs hover:bg-brand-solid_hover disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shrink-0"
                            >
                                <Plus className="size-4" />
                            </button>
                        </form>

                        {/* Notes list */}
                        <div className="space-y-1">
                            <AnimatePresence mode="popLayout">
                                {selectedNotes.length === 0 ? (
                                    <motion.p
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-8 text-center text-sm text-quaternary"
                                    >
                                        No flashcards planned for this day.
                                    </motion.p>
                                ) : (
                                    selectedNotes.map((note) => (
                                        <motion.div
                                            key={note.id}
                                            layout
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -12 }}
                                            className="group flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-primary_hover transition"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleNote(note.id)}
                                                className="mt-0.5 shrink-0 cursor-pointer"
                                            >
                                                {note.done ? (
                                                    <CheckCircle className="size-5 text-brand-secondary" />
                                                ) : (
                                                    <Circle className="size-5 text-quaternary group-hover:text-tertiary transition" />
                                                )}
                                            </button>
                                            <span className={`flex-1 text-sm leading-relaxed ${note.done ? "text-quaternary line-through" : "text-primary"}`}>
                                                {note.text}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => deleteNote(note.id)}
                                                className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md text-quaternary hover:text-error-primary transition cursor-pointer"
                                            >
                                                <Trash01 className="size-3.5" />
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </motion.div>
        </LearnDashboardLayout>
    );
}
