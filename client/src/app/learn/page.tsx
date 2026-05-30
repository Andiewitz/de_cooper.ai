"use client";

import type { ComponentType, SVGProps } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    BookOpen01,
    Atom01,
    Beaker01,
    Calculator,
    Code01,
    Globe01,
    Zap,
    ArrowRight,
    Trophy01,
    GraduationHat01,
} from "@untitledui/icons";
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
        description: "Algorithms, complexity theory, data structures, and software engineering principles designed to scale.",
        icon: Code01,
        accentBg: "bg-[#FCE8E6]",
        accentGradient: "from-red-400/20 to-rose-500/20",
        accentIcon: "text-red-600",
        hoverRing: "hover:ring-red-400/50",
        hoverText: "group-hover:text-red-600",
    },
    {
        id: "chemistry",
        title: "Chemistry",
        description: "Molecular orbital theory, reaction kinetics, organic synthesis, and the physical chemistry of materials.",
        icon: Beaker01,
        accentBg: "bg-[#E8F0FE]",
        accentGradient: "from-indigo-400/20 to-violet-500/20",
        accentIcon: "text-indigo-600",
        hoverRing: "hover:ring-indigo-400/50",
        hoverText: "group-hover:text-indigo-600",
    },
    {
        id: "astronomy",
        title: "Astronomy",
        description: "Astrophysics, stellar evolution, cosmology, and the exploration of orbital dynamics and celestial bodies.",
        icon: Globe01,
        accentBg: "bg-[#FDF2F8]",
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

export default function LearnPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) return null;
    if (!isAuthenticated) return null;

    if (user && !user.onboarding_completed) {
        return <OnboardingWizard onClose={() => {}} />;
    }

    const displayName = user?.display_name || user?.username || "Learner";
    const elo = user?.academic_elo ?? 500;

    // Determine ranking title based on ELO
    let rankTitle = "STEM Novice";
    let rankBadgeColor = "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (elo >= 1200) {
        rankTitle = "Grandmaster Polymath";
        rankBadgeColor = "text-purple-500 bg-purple-500/10 border-purple-500/20 animate-pulse";
    } else if (elo >= 1000) {
        rankTitle = "Master Scholar";
        rankBadgeColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    } else if (elo >= 800) {
        rankTitle = "STEM Elite";
        rankBadgeColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
    } else if (elo >= 650) {
        rankTitle = "Advanced Researcher";
        rankBadgeColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    } else if (elo >= 550) {
        rankTitle = "STEM Explorer";
        rankBadgeColor = "text-cyan-500 bg-cyan-500/10 border-cyan-500/20";
    }

    return (
        <LearnDashboardLayout title="Workspace Dashboard" subtitle="Interactive STEM Q&A and AI-Guided Lessons">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mx-auto max-w-4xl space-y-8"
            >
                {/* ── Beautiful Premium Glassmorphic Header & Academic ELO Panel ── */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-2xl border border-secondary bg-primary/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl overflow-hidden group flex flex-col md:flex-row md:items-center md:justify-between gap-6"
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
                    <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-brand-secondary/30 opacity-40 blur-3xl group-hover:opacity-60 transition-opacity duration-500" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-1/2 bg-[#FEF08A]/10 opacity-20 blur-3xl" />

                    <div className="flex-1">
                        <div className="flex items-center gap-2.5">
                            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-secondary">
                                Workspace Dashboard
                            </span>
                            <span className="text-quaternary font-mono text-[10px]">Active</span>
                        </div>
                        <h2 className="mt-3 font-display text-display-xs sm:text-display-sm font-black text-primary leading-tight">
                            Welcome back, {displayName}
                        </h2>
                        <p className="mt-2 text-sm sm:text-md text-secondary leading-relaxed max-w-xl">
                            Select any active STEM curriculum module below to engage with your personal AI-guided tutor.
                        </p>
                    </div>

                    {/* ELO Display */}
                    <div className="shrink-0 flex items-center gap-4 rounded-xl border border-secondary bg-secondary/35 p-4 sm:p-5 relative overflow-hidden min-w-[200px] shadow-sm select-none">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary border border-brand/20 shadow-inner relative">
                            <Trophy01 className="size-5 text-brand-secondary animate-bounce" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-tertiary">
                                Academic ELO
                            </p>
                            <p className="font-display text-2xl font-black text-primary tracking-tight mt-0.5">
                                {elo}
                            </p>
                            <div className={`mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${rankBadgeColor}`}>
                                {rankTitle}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── STEM Curriculum Modules Roadmap ── */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-0.5 h-5 bg-brand-solid rounded-full" />
                        <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">
                            STEM Curriculum Roadmap
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
                                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.008, y: -1 }}
                                    onClick={() => router.push(`/learn/${topic.id}`)}
                                    className={`group flex w-full items-center gap-6 rounded-xl border border-secondary bg-primary p-5 shadow-xs hover:shadow-lg ${topic.hoverRing} hover:ring-1 transition-all duration-200 cursor-pointer text-left outline-focus-ring`}
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
                                        <p className="mt-1 text-sm text-secondary line-clamp-2 max-w-xl">
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
            </motion.div>
        </LearnDashboardLayout>
    );
}
