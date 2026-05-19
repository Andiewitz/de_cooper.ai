"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen01, Atom01, Calculator, Code01, Globe01, Lightbulb02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/providers/auth-provider";

const topics = [
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

            {/* Main */}
            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="mb-10 text-center">
                    <h2 className="font-display text-display-sm font-bold text-primary">
                        What do you want to learn?
                    </h2>
                    <p className="mt-2 text-lg text-tertiary">
                        Choose a topic. I&apos;ll try to explain it simply enough for you.
                    </p>
                </div>

                {/* Topic Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {topics.map((topic) => {
                        const Icon = topic.icon;
                        return (
                            <button
                                key={topic.id}
                                onClick={() => router.push(`/learn/${topic.id}`)}
                                className="group cursor-pointer rounded-xl border border-secondary bg-primary p-6 text-left shadow-xs transition-all duration-200 hover:border-brand hover:shadow-md"
                            >
                                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-brand-primary">
                                    <Icon className="size-5 text-fg-brand-primary" />
                                </div>
                                <h3 className="font-display text-lg font-semibold text-primary group-hover:text-brand-secondary">
                                    {topic.title}
                                </h3>
                                <p className="mt-1 text-sm text-tertiary">
                                    {topic.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
