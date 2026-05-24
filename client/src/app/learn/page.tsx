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
        description: "Quantum mechanics, thermodynamics, and why your understanding of gravity is embarrassingly Newtonian.",
        icon: Atom01,
    },
    {
        id: "mathematics",
        title: "Mathematics",
        description: "Calculus, linear algebra, topology. The language of the universe — which you barely speak.",
        icon: Calculator,
    },
    {
        id: "computer-science",
        title: "Computer Science",
        description: "Algorithms, data structures, and computational theory. Not just 'coding', you philistine.",
        icon: Code01,
    },
    {
        id: "chemistry",
        title: "Chemistry",
        description: "The lesser science, but still more rigorous than whatever you studied in school.",
        icon: Lightbulb02,
    },
    {
        id: "astronomy",
        title: "Astronomy",
        description: "Stars, galaxies, and the cosmic microwave background. Try to keep up.",
        icon: Globe01,
    },
    {
        id: "general",
        title: "Ask Anything",
        description: "Go ahead. Ask me anything. I promise to make you feel appropriately inadequate.",
        icon: BookOpen01,
    },
];

/* ────────────────────────── Loading Skeletons ───────────────── */

function DashboardSkeleton() {
    return (
        <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Main Workspace (Left - Cardless Layout) */}
                <div className="lg:col-span-8 space-y-10">
                    
                    {/* Welcome Greeting Skeleton */}
                    <div className="relative">
                        {/* Shimmering mesh glows */}
                        <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-brand-secondary/20 opacity-20 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-1/2 bg-[#FEF08A]/5 opacity-15 blur-3xl" />

                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 w-32 rounded-full bg-secondary" />
                            <div className="h-10 sm:h-12 w-3/4 rounded-xl bg-secondary" />
                            <div className="space-y-2.5 mt-4">
                                <div className="h-4 w-full rounded-full bg-secondary/60" />
                                <div className="h-4 w-5/6 rounded-full bg-secondary/60" />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-secondary/60 w-full animate-pulse" />

                    {/* STEM Curriculum Modules Skeleton */}
                    <div className="space-y-6 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-44 rounded-full bg-secondary" />
                            <div className="h-4 w-32 rounded-full bg-secondary/40" />
                        </div>

                        <div className="divide-y divide-secondary/60">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex w-full items-center justify-between py-6">
                                    <div className="flex items-center gap-5 flex-1 min-w-0 pr-4">
                                        <div className="size-14 shrink-0 rounded-2xl bg-secondary" />
                                        <div className="min-w-0 flex-1 space-y-2.5">
                                            <div className="h-5 w-36 rounded-lg bg-secondary" />
                                            <div className="h-4 w-5/6 max-w-xl rounded-full bg-secondary/60" />
                                        </div>
                                    </div>

                                    {/* Action details */}
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="hidden sm:block h-6 w-16 rounded-full bg-secondary/60" />
                                        <div className="size-9 rounded-full bg-secondary/40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress Sidebar Panel (Right - Seamlessly Integrated) */}
                <div className="lg:col-span-4 space-y-8 lg:border-l lg:border-secondary/80 lg:pl-8 animate-pulse">
                    
                    {/* Profile Header Details Skeleton */}
                    <div className="flex items-center gap-4 pb-6 border-b border-secondary/80">
                        <div className="size-14 rounded-full bg-secondary shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-5 w-28 rounded-lg bg-secondary" />
                            <div className="h-4 w-20 rounded-full bg-secondary/40" />
                        </div>
                    </div>

                    {/* Overall Progress Circle Skeleton */}
                    <div className="space-y-3 pb-6 border-b border-secondary/80">
                        <div className="h-4 w-28 rounded-full bg-secondary" />
                        <div className="flex items-center gap-5 py-2">
                            <div className="size-16 rounded-full border-4 border-secondary/40 shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-20 rounded-full bg-secondary" />
                                <div className="h-3.5 w-36 rounded-full bg-secondary/40" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-2 gap-6 pb-6 border-b border-secondary/80">
                        <div className="space-y-2">
                            <div className="h-4 w-20 rounded-full bg-secondary" />
                            <div className="h-8 w-10 rounded-lg bg-secondary" />
                            <div className="h-3 w-16 rounded-full bg-secondary/40" />
                        </div>
                        
                        <div className="border-l border-secondary/60 pl-6 space-y-2">
                            <div className="h-4 w-16 rounded-full bg-secondary" />
                            <div className="h-8 w-16 rounded-lg bg-secondary" />
                            <div className="h-3 w-16 rounded-full bg-secondary/40" />
                        </div>
                    </div>

                    {/* Study Path Timeline Skeleton */}
                    <div className="space-y-4">
                        <div className="h-4 w-28 rounded-full bg-secondary" />
                        <div className="relative pl-6 space-y-6">
                            <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 border-l border-dashed border-secondary/40" />

                            {[1, 2, 3].map((step) => (
                                <div key={step} className="relative flex gap-3">
                                    <div className="absolute -left-6 mt-0.5 size-5 rounded-full bg-secondary/60" />
                                    <div className="space-y-1.5 flex-1">
                                        <div className="h-4 w-28 rounded-full bg-secondary" />
                                        <div className="h-3 w-36 rounded-full bg-secondary/40" />
                                    </div>
                                </div>
                            ))}
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
                    
                    {/* Main Workspace (Left - Cardless Layout) */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* Seamless, Cardless Header Greeting */}
                        <motion.section
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="relative overflow-visible"
                        >
                            {/* Glowing light-mesh accents blending directly on the cream canvas background */}
                            <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-brand-secondary/40 opacity-40 blur-3xl" />
                            <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-1/2 bg-[#FEF08A]/10 opacity-30 blur-3xl" />

                            <div className="relative">
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Dashboard Welcome</p>
                                <h2 className="mt-2 font-display text-display-sm font-bold text-primary sm:text-display-md leading-tight">
                                    Hey {displayName}, ready to learn?
                                </h2>
                                <p className="mt-4 text-md text-tertiary leading-relaxed max-w-2xl">
                                    Dr. Cooper is currently standing by (reluctantly). Choose any STEM module from the curriculum roadmap below to launch an interactive learning session.
                                </p>
                            </div>
                        </motion.section>

                        <div className="h-px bg-secondary/80 w-full" />

                        {/* STEM Curriculum Modules (Seamless List View) */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-tertiary">
                                    STEM Curriculum Modules
                                </h3>
                                <span className="text-xs text-quaternary font-semibold">Select a module to launch</span>
                            </div>

                            <div className="divide-y divide-secondary/80">
                                {topics.map((topic) => {
                                    const Icon = topic.icon;
                                    const gradientClass = {
                                        physics: "bg-linear-to-tr from-purple-500 to-indigo-500 text-white",
                                        mathematics: "bg-linear-to-tr from-blue-500 to-cyan-500 text-white",
                                        "computer-science": "bg-linear-to-tr from-emerald-500 to-teal-500 text-white",
                                        chemistry: "bg-linear-to-tr from-amber-500 to-orange-500 text-white",
                                        astronomy: "bg-linear-to-tr from-pink-500 to-rose-500 text-white",
                                        general: "bg-linear-to-tr from-slate-500 to-neutral-500 text-white"
                                    }[topic.id] || "bg-brand-secondary text-fg-brand-primary";

                                    return (
                                        <motion.button
                                            key={topic.id}
                                            type="button"
                                            whileHover={{ x: 6 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            onClick={() => router.push(`/learn/${topic.id}`)}
                                            className="group flex w-full items-center justify-between py-6 text-left outline-focus-ring cursor-pointer border-none bg-transparent"
                                        >
                                            <div className="flex items-center gap-5 flex-1 min-w-0 pr-4">
                                                <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-xs transition duration-200 group-hover:scale-105 ${gradientClass}`}>
                                                    <Icon className="size-6" aria-hidden />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-md font-bold text-primary group-hover:text-brand-secondary transition duration-100 flex items-center gap-2">
                                                        {topic.title}
                                                    </h4>
                                                    <p className="mt-1 text-sm text-tertiary line-clamp-2 max-w-xl group-hover:text-secondary transition duration-100">
                                                        {topic.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action details */}
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="hidden sm:inline-flex rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-semibold text-tertiary group-hover:bg-brand-secondary group-hover:text-fg-brand-primary transition duration-150">
                                                    {topic.id === "general" ? "Open Q&A" : "Ready"}
                                                </span>
                                                <div className="flex size-9 items-center justify-center rounded-full bg-secondary/40 text-tertiary group-hover:bg-brand-solid group-hover:text-white transition duration-150">
                                                    <ArrowRight className="size-4" aria-hidden />
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Progress Sidebar Panel (Right - Seamlessly Integrated) */}
                    <div className="lg:col-span-4 space-y-8 lg:border-l lg:border-secondary/80 lg:pl-8">
                        
                        {/* Profile Header Details */}
                        <div className="flex items-center gap-4 pb-6 border-b border-secondary/80">
                            <Avatar size="lg" initials={initials} alt={displayName} className="ring-2 ring-brand-secondary/40" />
                            <div className="min-w-0">
                                <h3 className="font-bold text-lg text-primary truncate" title={displayName}>{displayName}</h3>
                                <Badge color="purple" size="sm" className="mt-1">
                                    STEM Explorer
                                </Badge>
                            </div>
                        </div>

                        {/* Overall Progress Circle visualization */}
                        <div className="space-y-3 pb-6 border-b border-secondary/80">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-tertiary">Overall Progress</h4>
                            <div className="flex items-center gap-5 py-2">
                                <CircleProgressBar value={0} />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-primary">0% complete</p>
                                    <p className="text-xs text-quaternary mt-1">Start lessons to advance your standing</p>
                                </div>
                            </div>
                        </div>

                        {/* Integrated borderless stats grid */}
                        <div className="grid grid-cols-2 gap-6 pb-6 border-b border-secondary/80">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-tertiary">
                                    <Trophy01 className="size-4 text-amber-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                                </div>
                                <p className="mt-1.5 font-display text-display-sm font-bold text-primary leading-none">0</p>
                                <span className="text-xs text-quaternary mt-1">lessons finished</span>
                            </div>
                            
                            <div className="flex flex-col border-l border-secondary/60 pl-6">
                                <div className="flex items-center gap-1.5 text-tertiary">
                                    <Zap className="size-4 text-orange-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
                                </div>
                                <p className="mt-1.5 font-display text-display-sm font-bold text-primary leading-none">0 days</p>
                                <span className="text-xs text-quaternary mt-1">active streak</span>
                            </div>
                        </div>

                        {/* Study Path Timeline */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-tertiary">
                                Your Learning Path
                            </h4>
                            <div className="relative pl-6 space-y-6">
                                <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 border-l border-dashed border-secondary-solid/40" />

                                {/* Step 1 */}
                                <div className="relative flex gap-3 text-sm">
                                    <div className="absolute -left-6 mt-1 flex size-5 items-center justify-center rounded-full bg-brand-solid text-white text-[10px] font-bold animate-pulse">
                                        ✓
                                    </div>
                                    <div>
                                        <p className="font-semibold text-secondary">Complete Onboarding</p>
                                        <p className="text-xs text-quaternary">Tuned study profile established</p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="relative flex gap-3 text-sm">
                                    <div className="absolute -left-6 mt-1 flex size-5 items-center justify-center rounded-full bg-brand-secondary border border-brand text-fg-brand-primary text-[10px] font-bold">
                                        2
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary">Launch First Lesson</p>
                                        <p className="text-xs text-tertiary">Select any active module from the list</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="relative flex gap-3 text-sm opacity-50">
                                    <div className="absolute -left-6 mt-1 flex size-5 items-center justify-center rounded-full bg-secondary border border-secondary text-quaternary text-[10px] font-bold">
                                        3
                                    </div>
                                    <div>
                                        <p className="font-semibold text-secondary">Pass First Quiz</p>
                                        <p className="text-xs text-quaternary">Attempt to survive Dr. Cooper's grading</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </motion.div>
        </LearnDashboardLayout>
    );
}
