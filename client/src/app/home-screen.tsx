"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen01, Atom01, Calculator, Code01, Star01, Zap } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/providers/auth-provider";

function Typewriter({ text, speed = 15, delay = 800 }: { text: string; speed?: number; delay?: number }) {
    const [displayedText, setDisplayedText] = useState("");
    const [start, setStart] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setStart(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!start) return;
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(i));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [start, text, speed]);

    return (
        <span className={displayedText.length < text.length ? "animate-cursor-blink" : ""}>
            {displayedText}
        </span>
    );
}

const features = [
    {
        icon: Atom01,
        title: "Physics & Beyond",
        description: "Quantum mechanics to thermodynamics — taught by someone who actually understands them.",
    },
    {
        icon: Calculator,
        title: "Visual Math",
        description: "LaTeX-rendered equations and step-by-step proofs. Because reading math in plain text is barbaric.",
    },
    {
        icon: Code01,
        title: "Code Examples",
        description: "Syntax-highlighted code with explanations. Even an engineer could follow along.",
    },
    {
        icon: Zap,
        title: "Instant Responses",
        description: "Streamed AI responses powered by Llama 70B. Faster than your neurons, certainly.",
    },
    {
        icon: BookOpen01,
        title: "Structured Lessons",
        description: "Persistent conversation history so you can review what you clearly didn't understand the first time.",
    },
    {
        icon: Star01,
        title: "Brutally Honest",
        description: "No participation trophies. No hand-holding. Just raw, unfiltered genius.",
    },
];

