"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen01, Atom01, Calculator, Code01, Star01, Zap } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";

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
            setDisplayedText(text.substring(0, i + 1));
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
                {/* Top Promo Banner (Clay inspired) */}
                <div className="w-full bg-[#FEF08A] text-black py-2 px-6 lg:px-16 flex flex-col md:flex-row md:items-center justify-between border-b border-secondary font-sans text-[10px] tracking-wider uppercase font-semibold">
                    <div className="flex items-center gap-2">
                        <span className="font-logo font-black text-xs">COOPER.AI</span>
                        <span className="opacity-50">//</span>
                        <span>THE RIGOROUS MATHEMATICAL COLLOQUIUM BY DR. COOPER</span>
                    </div>
                    <div className="mt-0.5 md:mt-0 flex items-center gap-2">
                        <span>OCT 23, 2026, PASADENA, CA</span>
                        <span className="text-[#2563EB] font-bold">→ COOPER.AI/PASADENA</span>
                    </div>
                </div>

                {/* Main Floating Nav (Clay inspired) */}
                <div className="w-full px-6 lg:px-16 mt-4">
                    <nav className="border border-secondary bg-primary/80 backdrop-blur-md rounded-2xl px-6 py-3 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
                        {/* Left: Brand logo */}
                        <Link href="/" className="font-logo text-xl font-extrabold text-primary tracking-tight select-none">
                            de_cooper.ai
                        </Link>

                        {/* Center: Navigation Links */}
                        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-secondary">
                            <Link href="/learn" className="hover:text-primary transition-colors">Sandbox</Link>
                            <Link href="/learn" className="hover:text-primary transition-colors">Mentorship</Link>
                            <Link href="/learn" className="hover:text-primary transition-colors">Leaderboard</Link>
                            <Link href="/learn" className="hover:text-primary transition-colors">FAQ</Link>
                        </div>

                        {/* Right: Dynamic Actions & Commands */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-md border border-secondary bg-secondary/30 text-[9px] font-mono text-tertiary select-none">
                                <span>⌘</span>
                                <span>K</span>
                                <span className="opacity-65">🔍</span>
                            </div>

                            <div className="hidden lg:block w-px h-5 bg-secondary/50 mx-1" />

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
                                        Get Started &rarr;
                                    </Button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>

            <section className="flex flex-1 flex-col justify-start px-6 py-12 pt-24 lg:pt-36">
                <div className="grid max-w-none w-full items-center gap-12 lg:grid-cols-12 text-left px-6 lg:px-16">
                    <div className="lg:col-span-7">
                        <h1 className="font-logo text-6xl lg:text-8xl font-extrabold tracking-tight text-primary leading-[0.88] flex flex-col gap-1">
                            <motion.span
                                initial={{ opacity: 0, x: -36 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.1 }}
                                className="block"
                            >
                                Be the most obnoxious
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, x: -36 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.45 }}
                                className="block text-fg-brand-primary"
                            >
                                person in the room.
                            </motion.span>
                        </h1>

                        <p className="mt-4 max-w-xl text-lg text-tertiary min-h-[84px]">
                            <Typewriter
                                text="An uncompromisingly rigorous academic sandbox. No watered-down concepts, no participation awards—just beautiful, elegant mathematical proofs and a mentor who is mathematically certain he is smarter than you."
                                delay={1200}
                                speed={12}
                            />
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 70, damping: 16, delay: 2.2 }}
                            className="mt-5 flex items-center gap-4"
                        >
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
                        </motion.div>
                    </div>

                    <div className="hidden lg:col-span-5 lg:block relative mr-0 ml-auto lg:pr-8 text-right translate-y-12 lg:-translate-x-16">
                        {/* Decorative background aura/glow */}
                        <div className="absolute inset-0 -m-8 rounded-full bg-radial from-brand-secondary/15 to-transparent blur-3xl opacity-60" />

                        {/* Orbiting technical academic coordinates */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0.4, scale: 1 }}
                            transition={{ duration: 1.2, delay: 2.4 }}
                            className="absolute inset-0 flex items-center justify-center animate-spin-slow pointer-events-none"
                        >
                            <svg className="w-[115%] h-[115%] text-brand-secondary" fill="none" viewBox="0 0 200 200">
                                <circle cx="100" cy="100" r="76" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                                <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="0.25" />
                                <path d="M 20 100 L 180 100 M 100 20 L 100 180" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />
                            </svg>
                        </motion.div>

                        {/* Main Sheldon 3D circular pop-out container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.7, x: 30 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ type: "spring", stiffness: 50, damping: 14, delay: 2.6 }}
                            className="relative mr-0 ml-auto size-[380px] xl:size-[440px] rounded-full border-4 border-secondary bg-secondary shadow-2xl flex items-end justify-center z-10"
                        >
                            {/* Inner circle backdrop */}
                            <div className="absolute inset-2.5 rounded-full bg-primary border border-secondary overflow-hidden" />
                            
                            {/* Sheldon popping out of the circle border */}
                            <motion.img
                                src="/sheldon.png"
                                alt="Dr. Sheldon Cooper"
                                initial={{ opacity: 0, y: 80, scale: 1.05 }}
                                animate={{ opacity: 1, y: 0, scale: 1.18 }}
                                transition={{ type: "spring", stiffness: 60, damping: 16, delay: 2.9 }}
                                whileHover={{ scale: 1.24 }}
                                className="absolute bottom-0 h-[122%] w-auto object-contain object-bottom z-30 cursor-pointer"
                            />
                        </motion.div>

                        {/* Floating pedantic quote badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 90, damping: 11, delay: 3.5 }}
                            className="absolute -bottom-2 right-4 rounded-xl border border-secondary bg-primary p-3.5 shadow-lg max-w-[220px] z-40 text-left"
                        >
                            <p className="font-display text-xs italic text-primary leading-snug">
                                &ldquo;I&apos;m not insane. My mother had me tested.&rdquo;
                            </p>
                            <span className="block text-[9px] font-mono text-tertiary mt-2 uppercase tracking-wider">// Dr. Cooper</span>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>

        {/* Social Proof / Quote Divider */}
        <section className="border-b border-secondary bg-secondary px-6 py-16 lg:py-20">
            <div className="mx-auto max-w-4xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-secondary bg-primary px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-tertiary mb-8">
                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                    AI-powered &middot; Llama 70B &middot; Always judging you
                </div>
                <blockquote>
                    <p className="font-logo text-2xl lg:text-3xl font-bold text-primary leading-snug tracking-tight">
                        &ldquo;I cry because others are stupid, and that makes me sad.&rdquo;
                    </p>
                    <footer className="mt-5 text-sm text-tertiary">
                        — Dr. Sheldon Cooper, B.S., M.S., M.A., Ph.D., Sc.D.
                    </footer>
                </blockquote>
            </div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-20 lg:py-28">
            <div className="mx-auto max-w-6xl">
                <div className="mb-14 max-w-2xl">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-brand-secondary mb-3">How it works</p>
                    <h2 className="font-logo text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">
                        Three steps to intellectual enlightenment.
                    </h2>
                    <p className="mt-4 text-base text-tertiary leading-relaxed">
                        Or as Dr. Cooper would say: a trivially simple process that even you should be able to follow.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {[
                        {
                            step: "01",
                            title: "Pick a subject",
                            desc: "Choose from mathematics, physics, computer science, or any topic you're embarrassingly unfamiliar with.",
                        },
                        {
                            step: "02",
                            title: "Ask Dr. Cooper",
                            desc: "Pose your question. He'll answer with the patience of someone who has already calculated the heat death of the universe.",
                        },
                        {
                            step: "03",
                            title: "Actually learn",
                            desc: "Receive step-by-step breakdowns with LaTeX proofs, code examples, and unsolicited commentary on your intelligence.",
                        },
                    ].map((item) => (
                        <div
                            key={item.step}
                            className="group relative rounded-2xl border border-secondary bg-primary p-7 transition-all duration-300 hover:border-brand-secondary/40 hover:shadow-lg"
                        >
                            <span className="font-mono text-4xl font-black text-brand-secondary/20 group-hover:text-brand-secondary/40 transition-colors">
                                {item.step}
                            </span>
                            <h3 className="mt-3 font-logo text-lg font-bold text-primary tracking-tight">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-sm text-tertiary leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Features Bento Grid */}
        <section className="border-t border-secondary bg-secondary/30 px-6 py-20 lg:py-28">
            <div className="mx-auto max-w-6xl">
                <div className="mb-14 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-brand-secondary mb-3">Features</p>
                    <h2 className="font-logo text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">
                        Why suffer through this?
                    </h2>
                    <p className="mt-4 text-base text-tertiary max-w-xl mx-auto">
                        Because despite the insults, you&apos;ll actually learn something. Probably.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="group rounded-2xl border border-secondary bg-primary p-6 transition-all duration-300 hover:shadow-lg hover:border-brand-secondary/30"
                            >
                                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-primary/80 group-hover:bg-brand-primary transition-colors">
                                    <Icon className="size-5 text-white" />
                                </div>
                                <h3 className="font-logo text-base font-bold text-primary tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm text-tertiary leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-secondary px-6 py-20 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
                <div className="rounded-3xl border border-secondary bg-secondary/40 px-8 py-14 lg:px-16 lg:py-20 relative overflow-hidden">
                    {/* Subtle decorative glow */}
                    <div className="absolute inset-0 bg-radial from-brand-secondary/8 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-secondary mb-4">Free forever</p>
                        <h2 className="font-logo text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">
                            Ready to feel intellectually inadequate?
                        </h2>
                        <p className="mt-4 text-base text-tertiary max-w-lg mx-auto leading-relaxed">
                            Create a free account and start your education. Dr. Cooper is waiting. Impatiently.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button
                                href={isAuthenticated ? "/learn" : "/register"}
                                color="primary"
                                size="xl"
                            >
                                {isAuthenticated ? "Go to Lessons" : "Create Free Account →"}
                            </Button>
                            <Button href="/terms" color="secondary" size="xl">
                                Read the Fine Print
                            </Button>
                        </div>
                        <p className="mt-6 text-[10px] text-quaternary">
                            No credit card required. No hidden fees. Just pure, unfiltered condescension.
                        </p>
                    </div>
                </div>
            </div>
        </section>

            {/* Footer — Legal Disclaimer & Satire Notice */}
            <footer className="border-t border-secondary bg-secondary/40 px-6 py-12">
                <div className="mx-auto max-w-5xl">
                    {/* Top row: Brand + Nav links */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
                        <div className="max-w-sm">
                            <span className="font-logo text-lg font-extrabold text-primary tracking-tight">
                                de_cooper.ai
                            </span>
                            <p className="mt-2 text-xs text-tertiary leading-relaxed">
                                A satirical, non-commercial educational experiment. Built for fun, learning, and the relentless pursuit of academic pedantry.
                            </p>
                        </div>
                        <div className="flex gap-10 text-xs text-secondary">
                            <div className="flex flex-col gap-2">
                                <span className="font-semibold text-primary uppercase tracking-wider text-[10px]">Platform</span>
                                <Link href="/learn" className="hover:text-primary transition-colors">Sandbox</Link>
                                <Link href="/register" className="hover:text-primary transition-colors">Create Account</Link>
                                <Link href="/login" className="hover:text-primary transition-colors">Sign In</Link>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="font-semibold text-primary uppercase tracking-wider text-[10px]">Legal</span>
                                <Link href="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
                                <span className="text-tertiary">Parody &amp; Satire</span>
                                <span className="text-tertiary">Non-Commercial Use</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-secondary mb-6" />

                    {/* Satire & Legal Disclaimer */}
                    <div className="rounded-xl border border-secondary bg-primary p-5 mb-6">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mb-2">⚖️ Parody &amp; Satire Disclaimer</p>
                        <p className="text-[11px] text-tertiary leading-relaxed">
                            This website is a <strong className="text-secondary">non-commercial, satirical fan project</strong> created purely for educational and comedic purposes.
                            It is <strong className="text-secondary">not affiliated with, endorsed by, or associated with</strong> CBS Studios, Warner Bros. Television,
                            Chuck Lorre Productions, Bill Prady, or any cast members of <em>The Big Bang Theory</em>.
                        </p>
                        <p className="text-[11px] text-tertiary leading-relaxed mt-2">
                            The character &ldquo;Dr. Sheldon Cooper&rdquo; is a fictional character from the television series <em>The Big Bang Theory</em>,
                            created by Chuck Lorre and Bill Prady. All related names, characters, and trademarks are the property of their respective owners.
                            Any use of the character&apos;s name, likeness, or personality traits on this site is intended solely as <strong className="text-secondary">parody and transformative commentary</strong> under
                            fair use principles.
                        </p>
                        <p className="text-[11px] text-tertiary leading-relaxed mt-2">
                            This project generates <strong className="text-secondary">no revenue</strong> and is not offered for sale. No copyrighted material from the show is reproduced.
                            If you are a rights holder and have concerns, please contact us and we will promptly address them.
                        </p>
                    </div>

                    {/* Bottom bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-quaternary">
                        <p>&copy; {new Date().getFullYear()} de_cooper.ai &mdash; A satirical fan project. Not for profit. Not affiliated with any studio or network.</p>
                        <p className="font-mono opacity-60">// bazinga.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
