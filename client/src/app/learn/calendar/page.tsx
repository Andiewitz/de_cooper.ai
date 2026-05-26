"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar as CalendarIcon,
    Plus,
    Trash01,
    Atom01,
    Calculator,
    Code01,
    Globe01,
    Lightbulb02,
    BookOpen01,
    Zap,
    Play,
    Clock,
    CheckCircle,
    ArrowRight,
    X,
    ChevronLeft,
    ChevronRight,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { LearnDashboardLayout } from "@/components/learn/learn-dashboard-layout";
import { Calendar } from "@/components/application/date-picker/calendar";
import { CalendarDate, getLocalTimeZone, today, getDayOfWeek } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { useAuth } from "@/providers/auth-provider";

/* ──────────────────── Topic Design Tokens ──────────────────── */
const TOPICS = {
    physics: {
        id: "physics",
        title: "Physics",
        gradient: "bg-linear-to-tr from-purple-500 to-indigo-500",
        badge: "bg-purple-500/10 text-purple-700 border-purple-500/20",
        accent: "text-purple-600",
        icon: Atom01,
    },
    mathematics: {
        id: "mathematics",
        title: "Mathematics",
        gradient: "bg-linear-to-tr from-blue-500 to-cyan-500",
        badge: "bg-blue-500/10 text-blue-700 border-blue-500/20",
        accent: "text-blue-600",
        icon: Calculator,
    },
    "computer-science": {
        id: "computer-science",
        title: "Computer Science",
        gradient: "bg-linear-to-tr from-emerald-500 to-teal-500",
        badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
        accent: "text-emerald-600",
        icon: Code01,
    },
    chemistry: {
        id: "chemistry",
        title: "Chemistry",
        gradient: "bg-linear-to-tr from-amber-500 to-orange-500",
        badge: "bg-amber-500/10 text-amber-700 border-amber-500/20",
        accent: "text-amber-600",
        icon: Lightbulb02,
    },
    astronomy: {
        id: "astronomy",
        title: "Astronomy",
        gradient: "bg-linear-to-tr from-pink-500 to-rose-500",
        badge: "bg-pink-500/10 text-pink-700 border-pink-500/20",
        accent: "text-pink-600",
        icon: Globe01,
    },
    general: {
        id: "general",
        title: "General Study",
        gradient: "bg-linear-to-tr from-slate-500 to-neutral-500",
        badge: "bg-slate-500/10 text-slate-700 border-slate-500/20",
        accent: "text-slate-600",
        icon: BookOpen01,
    },
} as const;

type TopicId = keyof typeof TOPICS;

/* ──────────────────── Types ──────────────────── */
interface StudySession {
    id: string;
    topicId: TopicId;
    time: string;
    title: string;
    duration: string;
    status: "upcoming" | "active" | "completed";
}

