"use client";

import { useEffect } from "react";
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

export default function LearnPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-secondary">
                <div className="animate-pulse text-lg text-tertiary">Loading your workspace...</div>
            </div>
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
            <div className="mx-auto max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Main Workspace (Left) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Seamless, Premium Header Greeting */}
                        <motion.section
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="relative overflow-hidden rounded-2xl border border-secondary bg-primary p-6 sm:p-8"
                        >
                            {/* Glowing light-mesh visual accents in the canvas background */}
                            <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-brand-secondary opacity-60 blur-2xl" />
                            <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-2/3 bg-[#FEF08A]/20 blur-3xl" />

                            <div className="relative">
                                <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">Dashboard Welcome</p>
                                <h2 className="mt-1 font-display text-display-xs font-bold text-primary sm:text-display-sm">
                                    Hey {displayName}, ready to learn?
                                </h2>
                                <p className="mt-2 text-md text-tertiary leading-relaxed max-w-xl">
                                    Dr. Cooper is currently in a state of mild agitation. Select a curriculum module below to begin a lesson and attempt to prove your competence.
                                </p>
                            </div>
                        </motion.section>

                        {/* STEM Curriculum Modules (Redesigned Active Module Panel) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-tertiary">
                                    STEM Curriculum Modules
                                </h3>
                                <span className="text-xs text-quaternary font-medium">Select a module to launch</span>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-secondary bg-primary divide-y divide-secondary/60 shadow-xs">
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
                                            whileHover={{ backgroundColor: "var(--color-bg-secondary_hover)" }}
                                            transition={{ duration: 0.1 }}
                                            onClick={() => router.push(`/learn/${topic.id}`)}
                                            className="group flex w-full items-center justify-between p-5 text-left transition duration-150 ease-out outline-focus-ring cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                                                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-xs ${gradientClass}`}>
                                                    <Icon className="size-6" aria-hidden />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-md font-semibold text-primary group-hover:text-brand-secondary transition duration-100 flex items-center gap-2">
                                                        {topic.title}
                                                    </h4>
                                                    <p className="mt-1 text-sm text-tertiary line-clamp-2 max-w-xl group-hover:text-secondary transition duration-100">
                                                        {topic.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action state or launching cue */}
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="hidden sm:inline-flex rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-semibold text-tertiary group-hover:bg-brand-secondary group-hover:text-fg-brand-primary transition duration-150">
                                                    {topic.id === "general" ? "Open Q&A" : "Ready"}
                                                </span>
                                                <div className="flex size-8 items-center justify-center rounded-full bg-secondary/40 text-tertiary group-hover:bg-brand-solid group-hover:text-white transition duration-150">
                                                    <ArrowRight className="size-4" aria-hidden />
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Progress Sidebar Panel (Right) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-6 rounded-2xl border border-secondary bg-primary p-6 shadow-xs space-y-6">
                            
                            {/* User details summary header */}
                            <div className="flex items-center gap-3 pb-4 border-b border-secondary/60">
                                <Avatar size="md" initials={initials} alt={displayName} className="ring-2 ring-brand-secondary/40" />
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-primary truncate" title={displayName}>{displayName}</h3>
                                    <Badge color="purple" size="sm" className="mt-0.5">
                                        STEM Explorer
                                    </Badge>
                                </div>
                            </div>

                            {/* Overall progress visual circle */}
                            <div className="flex flex-col items-center justify-center py-5 bg-secondary/30 rounded-xl border border-secondary/50">
                                <CircleProgressBar value={0} />
                                <div className="mt-3 text-center px-4">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">Overall Progress</span>
                                    <p className="text-xs text-quaternary mt-1">Complete lessons to advance your rank</p>
                                </div>
                            </div>

                            {/* Integrated minimal stats grid (no floating card boxes!) */}
                            <div className="grid grid-cols-2 gap-4 py-2 border-b border-secondary/60">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5 text-tertiary">
                                        <Trophy01 className="size-4 text-amber-500" />
                                        <span className="text-xs font-medium uppercase tracking-wider">Completed</span>
                                    </div>
                                    <p className="mt-1 font-display text-display-xs font-bold text-primary">0</p>
                                    <span className="text-xs text-quaternary">lessons finished</span>
                                </div>
                                
                                <div className="flex flex-col border-l border-secondary/60 pl-4">
                                    <div className="flex items-center gap-1.5 text-tertiary">
                                        <Zap className="size-4 text-orange-500" />
                                        <span className="text-xs font-medium uppercase tracking-wider">Streak</span>
                                    </div>
                                    <p className="mt-1 font-display text-display-xs font-bold text-primary">0 days</p>
                                    <span className="text-xs text-quaternary">active streak</span>
                                </div>
                            </div>

                            {/* Roadmap Timeline path */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-tertiary">
                                    Your Learning Path
                                </h4>
                                <div className="relative pl-6 space-y-4">
                                    <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 border-l border-dashed border-secondary-solid/40" />

                                    {/* Step 1 */}
                                    <div className="relative flex gap-3 text-sm">
                                        <div className="absolute -left-6 mt-1 flex size-5 items-center justify-center rounded-full bg-brand-solid text-white text-[10px] font-bold">
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

                </div>
            </div>
        </LearnDashboardLayout>
    );
}
