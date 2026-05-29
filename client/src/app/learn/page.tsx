"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    BookOpen01,
    Atom01,
    Calculator,
    Code01,
    Globe01,
    Lightbulb02,
    Zap,
    Trophy01,
    ArrowRight,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { CircleProgressBar } from "@/components/base/progress-indicators/simple-circle";
import { Avatar } from "@/components/base/avatar/avatar";
import { useAuth } from "@/providers/auth-provider";
import OnboardingWizard from "@/components/onboarding-wizard";
import { LearnDashboardLayout } from "@/components/learn/learn-dashboard-layout";

export const topics = [
    {
        id: "physics",
        title: "Physics",
        description: "Quantum mechanics, thermodynamics, electromagnetism, and the mathematical framework governing the physical universe.",
        icon: Atom01,
        accentBg: "bg-[#E8F0FE]",
        accentGradient: "from-blue-400/20 to-purple-500/20",
        accentIcon: "text-blue-600",
        hoverRing: "hover:ring-brand/40",
        hoverText: "group-hover:text-brand-secondary",
    },
    {
        id: "mathematics",
        title: "Mathematics",
        description: "Calculus, linear algebra, topology, and formal proofs. The foundational language underpinning all STEM disciplines.",
        icon: Calculator,
        accentBg: "bg-[#E6F4EA]",
        accentGradient: "from-emerald-400/20 to-teal-500/20",
        accentIcon: "text-emerald-600",
        hoverRing: "hover:ring-emerald-400/50",
        hoverText: "group-hover:text-emerald-600",
    },
    {
        id: "computer-science",
        title: "Computer Science",
        description: "Algorithms, data structures, computational theory, and systems design. The engineering discipline of computational problem-solving.",
        icon: Code01,
        accentBg: "bg-[#FEF7E0]",
        accentGradient: "from-amber-400/20 to-orange-500/20",
        accentIcon: "text-amber-600",
        hoverRing: "hover:ring-amber-400/50",
        hoverText: "group-hover:text-amber-600",
    },
    {
        id: "chemistry",
        title: "Chemistry",
        description: "Organic synthesis, molecular bonding, reaction kinetics, and thermochemistry. Understanding matter at its most fundamental level.",
        icon: Lightbulb02,
        accentBg: "bg-[#FCE8E6]",
        accentGradient: "from-rose-400/20 to-red-500/20",
        accentIcon: "text-rose-600",
        hoverRing: "hover:ring-rose-400/50",
        hoverText: "group-hover:text-rose-600",
    },
    {
        id: "astronomy",
        title: "Astronomy",
        description: "Stellar evolution, cosmological models, planetary dynamics, and the cosmic microwave background radiation.",
        icon: Globe01,
        accentBg: "bg-[#F3E8FF]",
        accentGradient: "from-pink-400/20 to-fuchsia-500/20",
        accentIcon: "text-pink-600",
        hoverRing: "hover:ring-pink-400/50",
        hoverText: "group-hover:text-pink-600",
    },
    {
        id: "general",
        title: "Ask Anything",
        description: "Open-ended STEM inquiry. Ask any question across disciplines and receive a rigorous, visual-first explanation.",
        icon: BookOpen01,
        accentBg: "bg-secondary",
        accentGradient: "from-neutral-400/20 to-slate-500/20",
        accentIcon: "text-secondary",
        hoverRing: "hover:ring-secondary/60",
        hoverText: "group-hover:text-secondary",
    },
];

/* ────────────────────────── Loading Skeletons ───────────────── */