export default function HomePage() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="bg-primary">
            {/* Top Fold: Nav + Hero centered in full viewport height */}
            <div className="flex min-h-dvh flex-col border-b border-secondary">
                {/* Nav */}
                <nav className="border-b border-secondary">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <span className="font-logo text-xl font-bold text-primary tracking-tight">
                        de_cooper.ai
                    </span>
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <Button href="/learn" color="primary" size="sm">
                                Go to Lessons
                            </Button>
                        ) : (
                            <>
                                <Button href="/login" color="tertiary" size="sm">
                                    Sign In
                                </Button>
                                <Button href="/register" color="primary" size="sm">
                                    Get Started
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <section className="flex flex-1 flex-col justify-start px-6 py-12 pt-16 lg:pt-24">
                <div className="ml-0 mr-auto grid max-w-7xl w-full items-center gap-12 lg:grid-cols-12 text-left pl-4 lg:pl-16">
                    <div className="lg:col-span-7">
                        <h1 className="font-logo text-6xl lg:text-8xl font-extrabold tracking-tight text-primary leading-[0.88] opacity-0 animate-slide-fade-left-to-right">
                            Be the most obnoxious
                            <br />
                            <span className="text-fg-brand-primary">person in the room.</span>
                        </h1>

                        <p className="mt-5 max-w-xl text-lg text-tertiary flex flex-col gap-1.5 min-h-[96px]">
                            {[
                                "An uncompromisingly rigorous academic sandbox.",
                                "No watered-down concepts, no participation awards—",
                                "just beautiful, elegant mathematical proofs and a mentor who is mathematically certain he is smarter than you."
                            ].map((line, index) => (
                                <span
                                    key={index}
                                    className="opacity-0 animate-slide-fade-left-to-right block"
                                    style={{
                                        animationDelay: `${0.8 + index * 0.35}s`,
                                        animationFillMode: "forwards"
                                    }}
                                >
                                    {line}
                                </span>
                            ))}
                        </p>

                        <div className="mt-6 flex items-center gap-4 opacity-0 animate-slide-fade-left-to-right" style={{ animationDelay: "2.0s", animationFillMode: "forwards" }}>
                            <Button
                                href={isAuthenticated ? "/learn" : "/register"}
                                color="primary"
                                size="xl"
                            >
                                {isAuthenticated ? "Continue Learning" : "Start Learning"}
                            </Button>
                            <Button href="/login" color="secondary" size="xl">
                                Sign In
                            </Button>
                        </div>
                    </div>

                    <div className="hidden lg:col-span-5 lg:block">
                        <div className="relative rounded-2xl border border-secondary bg-secondary p-8 shadow-md">
                            {/* Window buttons */}
                            <div className="absolute top-4 right-4 flex gap-1.5">
                                <span className="size-3 rounded-full bg-neutral-300" />
                                <span className="size-3 rounded-full bg-neutral-300" />
                                <span className="size-3 rounded-full bg-neutral-300" />
                            </div>
                            
                            <div className="font-mono text-xs text-brand-secondary mb-4 uppercase tracking-wider font-semibold">
                                // LECTURE 07: Quantum Mechanics
                            </div>
                            
                            <div className="space-y-4">
                                <div className="rounded-lg border border-secondary bg-primary p-4 shadow-xs">
                                    <span className="block text-xs font-semibold text-tertiary mb-1">Schrödinger Equation</span>
                                    <code className="font-mono text-sm text-primary block overflow-x-auto whitespace-nowrap">
                                        iħ ∂/∂t Ψ(x,t) = Ĥ Ψ(x,t)
                                    </code>
                                </div>
                                
                                <div className="rounded-lg border border-secondary bg-primary p-4 shadow-xs">
                                    <span className="block text-xs font-semibold text-tertiary mb-1">Wavefunction Solution</span>
                                    <code className="font-mono text-sm text-primary block overflow-x-auto whitespace-nowrap">
                                        Ψ(x) = A e^(ikx) + B e^(-ikx)
                                    </code>
                                </div>

                                <div className="rounded-lg border border-secondary bg-primary p-4 shadow-xs">
                                    <span className="block text-xs font-semibold text-tertiary mb-1">Sheldon's Assessment</span>
                                    <p className="font-display text-sm italic text-primary">
                                        &ldquo;It&apos;s simple quantum mechanics. I&apos;d explain it to you, but you don&apos;t possess the required prefrontal cortex density.&rdquo;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        {/* Quote */}
        <section className="border-b border-secondary bg-secondary px-6 py-12">
                <blockquote className="mx-auto max-w-2xl text-center">
                    <p className="font-display text-xl font-medium italic text-primary">
                        &ldquo;I cry because others are stupid, and that makes me sad.&rdquo;
                    </p>
                    <footer className="mt-3 text-sm text-tertiary">
                        — Dr. Sheldon Cooper, B.S., M.S., M.A., Ph.D., Sc.D.
                    </footer>
                </blockquote>
            </section>

            {/* Features */}
            <section className="px-6 py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center">
                        <h2 className="font-display text-display-sm font-bold text-primary">
                            Why suffer through this?
                        </h2>
                        <p className="mt-3 text-lg text-tertiary">
                            Because despite the insults, you&apos;ll actually learn something. Probably.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    className="rounded-xl border border-secondary bg-primary p-6 shadow-xs transition-all duration-200 hover:shadow-md"
                                >
                                    <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-brand-primary">
                                        <Icon className="size-5 text-fg-brand-primary" />
                                    </div>
                                    <h3 className="font-display text-md font-semibold text-primary">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-tertiary">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-secondary bg-secondary px-6 py-20">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="font-display text-display-sm font-bold text-primary">
                        Ready to feel intellectually inadequate?
                    </h2>
                    <p className="mt-3 text-lg text-tertiary">
                        Create a free account and start your education. Dr. Cooper is waiting.
                        Impatiently.
                    </p>
                    <div className="mt-8">
                        <Button
                            href={isAuthenticated ? "/learn" : "/register"}
                            color="primary"
                            size="xl"
                        >
                            {isAuthenticated ? "Go to Lessons" : "Create Free Account"}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-secondary px-6 py-8">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <span className="font-logo text-sm font-bold text-tertiary tracking-tight">
                        de_cooper.ai
                    </span>
                    <p className="text-xs text-quaternary">
                        Not affiliated with CBS, Warner Bros., or Dr. Sheldon Cooper (who is fictional, unlike my intellect).
                    </p>
                </div>
            </footer>
        </div>
    );
}
