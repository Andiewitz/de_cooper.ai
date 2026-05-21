"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen01, Atom01, Calculator, Code01, Globe01, Lightbulb02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/providers/auth-provider";
import OnboardingWizard from "@/components/onboarding-wizard";
import HeroBanner from "@/components/HeroBanner";
import TopicCard from "@/components/TopicCard";

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
            <div className="flex min-h-dvh items-center justify-center bg-primary">
                <div className="animate-pulse text-lg text-tertiary">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    // If user has not completed onboarding, show wizard
    if (user && !user.onboarding_completed) {
        return <OnboardingWizard onClose={() => {
            // Optionally refetch user data after onboarding completes
            // This could be handled by context update elsewhere
        }} />;
    }

    return (
        <div className="min-h-dvh bg-primary">
            {/* Header */}
            <header className="border-b border-secondary px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <h1 className="font-logo text-xl font-bold text-primary tracking-tight">de_cooper.ai</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-tertiary">
                            {user?.display_name || user?.username}
                        </span>
                        <Button color="tertiary" size="sm" onClick={() => {
                            localStorage.removeItem("decooper_token");
                            router.push("/login");
                        }}>
                            Sign out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Banner */}
            <main className="mx-auto max-w-6xl px-6 py-8">
                <HeroBanner name={user?.display_name || user?.username} />

                {/* Learning Progress Card */}
                <section className="mb-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
                    <h2 className="text-2xl font-bold text-white">Your Learning Journey</h2>
                    <p className="mt-2 text-white/80">Progress will appear here as you complete lessons.</p>
                </section>

                {/* Topic Grid */}
                <div className="mb-10 text-center">
                    <h2 className="font-display text-display-sm font-bold text-primary">What do you want to learn?</h2>
                    <p className="mt-2 text-lg text-tertiary">Choose a topic. I’ll try to explain it simply enough for you.</p>
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
            </main>
        </div>
    );
}