function DashboardSkeleton() {
    return (
        <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Main Workspace Skeleton */}
                <div className="lg:col-span-8 space-y-10">
                    
                    {/* Hero Skeleton */}
                    <div className="rounded-2xl border border-secondary bg-primary/50 p-8 animate-pulse">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="h-4 w-28 rounded-full bg-secondary" />
                                <div className="h-12 w-3/4 rounded-xl bg-secondary" />
                                <div className="space-y-2.5 mt-4">
                                    <div className="h-4 w-full rounded-full bg-secondary/60" />
                                    <div className="h-4 w-5/6 rounded-full bg-secondary/60" />
                                </div>
                            </div>
                            <div className="size-28 rounded-full bg-secondary shrink-0" />
                        </div>
                    </div>

                    {/* Module Cards Skeleton */}
                    <div className="space-y-6 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-0.5 h-5 bg-brand-solid rounded-full" />
                            <div className="h-4 w-44 rounded-full bg-secondary" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="rounded-xl border border-secondary/50 p-6 flex items-center gap-6">
                                    <div className="size-16 rounded-xl bg-secondary shrink-0" />
                                    <div className="flex-1 space-y-2.5">
                                        <div className="h-5 w-36 rounded-lg bg-secondary" />
                                        <div className="h-4 w-5/6 max-w-xl rounded-full bg-secondary/60" />
                                    </div>
                                    <div className="h-8 w-20 rounded-full bg-secondary/40 shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div className="lg:col-span-4 space-y-6 animate-pulse">
                    <div className="h-8 w-40 rounded-lg bg-secondary" />
                    <div className="rounded-xl border border-secondary/50 p-4 flex items-center gap-4">
                        <div className="size-12 rounded-full bg-secondary shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 w-28 rounded-lg bg-secondary" />
                            <div className="h-4 w-20 rounded-full bg-secondary/40" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-secondary/50 p-6 flex flex-col items-center gap-4">
                        <div className="size-28 rounded-full border-4 border-secondary/40" />
                        <div className="h-4 w-24 rounded-full bg-secondary" />
                        <div className="h-3 w-40 rounded-full bg-secondary/40" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-secondary/50 p-4 space-y-2 flex flex-col items-center">
                            <div className="h-6 w-6 rounded bg-secondary" />
                            <div className="h-8 w-10 rounded-lg bg-secondary" />
                            <div className="h-3 w-16 rounded-full bg-secondary/40" />
                        </div>
                        <div className="rounded-xl border border-secondary/50 p-4 space-y-2 flex flex-col items-center">
                            <div className="h-6 w-6 rounded bg-secondary" />
                            <div className="h-8 w-10 rounded-lg bg-secondary" />
                            <div className="h-3 w-16 rounded-full bg-secondary/40" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LearnPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setIsPageLoading(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (isPageLoading) {
        return (
            <LearnDashboardLayout title="Workspace Dashboard" subtitle="Interactive STEM Q&A and AI-Guided Lessons">
                <DashboardSkeleton />
            </LearnDashboardLayout>
        );
    }

    if (!isAuthenticated) return null;

    if (user && !user.onboarding_completed) {
        return <OnboardingWizard onClose={() => {}} />;
    }

    const displayName = user?.display_name || user?.username || "Learner";
    const initials = displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <LearnDashboardLayout title="Workspace Dashboard" subtitle="Interactive STEM Q&A and AI-Guided Lessons">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mx-auto max-w-6xl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* ═══════════ Main Workspace (Left Column) ═══════════ */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* ── Hero Glass Panel ── */}
                        <motion.section
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative rounded-2xl border border-secondary bg-primary/60 backdrop-blur-xl shadow-lg overflow-hidden group"
                        >
                            {/* Coordinate Grid Overlay */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                                style={{
                                    backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                                    backgroundSize: "20px 20px",
                                }}
                            />

                            {/* Ambient brand glow */}
                            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-brand-secondary/30 opacity-40 blur-3xl group-hover:opacity-60 transition-opacity duration-500" />
                            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-1/2 bg-[#FEF08A]/10 opacity-20 blur-3xl" />

                            {/* Subtle label */}
                            <div className="absolute top-4 right-6 text-[10px] font-mono font-medium uppercase tracking-[0.15em] text-quaternary/30 select-none">
                                Coordinate Grid Active
                            </div>

                            <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-secondary">
                                        Dashboard Welcome
                                    </p>
                                    <h2 className="mt-3 font-display text-display-sm sm:text-display-md font-bold text-primary leading-tight">
                                        Hey {displayName},<br />ready to learn?
                                    </h2>
                                    <p className="mt-4 text-md text-tertiary leading-relaxed max-w-xl">
                                        Your AI tutor is standing by. Choose any STEM module from the curriculum roadmap below to launch an interactive, visual-first learning session.
                                    </p>
                                </div>

                                {/* Abstract Brand Visual */}
                                <div className="shrink-0 relative hidden sm:block">
                                    <div className="absolute inset-0 bg-brand-solid opacity-15 blur-xl rounded-full mix-blend-multiply group-hover:opacity-30 transition-opacity duration-500" />
                                    <div className="relative size-28 rounded-full border-4 border-primary p-1 shadow-xl bg-primary">
                                        <div className="size-full rounded-full bg-brand-primary border-2 border-brand/20 flex items-center justify-center">
                                            <span className="font-display text-display-xs font-bold text-brand-secondary tracking-tight">ds</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* ── STEM Curriculum Modules ── */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-0.5 h-5 bg-brand-solid rounded-full" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-tertiary">
                                    STEM Curriculum Modules
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {topics.map((topic, idx) => {
                                    const Icon = topic.icon;
                                    return (
                                        <motion.button
                                            key={topic.id}
                                            type="button"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, delay: idx * 0.06 }}
                                            whileHover={{ scale: 1.008, y: -1 }}
                                            onClick={() => router.push(`/learn/${topic.id}`)}
                                            className={`group flex w-full items-center gap-6 rounded-xl border border-secondary/50 bg-primary/50 backdrop-blur-sm p-5 shadow-xs hover:shadow-lg ${topic.hoverRing} hover:ring-1 transition-all duration-200 cursor-pointer text-left outline-focus-ring`}
                                        >
                                            {/* Module Icon */}
                                            <div className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${topic.accentBg} shadow-inner overflow-hidden relative`}>
                                                <div className={`absolute inset-0 bg-linear-to-br ${topic.accentGradient} z-0`} />
                                                <Icon className={`size-6 ${topic.accentIcon} relative z-10`} aria-hidden />
                                            </div>

                                            {/* Module Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-md font-bold text-primary ${topic.hoverText} transition duration-100`}>
                                                    {topic.title}
                                                </h4>
                                                <p className="mt-1 text-sm text-tertiary line-clamp-2 max-w-xl">
                                                    {topic.description}
                                                </p>
                                            </div>

                                            {/* Action Badge */}
                                            <div className="shrink-0 flex items-center gap-2.5 rounded-full bg-secondary/50 border border-secondary/60 px-4 py-2 group-hover:bg-brand-solid group-hover:border-brand-solid group-hover:text-white transition duration-200">
                                                <span className="text-xs font-bold text-secondary group-hover:text-white transition duration-200">
                                                    {topic.id === "general" ? "Open Q&A" : "Ready"}
                                                </span>
                                                <ArrowRight className="size-3.5 text-tertiary group-hover:text-white transition duration-200" aria-hidden />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* ═══════════ Right Column — Study Console ═══════════ */}
                    <aside className="lg:col-span-4 space-y-6">
                        <h3 className="font-display text-lg font-bold text-primary">
                            Study Console
                        </h3>

                        {/* ── Profile Snippet ── */}
                        <div className="rounded-xl border border-secondary/50 bg-primary/50 backdrop-blur-sm p-4 shadow-xs flex items-center gap-4">
                            <Avatar size="lg" initials={initials} alt={displayName} className="ring-2 ring-brand-secondary/30 shadow-inner" />
                            <div className="min-w-0">
                                <p className="font-bold text-sm text-primary truncate">{displayName}</p>
                                <Badge color="purple" size="sm" className="mt-1.5">
                                    STEM Explorer
                                </Badge>
                            </div>
                        </div>

                        {/* ── Progress Telemetry ── */}
                        <div className="rounded-xl border border-secondary/50 bg-primary/50 backdrop-blur-sm p-6 shadow-md text-center relative overflow-hidden">
                            {/* Subtle grid texture */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                                style={{
                                    backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                                    backgroundSize: "10px 10px",
                                }}
                            />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="mb-4">
                                    <CircleProgressBar value={0} />
                                </div>
                                <p className="text-sm font-bold text-brand-secondary">0% complete</p>
                                <p className="mt-1 text-xs text-quaternary">Start lessons to advance your standing</p>
                            </div>
                        </div>

                        {/* ── Stats Grid ── */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-secondary/50 bg-primary/50 backdrop-blur-sm p-4 text-center shadow-xs flex flex-col items-center justify-center">
                                <Trophy01 className="size-7 mb-2 text-tertiary" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-quaternary mb-1">Completed</span>
                                <span className="font-display text-display-xs font-bold text-primary">0</span>
                                <span className="text-xs text-quaternary mt-1">lessons finished</span>
                            </div>
                            <div className="rounded-xl border border-secondary/50 bg-primary/50 backdrop-blur-sm p-4 text-center shadow-xs flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                                <Zap className="size-7 mb-2 text-brand-secondary relative z-10" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-quaternary mb-1 relative z-10">Streak</span>
                                <span className="font-display text-display-xs font-bold text-primary relative z-10">{user?.current_streak ?? 0}</span>
                                <span className="text-xs text-quaternary mt-1 relative z-10">days active</span>
                            </div>
                        </div>

                        {/* ── Learning Path Trajectory ── */}
                        <div className="rounded-xl border border-secondary/50 bg-primary/50 backdrop-blur-sm p-6 shadow-xs relative overflow-hidden">
                            {/* Subtle grid texture */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                                style={{
                                    backgroundImage: "radial-gradient(circle, currentColor 0.5px, transparent 0.5px)",
                                    backgroundSize: "10px 10px",
                                }}
                            />

                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-tertiary mb-6 relative z-10">
                                Your Learning Path
                            </h4>

                            <div className="relative pl-7 space-y-6 z-10">
                                {/* Timeline rail */}
                                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 border-l border-dashed border-secondary-solid/30" />

                                {/* Step 1: Completed */}
                                <div className="relative flex items-start group">
                                    <div className="absolute -left-7 flex size-6 items-center justify-center rounded-full bg-brand-solid text-white text-[10px] font-bold ring-4 ring-primary z-10">
                                        ✓
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-secondary">Complete Onboarding</h5>
                                        <p className="text-xs text-quaternary">Tuned study profile established</p>
                                    </div>
                                </div>

                                {/* Step 2: Active */}
                                <div className="relative flex items-start group">
                                    <div className="absolute -left-7 flex size-6 items-center justify-center rounded-full bg-brand-secondary border border-brand text-brand-primary text-[10px] font-bold ring-4 ring-primary z-10">
                                        <div className="absolute inset-0 bg-brand-solid opacity-15 blur-md rounded-full" />
                                        <span className="relative z-10">2</span>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-brand-secondary">Launch First Lesson</h5>
                                        <p className="text-xs text-tertiary">Select any active module from the list</p>
                                    </div>
                                </div>

                                {/* Step 3: Locked */}
                                <div className="relative flex items-start group opacity-50">
                                    <div className="absolute -left-7 flex size-6 items-center justify-center rounded-full bg-secondary border border-secondary text-quaternary text-[10px] font-bold ring-4 ring-primary z-10">
                                        3
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-secondary">Pass First Quiz</h5>
                                        <p className="text-xs text-quaternary">Test your comprehension with customized quizzes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </motion.div>
        </LearnDashboardLayout>
    );
}
