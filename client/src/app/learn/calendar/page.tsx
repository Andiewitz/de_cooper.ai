"use client";

import { useEffect, useState, useMemo } from "react";
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
    InfoCircle,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { LearnDashboardLayout } from "@/components/learn/learn-dashboard-layout";
import { Calendar } from "@/components/application/date-picker/calendar";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { useAuth } from "@/providers/auth-provider";

// STEM topics config for styling and linking
const TOPICS = {
    physics: {
        id: "physics",
        title: "Physics",
        colorClass: "bg-red-500/10 border-red-500/20 text-red-700",
        icon: Atom01,
    },
    mathematics: {
        id: "mathematics",
        title: "Mathematics",
        colorClass: "bg-blue-500/10 border-blue-500/20 text-blue-700",
        icon: Calculator,
    },
    "computer-science": {
        id: "computer-science",
        title: "Computer Science",
        colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700",
        icon: Code01,
    },
    chemistry: {
        id: "chemistry",
        title: "Chemistry",
        colorClass: "bg-amber-500/10 border-amber-500/20 text-amber-700",
        icon: Lightbulb02,
    },
    astronomy: {
        id: "astronomy",
        title: "Astronomy",
        colorClass: "bg-purple-500/10 border-purple-500/20 text-purple-700",
        icon: Globe01,
    },
    general: {
        id: "general",
        title: "General Study",
        colorClass: "bg-slate-500/10 border-slate-500/20 text-slate-700",
        icon: BookOpen01,
    },
};

interface StudySession {
    id: string;
    topicId: keyof typeof TOPICS;
    time: string;
    title: string;
    duration: string;
    status: "Upcoming" | "Active" | "Completed";
}