/* ──────────────────── Helpers ──────────────────── */
const formatDateKey = (d: { year: number; month: number; day: number }) =>
    `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

const STORAGE_KEY = "decooper-study-calendar";

/* Default sessions seeded relative to today */
function seedDefaults(todayDate: CalendarDate): Record<string, StudySession[]> {
    return {
        [formatDateKey(todayDate.subtract({ days: 2 }))]: [
            { id: "s1", topicId: "physics", time: "10:00 AM", title: "Quantum Mechanics — Heisenberg's Uncertainty Principle", duration: "60 min", status: "completed" },
        ],
        [formatDateKey(todayDate)]: [
            { id: "s2", topicId: "mathematics", time: "02:00 PM", title: "Linear Algebra — Diagonalization and Eigenvalues", duration: "90 min", status: "active" },
            { id: "s3", topicId: "computer-science", time: "04:30 PM", title: "Algorithms — Spanning Trees & Prim's Algorithm", duration: "45 min", status: "upcoming" },
        ],
        [formatDateKey(todayDate.add({ days: 1 }))]: [
            { id: "s4", topicId: "chemistry", time: "11:00 AM", title: "Thermodynamics — Entropy & Free Energy Review", duration: "60 min", status: "upcoming" },
        ],
        [formatDateKey(todayDate.add({ days: 3 }))]: [
            { id: "s5", topicId: "astronomy", time: "03:00 PM", title: "Stellar Evolution — Main Sequence to White Dwarf", duration: "75 min", status: "upcoming" },
        ],
    };
}

/* ──────────────────── Stats Helpers ──────────────────── */
function computeStats(sessions: Record<string, StudySession[]>) {
    let totalSessions = 0;
    let completedSessions = 0;
    let upcomingSessions = 0;
    const topicCounts: Partial<Record<TopicId, number>> = {};

    Object.values(sessions).forEach((day) => {
        day.forEach((s) => {
            totalSessions++;
            if (s.status === "completed") completedSessions++;
            if (s.status === "upcoming") upcomingSessions++;
            topicCounts[s.topicId] = (topicCounts[s.topicId] || 0) + 1;
        });
    });

    return { totalSessions, completedSessions, upcomingSessions, topicCounts };
}

/* ──────────────────── Component ──────────────────── */
export default function LearnCalendarPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    const [selectedDate, setSelectedDate] = useState<DateValue>(today(getLocalTimeZone()));
    const [sessions, setSessions] = useState<Record<string, StudySession[]>>({});
    const [showScheduler, setShowScheduler] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    /* Form state */
    const [formTopic, setFormTopic] = useState<TopicId>("physics");
    const [formTime, setFormTime] = useState("09:00 AM");
    const [formTitle, setFormTitle] = useState("");
    const [formDuration, setFormDuration] = useState("60 min");

    /* Derived */
    const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);
    const daySessions = sessions[dateKey] || [];
    const stats = useMemo(() => computeStats(sessions), [sessions]);

    const highlightedDates = useMemo(() =>
        Object.keys(sessions)
            .filter((k) => sessions[k]?.length > 0)
            .map((k) => { const [y, m, d] = k.split("-").map(Number); return new CalendarDate(y, m, d); }),
    [sessions]);

    const formattedDate = useMemo(() =>
        new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day)
            .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    [selectedDate]);

    const isToday = useMemo(() => {
        const t = today(getLocalTimeZone());
        return selectedDate.year === t.year && selectedDate.month === t.month && selectedDate.day === t.day;
    }, [selectedDate]);

    /* Persistence */
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) { setSessions(JSON.parse(raw)); return; }
        } catch {}
        const defaults = seedDefaults(today(getLocalTimeZone()));
        setSessions(defaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }, []);

    const persist = useCallback((next: Record<string, StudySession[]>) => {
        setSessions(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }, []);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    }, []);

    /* Actions */
    const addSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) return;
        const session: StudySession = { id: String(Date.now()), topicId: formTopic, time: formTime, title: formTitle, duration: formDuration, status: "upcoming" };
        const updated = { ...sessions, [dateKey]: [...daySessions, session].sort((a, b) => a.time.localeCompare(b.time)) };
        persist(updated);
        setFormTitle("");
        setShowScheduler(false);
        showToast("Study block added to your schedule.");
    };

    const removeSession = (id: string) => {
        const filtered = daySessions.filter((s) => s.id !== id);
        const updated = { ...sessions };
        if (filtered.length === 0) delete updated[dateKey]; else updated[dateKey] = filtered;
        persist(updated);
        showToast("Session removed.");
    };

    const autoSchedule = () => {
        const intervals = [1, 3, 7];
        const title = TOPICS[formTopic].title;
        const next = { ...sessions };
        intervals.forEach((gap, i) => {
            const d = (selectedDate as CalendarDate).add({ days: gap });
            const k = formatDateKey(d);
            const s: StudySession = { id: `auto-${Date.now()}-${i}`, topicId: formTopic, time: "10:00 AM", title: `${title} — Spaced Review (+${gap}d)`, duration: "45 min", status: "upcoming" };
            next[k] = [...(next[k] || []), s].sort((a, b) => a.time.localeCompare(b.time));
        });
        persist(next);
        showToast("Spaced repetition sessions scheduled at +1, +3, and +7 day intervals.");
    };

    /* Auth gates */
    if (isLoading || !isAuthenticated) return null;

    /* ──────────────────── Render ──────────────────── */
    return (
        <LearnDashboardLayout title="Study Calendar" subtitle="Plan and track your study sessions">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mx-auto max-w-6xl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* ═══════════ LEFT — Main Content ═══════════ */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Hero Header — Cardless, matching dashboard */}
                        <motion.section
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="relative overflow-visible"
                        >
                            <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-brand-secondary/40 opacity-40 blur-3xl" />
                            <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-1/2 bg-[#FEF08A]/10 opacity-30 blur-3xl" />

                            <div className="relative">
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Study Calendar</p>
                                <h2 className="mt-2 font-display text-display-sm font-bold text-primary sm:text-display-md leading-tight">
                                    Plan your learning cadence
                                </h2>
                                <p className="mt-4 text-md text-tertiary leading-relaxed max-w-2xl">
                                    Schedule dedicated study blocks and let spaced repetition optimize your long-term retention. Select a date to view or add sessions.
                                </p>
                            </div>
                        </motion.section>

                        <div className="h-px bg-secondary/80 w-full" />

                        {/* ─── Daily Agenda ─── */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-tertiary">Daily Agenda</h3>
                                    <p className="mt-1 text-lg font-display font-bold text-primary">
                                        {formattedDate}
                                        {isToday && (
                                            <span className="ml-2 inline-flex items-center rounded-full bg-brand-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fg-brand-primary align-middle">
                                                Today
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    color="primary"
                                    iconLeading={Plus}
                                    onClick={() => setShowScheduler(true)}
                                >
                                    Add Block
                                </Button>
                            </div>

                            {/* Toast */}
                            <AnimatePresence>
                                {toast && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="flex items-center gap-2 rounded-xl border border-brand-secondary/20 bg-brand-secondary/10 px-4 py-2.5 text-xs font-medium text-brand-secondary"
                                    >
                                        <CheckCircle className="size-4 shrink-0" />
                                        <span>{toast}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Session list */}
                            {daySessions.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="rounded-2xl border border-dashed border-secondary/80 py-16 flex flex-col items-center justify-center text-center space-y-3"
                                >
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary/40 text-quaternary">
                                        <CalendarIcon className="size-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-secondary">No sessions scheduled</p>
                                    <p className="text-xs text-quaternary max-w-xs">Click "Add Block" to schedule a study session, or use auto-schedule from the sidebar to generate spaced reviews.</p>
                                </motion.div>
                            ) : (
                                <div className="divide-y divide-secondary/80">
                                    {daySessions.map((session, idx) => {
                                        const topic = TOPICS[session.topicId] || TOPICS.general;
                                        const Icon = topic.icon;
                                        const statusConfig = {
                                            active: { label: "In Progress", color: "bg-orange-100 text-orange-800 border-orange-200", pulse: true },
                                            completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800 border-emerald-200", pulse: false },
                                            upcoming: { label: "Upcoming", color: "bg-secondary/60 text-tertiary border-secondary", pulse: false },
                                        }[session.status];

                                        return (
                                            <motion.div
                                                key={session.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25, delay: idx * 0.05 }}
                                                className="group flex w-full items-center justify-between py-5"
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                                                    {/* Gradient Icon Tile — Same as dashboard modules */}
                                                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-xs ${topic.gradient}`}>
                                                        <Icon className="size-5" aria-hidden />
                                                    </div>
                                                    <div className="min-w-0 space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-xs font-semibold text-secondary">{session.time}</span>
                                                            <span className="text-xs text-quaternary">·</span>
                                                            <span className="text-xs text-quaternary">{session.duration}</span>
                                                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusConfig.color} ${statusConfig.pulse ? "animate-pulse" : ""}`}>
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-primary truncate group-hover:text-brand-secondary transition duration-100">
                                                            {session.title}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button
                                                        size="xs"
                                                        color="secondary"
                                                        iconLeading={Play}
                                                        onClick={() => router.push(session.topicId === "general" ? "/learn" : `/learn/${session.topicId}`)}
                                                    >
                                                        Launch
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        color="tertiary"
                                                        iconLeading={Trash01}
                                                        onClick={() => removeSession(session.id)}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ─── Inline Scheduling Form ─── */}
                            <AnimatePresence>
                                {showScheduler && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="rounded-2xl border border-secondary bg-primary p-6 shadow-xs space-y-5">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-display text-sm font-bold text-primary">Schedule Study Block</h4>
                                                <button type="button" className="p-1 rounded-lg hover:bg-primary_hover text-quaternary transition" onClick={() => setShowScheduler(false)}>
                                                    <X className="size-4" />
                                                </button>
                                            </div>

                                            <form onSubmit={addSession} className="space-y-4">
                                                {/* Topic selector — visual tiles */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-tertiary uppercase tracking-wider">Subject</label>
                                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                        {(Object.keys(TOPICS) as TopicId[]).map((tid) => {
                                                            const t = TOPICS[tid];
                                                            const TIcon = t.icon;
                                                            const active = formTopic === tid;
                                                            return (
                                                                <button
                                                                    key={tid}
                                                                    type="button"
                                                                    onClick={() => setFormTopic(tid)}
                                                                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border transition duration-100 cursor-pointer ${
                                                                        active
                                                                            ? "border-brand-secondary bg-brand-secondary/10 ring-2 ring-brand-secondary/30"
                                                                            : "border-secondary bg-primary hover:border-secondary_alt hover:bg-primary_hover"
                                                                    }`}
                                                                >
                                                                    <div className={`flex size-8 items-center justify-center rounded-lg text-white ${t.gradient}`}>
                                                                        <TIcon className="size-4" />
                                                                    </div>
                                                                    <span className="text-[10px] font-semibold text-secondary truncate w-full text-center">{t.title.split(" ")[0]}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Time + Duration */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-tertiary uppercase tracking-wider">Start Time</label>
                                                        <select
                                                            value={formTime}
                                                            onChange={(e) => setFormTime(e.target.value)}
                                                            className="w-full rounded-lg border border-secondary bg-primary px-3.5 py-2.5 text-sm text-primary shadow-xs focus:outline-hidden focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary/40 transition"
                                                        >
                                                            {["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM"].map((t) => (
                                                                <option key={t} value={t}>{t}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-tertiary uppercase tracking-wider">Duration</label>
                                                        <select
                                                            value={formDuration}
                                                            onChange={(e) => setFormDuration(e.target.value)}
                                                            className="w-full rounded-lg border border-secondary bg-primary px-3.5 py-2.5 text-sm text-primary shadow-xs focus:outline-hidden focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary/40 transition"
                                                        >
                                                            {["30 min","45 min","60 min","90 min","120 min"].map((d) => (
                                                                <option key={d} value={d}>{d}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-tertiary uppercase tracking-wider">Focus / Goal</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. Review Schwarzschild radius derivation"
                                                        value={formTitle}
                                                        onChange={(e) => setFormTitle(e.target.value)}
                                                        className="w-full rounded-lg border border-secondary bg-primary px-3.5 py-2.5 text-sm text-primary placeholder-quaternary shadow-xs focus:outline-hidden focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary/40 transition"
                                                    />
                                                </div>

                                                <div className="flex gap-3 pt-1">
                                                    <Button type="submit" size="sm" color="primary" className="flex-1 justify-center">
                                                        Schedule Block
                                                    </Button>
                                                    <Button type="button" size="sm" color="secondary" onClick={() => setShowScheduler(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* ═══════════ RIGHT — Sidebar ═══════════ */}
                    <div className="lg:col-span-4 space-y-8 lg:border-l lg:border-secondary/80 lg:pl-8">

                        {/* Calendar Widget */}
                        <div className="pb-6 border-b border-secondary/80">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-tertiary mb-4">Pick a Date</h4>
                            <Calendar
                                aria-label="Study Schedule Calendar"
                                value={selectedDate}
                                onChange={setSelectedDate}
                                highlightedDates={highlightedDates}
                            />
                        </div>

                        {/* Stats — Matching dashboard style */}
                        <div className="grid grid-cols-2 gap-6 pb-6 border-b border-secondary/80">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-tertiary">
                                    <CalendarIcon className="size-4 text-brand-secondary" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Scheduled</span>
                                </div>
                                <p className="mt-1.5 font-display text-display-sm font-bold text-primary leading-none">{stats.totalSessions}</p>
                                <span className="text-xs text-quaternary mt-1">total blocks</span>
                            </div>
                            <div className="flex flex-col border-l border-secondary/60 pl-6">
                                <div className="flex items-center gap-1.5 text-tertiary">
                                    <CheckCircle className="size-4 text-emerald-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                                </div>
                                <p className="mt-1.5 font-display text-display-sm font-bold text-primary leading-none">{stats.completedSessions}</p>
                                <span className="text-xs text-quaternary mt-1">sessions done</span>
                            </div>
                        </div>

                        {/* Auto-Schedule Card */}
                        <div className="space-y-4 pb-6 border-b border-secondary/80">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-tertiary">Spaced Repetition</h4>
                            <p className="text-xs text-quaternary leading-relaxed">
                                Generate review sessions at scientifically optimal intervals (+1, +3, +7 days) from the selected date for the chosen subject.
                            </p>

                            {/* Topic quick-pick */}
                            <div className="flex flex-wrap gap-1.5">
                                {(Object.keys(TOPICS) as TopicId[]).map((tid) => {
                                    const t = TOPICS[tid];
                                    const active = formTopic === tid;
                                    return (
                                        <button
                                            key={tid}
                                            type="button"
                                            onClick={() => setFormTopic(tid)}
                                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                                                active
                                                    ? `${t.badge} border-current ring-1 ring-current/20`
                                                    : "border-secondary text-quaternary hover:border-secondary_alt hover:text-tertiary"
                                            }`}
                                        >
                                            {t.title.split(" ")[0]}
                                        </button>
                                    );
                                })}
                            </div>

                            <Button
                                size="sm"
                                color="secondary"
                                iconLeading={Zap}
                                onClick={autoSchedule}
                                className="w-full justify-center"
                            >
                                Auto-Schedule Reviews
                            </Button>
                        </div>

                        {/* Upcoming Sessions Timeline */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-tertiary">
                                Upcoming Sessions
                            </h4>
                            <div className="relative pl-6 space-y-5">
                                <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 border-l border-dashed border-secondary-solid/40" />

                                {(() => {
                                    /* Show next 4 upcoming sessions across all dates */
                                    const upcoming: { dateKey: string; session: StudySession }[] = [];
                                    const sortedKeys = Object.keys(sessions).sort();
                                    const todayKey = formatDateKey(today(getLocalTimeZone()));

                                    for (const k of sortedKeys) {
                                        if (k < todayKey) continue;
                                        for (const s of sessions[k]) {
                                            if (s.status !== "completed") upcoming.push({ dateKey: k, session: s });
                                            if (upcoming.length >= 4) break;
                                        }
                                        if (upcoming.length >= 4) break;
                                    }

                                    if (upcoming.length === 0) {
                                        return (
                                            <p className="text-xs text-quaternary italic pl-2">No upcoming sessions. Schedule some study blocks!</p>
                                        );
                                    }

                                    return upcoming.map(({ dateKey: dk, session: s }, i) => {
                                        const topic = TOPICS[s.topicId] || TOPICS.general;
                                        const [y, m, d] = dk.split("-").map(Number);
                                        const dateLabel = new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                        const isActive = s.status === "active";

                                        return (
                                            <div key={s.id} className="relative flex gap-3 text-sm">
                                                <div className={`absolute -left-6 mt-1 flex size-5 items-center justify-center rounded-full text-white text-[10px] font-bold ${isActive ? `${topic.gradient} animate-pulse` : topic.gradient}`}>
                                                    {i + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-primary truncate">{s.title}</p>
                                                    <p className="text-xs text-quaternary">{dateLabel} · {s.time} · {s.duration}</p>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                    </div>

                </div>
            </motion.div>
        </LearnDashboardLayout>
    );
}
