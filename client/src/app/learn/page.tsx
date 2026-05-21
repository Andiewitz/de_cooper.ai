"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BookOpen01, Atom01, Calculator, Code01, Globe01, Lightbulb02, Zap } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { useAuth } from "@/providers/auth-provider";
import OnboardingWizard from "@/components/onboarding-wizard";
import HeroBanner from "@/components/HeroBanner";
import TopicCard from "@/components/TopicCard";
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
    const topicsRef = useRef<HTMLDivElement>(null);

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

    const displayName = user?.display_name || user?.username;

    return (
        <LearnDashboardLayout title="Dashboard" subtitle="Track progress and pick your next lesson">
            <div className="mx-auto max-w-6xl space-y-8">
                <HeroBanner
                    name={displayName}
                    onStartLearning={() => topicsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                />

                {/* Stats row */}
                <section className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-secondary bg-primary p-5">
                        <p className="text-sm font-medium text-tertiary">Lessons completed</p>
                        <p className="mt-1 font-display text-display-xs font-bold text-primary">0</p>
                        <Badge color="gray" size="sm" className="mt-3">
                            Just getting started
                        </Badge>
                    </div>
                    <div className="rounded-xl border border-secondary bg-primary p-5">
                        <p className="text-sm font-medium text-tertiary">Study streak</p>
                        <p className="mt-1 font-display text-display-xs font-bold text-primary">0 days</p>
                        <p className="mt-3 text-xs text-quaternary">Complete a lesson to begin</p>
                    </div>
                    <div className="rounded-xl border border-secondary bg-primary p-5">
                        <p className="text-sm font-medium text-tertiary">Topics available</p>
                        <p className="mt-1 font-display text-display-xs font-bold text-brand-secondary">{topics.length}</p>
                        <p className="mt-3 text-xs text-quaternary">Across STEM & general Q&A</p>
                    </div>
                </section>

                {/* Progress + continue */}
                <section className="grid gap-6 lg:grid-cols-5">
                    <div className="rounded-xl border border-secondary bg-primary p-6 lg:col-span-3">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-primary">Your learning journey</h2>
                                <p className="mt-1 text-sm text-tertiary">
                                    Progress updates as you complete lessons and quizzes.
                                </p>
                            </div>
                            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary">
                                <Zap className="size-5 text-fg-brand-primary" aria-hidden />
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="font-medium text-secondary">Overall progress</span>
                                <span className="text-tertiary">0%</span>
                            </div>
                            <ProgressBar value={0} progressClassName="bg-brand-solid" />
                        </div>
                        <p className="mt-4 text-sm text-quaternary">No lessons completed yet — choose a topic below to begin.</p>
                    </div>

                    <div className="rounded-xl border border-dashed border-secondary bg-secondary/50 p-6 lg:col-span-2">
                        <h3 className="text-sm font-semibold text-secondary">Continue learning</h3>
                        <p className="mt-2 text-sm text-tertiary">Your recent lessons will appear here once you start.</p>
                        <button
                            type="button"
                            onClick={() => topicsRef.current?.scrollIntoView({ behavior: "smooth" })}
                            className="mt-4 text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover transition duration-100"
                        >
                            Explore topics →
                        </button>
                    </div>
                </section>

                {/* Topic grid */}
                <section ref={topicsRef}>
                    <div className="mb-6">
                        <h2 className="font-display text-display-xs font-bold text-primary sm:text-display-sm">
                            Choose a topic
                        </h2>
                        <p className="mt-2 text-md text-tertiary">
                            Select a subject to start an AI-guided lesson with Dr. Cooper.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {topics.map((topic) => {
                            const Icon = topic.icon;
                            return (
                                <TopicCard
                                    key={topic.id}
                                    id={topic.id}
                                    title={topic.title}
                                    description={topic.description}
                                    Icon={Icon}
                                    onClick={() => router.push(`/learn/${topic.id}`)}
                                />
                            );
                        })}
                    </div>
                </section>
            </div>
        </LearnDashboardLayout>
    );
}