// Pre-populated study sessions to give immediate life to the calendar
const DEFAULT_SESSIONS = (todayDate: CalendarDate) => {
    const formatKey = (d: CalendarDate) => `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
    
    // Add today, tomorrow, and a couple of days ago
    const day0 = todayDate;
    const dayPlus1 = todayDate.add({ days: 1 });
    const dayMinus2 = todayDate.subtract({ days: 2 });
    
    return {
        [formatKey(dayMinus2)]: [
            {
                id: "d1",
                topicId: "physics" as const,
                time: "10:00 AM",
                title: "Quantum Mechanics: Heisenberg's Uncertainty Principle",
                duration: "60 min",
                status: "Completed" as const,
            },
        ],
        [formatKey(day0)]: [
            {
                id: "d2",
                topicId: "mathematics" as const,
                time: "02:00 PM",
                title: "Linear Algebra: Diagonalization and Eigenvalues",
                duration: "90 min",
                status: "Active" as const,
            },
            {
                id: "d3",
                topicId: "computer-science" as const,
                time: "04:30 PM",
                title: "Algorithms: Spanning Trees & Prim's Algorithm",
                duration: "45 min",
                status: "Upcoming" as const,
            },
        ],
        [formatKey(dayPlus1)]: [
            {
                id: "d4",
                topicId: "chemistry" as const,
                time: "11:00 AM",
                title: "Thermodynamics: Entropy & Free Energy review",
                duration: "60 min",
                status: "Upcoming" as const,
            },
        ],
    };
};

export default function LearnCalendarPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const [selectedDate, setSelectedDate] = useState<DateValue>(today(getLocalTimeZone()));
    const [sessions, setSessions] = useState<Record<string, StudySession[]>>({});
    const [isScheduling, setIsScheduling] = useState(false);
    
    // Form fields
    const [formTopic, setFormTopic] = useState<keyof typeof TOPICS>("physics");
    const [formTime, setFormTime] = useState("09:00 AM");
    const [formTitle, setFormTitle] = useState("");
    const [formDuration, setFormDuration] = useState("60 min");
    
    // Notification alerts
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // Format selected date for local storage key
    const selectedDateKey = useMemo(() => {
        return `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
    }, [selectedDate]);

    // Load sessions from localStorage or set defaults
    useEffect(() => {
        const stored = localStorage.getItem("decooper-study-calendar");
        if (stored) {
            try {
                setSessions(JSON.parse(stored));
            } catch (e) {
                const defaults = DEFAULT_SESSIONS(today(getLocalTimeZone()));
                setSessions(defaults);
                localStorage.setItem("decooper-study-calendar", JSON.stringify(defaults));
            }
        } else {
            const defaults = DEFAULT_SESSIONS(today(getLocalTimeZone()));
            setSessions(defaults);
            localStorage.setItem("decooper-study-calendar", JSON.stringify(defaults));
        }
    }, []);

    // Save sessions to localStorage whenever they change
    const saveSessions = (updated: Record<string, StudySession[]>) => {
        setSessions(updated);
        localStorage.setItem("decooper-study-calendar", JSON.stringify(updated));
    };

    // Calculate highlighted dates (dates that have scheduled sessions)
    const highlightedDates = useMemo(() => {
        return Object.keys(sessions)
            .filter((key) => sessions[key]?.length > 0)
            .map((key) => {
                const [y, m, d] = key.split("-").map(Number);
                return new CalendarDate(y, m, d);
            });
    }, [sessions]);

    // Handle session addition
    const handleAddSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) return;

        const newSession: StudySession = {
            id: String(Date.now()),
            topicId: formTopic,
            time: formTime,
            title: formTitle,
            duration: formDuration,
            status: "Upcoming",
        };

        const daySessions = sessions[selectedDateKey] || [];
        // Insert sorted by time (simple lexical sort for now)
        const updatedSessions = [...daySessions, newSession].sort((a, b) => a.time.localeCompare(b.time));
        
        const updated = {
            ...sessions,
            [selectedDateKey]: updatedSessions,
        };

        saveSessions(updated);
        setFormTitle("");
        setIsScheduling(false);
        triggerMessage("Session scheduled. Get ready to learn!");
    };

    // Handle session deletion
    const handleDeleteSession = (id: string) => {
        const daySessions = sessions[selectedDateKey] || [];
        const updatedSessions = daySessions.filter((s) => s.id !== id);
        
        const updated = {
            ...sessions,
            [selectedDateKey]: updatedSessions,
        };

        // Clean up empty days
        if (updatedSessions.length === 0) {
            delete updated[selectedDateKey];
        }

        saveSessions(updated);
        triggerMessage("Session removed from your study schedule.");
    };

    // Spaced repetition auto-scheduler
    const handleAutoSchedule = () => {
        const intervals = [1, 3, 7]; // Days from selected date
        const activeTopic = formTopic;
        const baseTitle = `${TOPICS[activeTopic].title} Spaced Review`;
        const updated = { ...sessions };

        intervals.forEach((daysToAdd, idx) => {
            const reviewDate = (selectedDate as any).add({ days: daysToAdd });
            const reviewKey = `${reviewDate.year}-${String(reviewDate.month).padStart(2, "0")}-${String(reviewDate.day).padStart(2, "0")}`;
            
            const newSession: StudySession = {
                id: `auto-${Date.now()}-${idx}`,
                topicId: activeTopic,
                time: "10:00 AM",
                title: `${baseTitle} (Ebbinghaus Interval ${daysToAdd}d)`,
                duration: "45 min",
                status: "Upcoming",
            };

            const existing = updated[reviewKey] || [];
            updated[reviewKey] = [...existing, newSession].sort((a, b) => a.time.localeCompare(b.time));
        });

        saveSessions(updated);
        triggerMessage("Optimal Spaced Repetition generated! 3 review sessions scheduled at intervals +1d, +3d, and +7d.");
    };

    const triggerMessage = (message: string) => {
        setAlertMessage(message);
        setTimeout(() => {
            setAlertMessage(null);
        }, 5000);
    };

    if (isLoading) return null;
    if (!isAuthenticated) return null;

    const selectedDateSessions = sessions[selectedDateKey] || [];
    const formattedSelectedDate = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <LearnDashboardLayout title="Study Scheduler" subtitle="Optimize your learning blocks with strict spaced repetition intervals.">
            <div className="mx-auto max-w-6xl space-y-8">
                
                {/* Instruction Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl border border-secondary/80 bg-primary p-6 shadow-xs"
                >
                    <div className="pointer-events-none absolute -right-24 -top-24 size-48 rounded-full bg-brand-secondary/15 blur-2xl" />
                    <div className="flex gap-4 items-start relative z-10">
                        <div className="p-3 bg-secondary/80 rounded-xl text-brand-secondary shrink-0">
                            <CalendarIcon className="size-6" />
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Study Pacing Guide</span>
                            <p className="font-display text-md text-primary leading-relaxed">
                                Plan your review cycles using our study scheduler. Select a subject below to automatically schedule follow-up sessions at optimal spacing intervals.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Interactive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Calendar Frame */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="p-6 border border-secondary bg-primary rounded-2xl shadow-xs space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-tertiary">Select Study Date</h3>
                            
                            <Calendar
                                aria-label="Study Schedule Calendar"
                                value={selectedDate}
                                onChange={setSelectedDate}
                                highlightedDates={highlightedDates}
                                className="w-full mx-auto"
                            />
                            
                            <div className="h-px bg-secondary/60 w-full" />
                            
                            {/* Auto Spacing trigger */}
                            <div className="space-y-3">
                                <p className="text-xs text-tertiary">
                                    Select a subject in the scheduler below, then auto-apply spaced interval blocks from the selected day.
                                </p>
                                <Button
                                    size="sm"
                                    color="secondary"
                                    className="w-full flex items-center justify-center gap-2"
                                    iconLeading={Zap}
                                    onClick={handleAutoSchedule}
                                >
                                    Auto-Schedule Spaced Reviews
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Day's Agenda and Form */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Daily Agenda card */}
                        <div className="p-6 border border-secondary bg-primary rounded-2xl shadow-xs space-y-6">
                            <div className="flex items-center justify-between border-b border-secondary/60 pb-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Daily Agenda</span>
                                    <h3 className="font-display text-lg font-bold text-primary">{formattedSelectedDate}</h3>
                                </div>
                                <Button
                                    size="sm"
                                    color="primary"
                                    iconLeading={Plus}
                                    onClick={() => setIsScheduling(true)}
                                >
                                    Add Block
                                </Button>
                            </div>

                            {/* Notifications / Alerts */}
                            <AnimatePresence>
                                {alertMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 bg-brand-secondary/10 border border-brand-secondary/20 rounded-xl text-xs text-brand-secondary font-medium flex items-center gap-2 overflow-hidden"
                                    >
                                        <InfoCircle className="size-4 shrink-0" />
                                        <span>{alertMessage}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Agenda Items List */}
                            <div className="space-y-3">
                                {selectedDateSessions.length === 0 ? (
                                    <div className="py-12 px-6 border border-dashed border-secondary/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="p-3 bg-secondary/40 rounded-full text-quaternary">
                                            <CalendarIcon className="size-8" />
                                        </div>
                                        <div className="max-w-md space-y-1">
                                            <p className="text-sm font-semibold text-secondary">No Sessions Scheduled</p>
                                            <p className="text-xs text-tertiary">
                                                Plan your study slots for this day. Click "Add Block" to schedule a dedicated review session.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-secondary/40">
                                        {selectedDateSessions.map((session) => {
                                            const topic = TOPICS[session.topicId] || TOPICS.general;
                                            const TopicIcon = topic.icon;

                                            return (
                                                <div
                                                    key={session.id}
                                                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                                >
                                                    <div className="flex gap-3.5 items-start">
                                                        <div className={`p-2.5 rounded-xl border shrink-0 ${topic.colorClass}`}>
                                                            <TopicIcon className="size-5" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-semibold text-primary">{session.time}</span>
                                                                <span className="text-xs text-quaternary">•</span>
                                                                <span className="text-xs text-quaternary">{session.duration}</span>
                                                                {session.status === "Active" && (
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 animate-pulse">
                                                                        Active
                                                                    </span>
                                                                )}
                                                                {session.status === "Completed" && (
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                                                        Completed
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-bold text-primary">{session.title}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 sm:self-center">
                                                        <Button
                                                            size="xs"
                                                            color="secondary"
                                                            iconLeading={Play}
                                                            onClick={() => {
                                                                if (session.topicId === "general") {
                                                                    router.push("/learn");
                                                                } else {
                                                                    router.push(`/learn/${session.topicId}`);
                                                                }
                                                            }}
                                                        >
                                                            Launch
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            color="tertiary"
                                                            iconLeading={Trash01}
                                                            onClick={() => handleDeleteSession(session.id)}
                                                            className="text-quaternary hover:text-error-primary"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Inline scheduling form */}
                        <AnimatePresence>
                            {isScheduling && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 12 }}
                                    className="p-6 border border-secondary bg-primary rounded-2xl shadow-xs space-y-5"
                                >
                                    <div className="flex items-center justify-between border-b border-secondary/60 pb-3">
                                        <h4 className="font-display text-sm font-bold text-primary">Schedule Study Block</h4>
                                        <button
                                            type="button"
                                            className="text-xs text-tertiary hover:underline"
                                            onClick={() => setIsScheduling(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddSession} className="space-y-4">
                                        
                                        {/* Subject / Topic Select */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-secondary uppercase tracking-wide">STEM Subject</label>
                                            <select
                                                value={formTopic}
                                                onChange={(e) => setFormTopic(e.target.value as keyof typeof TOPICS)}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-secondary bg-primary text-sm text-primary focus:outline-hidden focus:ring-2 focus:ring-brand-secondary/20"
                                            >
                                                {Object.values(TOPICS).map((topic) => (
                                                    <option key={topic.id} value={topic.id}>
                                                        {topic.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Time and Duration Row */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-secondary uppercase tracking-wide">Start Time</label>
                                                <select
                                                    value={formTime}
                                                    onChange={(e) => setFormTime(e.target.value)}
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary bg-primary text-sm text-primary focus:outline-hidden"
                                                >
                                                    {["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"].map((t) => (
                                                        <option key={t} value={t}>
                                                            {t}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-secondary uppercase tracking-wide">Duration</label>
                                                <select
                                                    value={formDuration}
                                                    onChange={(e) => setFormDuration(e.target.value)}
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary bg-primary text-sm text-primary focus:outline-hidden"
                                                >
                                                    {["30 min", "45 min", "60 min", "90 min", "120 min"].map((d) => (
                                                        <option key={d} value={d}>
                                                            {d}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Goal / Session Title */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-secondary uppercase tracking-wide">Study Goal / Focus</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Review Schwarzschild radius equation derivation"
                                                value={formTitle}
                                                onChange={(e) => setFormTitle(e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-secondary bg-primary text-sm text-primary focus:outline-hidden focus:ring-2 focus:ring-brand-secondary/20"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="sm"
                                            color="primary"
                                            className="w-full justify-center"
                                        >
                                            Schedule Block
                                        </Button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

            </div>
        </LearnDashboardLayout>
    );
}
