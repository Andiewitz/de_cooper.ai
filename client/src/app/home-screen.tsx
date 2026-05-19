"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen01, Atom01, Calculator, Code01, Star01, Zap } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";
import { TermsModal } from "@/components/terms-modal";

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
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    return (
        <div className="bg-primary">
            {/* Top Fold: Nav + Hero centered in full viewport height */}
            <div className="flex min-h-dvh flex-col border-b border-secondary">
                {/* Top Promo Banner (Clay inspired) */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    className="w-full bg-[#FEF08A] text-black py-2 px-6 lg:px-16 flex flex-col md:flex-row md:items-center justify-between border-b border-secondary font-sans text-[10px] tracking-wider uppercase font-semibold z-50"
                >
                    <div className="flex items-center gap-2">
                        <span className="font-logo font-black text-xs">COOPER.AI</span>
                        <span className="opacity-50">//</span>
                        <span>THE RIGOROUS MATHEMATICAL COLLOQUIUM BY DR. COOPER</span>
                    </div>
                    <div className="mt-0.5 md:mt-0 flex items-center gap-2">
                        <span>OCT 23, 2026, PASADENA, CA</span>
                        <span className="text-[#2563EB] font-bold">→ COOPER.AI/PASADENA</span>
                    </div>
                </motion.div>

                {/* Main Floating Nav (Clay inspired) */}
                <motion.div
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.15 }}
                    className="w-full px-6 lg:px-16 mt-4 z-40"
                >
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
                </motion.div>

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

        {/* Central Library Split Section (Clay-inspired) */}
        <section className="border-t border-secondary px-6 py-20 lg:py-28 bg-primary">
            <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-12 items-center">
                {/* Left: Text & CTA */}
                <div className="lg:col-span-7 space-y-6">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-brand-secondary">Central Library</p>
                    <h2 className="font-logo text-3xl lg:text-5xl font-extrabold text-primary tracking-tight leading-[1.1]">
                        Access Dr. Cooper&apos;s entire mental library in one central platform
                    </h2>
                    <p className="text-base text-tertiary leading-relaxed max-w-xl">
                        Stop waiting semesters to listen to hand-waving, unrigorous lectures. de_cooper.ai gives you immediate access to advanced physics, mathematical proofs, and automated validation solvers in a single environment. No grade curves, no participation trophies, no excuses.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button href="/learn" color="primary" size="xl">
                            Launch the Sandbox &rarr;
                        </Button>
                        <Button onClick={() => setIsTermsOpen(true)} color="secondary" size="xl">
                            Read the Rules &rarr;
                        </Button>
                    </div>
                </div>

                {/* Right: 3D Illustration Container */}
                <div className="lg:col-span-5">
                    <div className="bg-[#F9F6F0] rounded-3xl p-8 border border-secondary shadow-sm flex items-center justify-center relative aspect-square overflow-hidden group select-none">
                        {/* Subtle grid pattern background to enhance the aesthetic */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                        
                        <motion.img 
                            src="/toolbox.png" 
                            alt="Academic Toolbox" 
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out z-10"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* Features Bento Grid (Clay-inspired) */}
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

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Card 1: Green Card (Verification & Exports) */}
                    <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-[#043327] text-white rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative border border-[#0d4e3e] shadow-md min-h-[580px] lg:min-h-[620px]"
                    >
                        {/* Mock UI Container */}
                        <div className="bg-[#03231a]/80 border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden h-72">
                            <div className="flex items-center justify-between text-[9px] font-mono text-white/40 border-b border-white/5 pb-2">
                                <span>VERIFICATION PIPELINE</span>
                                <span>STATUS: ACTIVE</span>
                            </div>
                            
                            <div className="space-y-2 font-mono text-[11px] text-white/70">
                                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                                    <span>Topological K-Theory Proof</span>
                                    <span className="text-red-400 font-semibold">● Logic Error</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                                    <span>Yang-Mills Boundary Proof</span>
                                    <span className="text-emerald-400 font-semibold">● Verified</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5">
                                    <span>Schrödinger Wave Derivation</span>
                                    <span className="text-yellow-400 font-semibold">● Compiling...</span>
                                </div>
                            </div>

                            {/* Floating Dropdown Selector */}
                            <div className="absolute top-12 right-6 w-56 bg-white rounded-xl shadow-2xl border border-secondary p-2.5 text-black space-y-1 z-10">
                                <div className="text-[8px] font-mono text-neutral-400 font-bold uppercase tracking-wider px-2 py-0.5">Export Proof To:</div>
                                <div className="flex items-center justify-between text-[11px] font-semibold px-2 py-1.5 hover:bg-neutral-100 rounded-lg cursor-pointer">
                                    <span className="flex items-center gap-2">📄 Compile via Coq</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold px-2 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg cursor-pointer">
                                    <span className="flex items-center gap-2">📐 Compile to LaTeX</span>
                                    <span className="text-[10px]">&rarr;</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-semibold px-2 py-1.5 hover:bg-neutral-100 rounded-lg cursor-pointer">
                                    <span className="flex items-center gap-2">🐍 Generate Python Solver</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Info */}
                        <div className="mt-8 space-y-3">
                            <span className="inline-block bg-[#0a4d3c] text-[#34d399] px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold">
                                Destinations
                            </span>
                            <h3 className="font-logo text-2xl font-bold tracking-tight text-white leading-tight">
                                Constantly verify and compile proofs to LaTeX, Coq, or Python
                            </h3>
                            <p className="text-xs text-white/70 leading-relaxed font-sans">
                                Push your academic work straight to Coq proof assistants, mathematical solvers, or clean PDF compilations. Dr. Cooper&apos;s compiler handles the rigorous double-checks so you can focus on pure logic.
                            </p>
                        </div>
                    </motion.div>

                    {/* Card 2: Light Cream Testimonial & Metric Card */}
                    <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-primary border border-secondary rounded-3xl p-8 flex flex-col justify-between shadow-sm min-h-[580px] lg:min-h-[620px]"
                    >
                        {/* Top Quote */}
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-primary italic leading-relaxed">
                                &ldquo;de_cooper.ai has helped Caltech significantly improve our academic standards. We&apos;ve been able to consolidate our entire department&apos;s requirements into core essentials, like topology, physics, and Sheldon&apos;s couch rules.&rdquo;
                            </p>
                            <div>
                                <h4 className="text-xs font-bold text-primary">Leonard Hofstadter, Ph.D.</h4>
                                <p className="text-[10px] text-tertiary">Head of Experimental Physics at Caltech</p>
                            </div>
                        </div>

                        {/* Middle Metrics list */}
                        <div className="my-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="bg-[#0f172a] text-white rounded px-2 py-1 text-[10px] font-mono font-bold shrink-0 min-w-[65px] text-center">
                                    12h/week
                                </span>
                                <p className="text-xs text-tertiary mt-0.5">Average time saved from hand-waving explanations by using exact mathematical proofs.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="bg-[#0f172a] text-white rounded px-2 py-1 text-[10px] font-mono font-bold shrink-0 min-w-[65px] text-center">
                                    100+
                                </span>
                                <p className="text-xs text-tertiary mt-0.5">Total sarcastic remarks received before completing a single homework set.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="bg-[#0f172a] text-white rounded px-2 py-1 text-[10px] font-mono font-bold shrink-0 min-w-[65px] text-center">
                                    0%
                                </span>
                                <p className="text-xs text-tertiary mt-0.5">Chance of receiving any partial credit or participation trophies.</p>
                            </div>
                        </div>

                        {/* Bottom Separator Line & Brand */}
                        <div className="border-t border-secondary pt-4 flex items-center justify-between">
                            <span className="font-logo text-xs font-black tracking-widest text-primary uppercase select-none opacity-60">
                                C A L T E C H
                            </span>
                            <Link href="/learn" className="text-xs font-bold text-primary hover:text-brand-primary transition-colors flex items-center gap-1">
                                View Curriculum &rarr;
                            </Link>
                        </div>
                    </motion.div>

                    {/* Card 3: Deep Purple Card (Persona Normalization / Rigor Transformation) */}
                    <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-[#2e1065] text-white rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative border border-[#4c1d95] shadow-md min-h-[580px] lg:min-h-[620px]"
                    >
                        {/* Mock UI Container */}
                        <div className="bg-[#1e0a3b]/80 border border-white/10 rounded-2xl p-5 space-y-4 relative overflow-hidden h-72">
                            {/* Input block */}
                            <div className="space-y-1.5">
                                <div className="text-[9px] font-mono text-white/40">STUDENT INPUT:</div>
                                <div className="bg-[#2e1065] border border-white/15 rounded-xl px-3 py-2 text-[11px] font-mono text-white/90">
                                    &ldquo;gravity pulls things down pretty fast&rdquo;
                                </div>
                            </div>

                            {/* Transformation popup overlay */}
                            <div className="absolute top-10 right-4 w-52 bg-white rounded-xl shadow-2xl border border-secondary p-2 text-black space-y-1 z-10">
                                <div className="flex items-center gap-2 text-[10px] font-semibold px-2 py-1.5 hover:bg-neutral-100 rounded-lg cursor-pointer">
                                    <span>📝 Normalize variables</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold px-2 py-1.5 bg-purple-50 text-purple-900 rounded-lg cursor-pointer">
                                    <span className="flex items-center gap-1.5">📐 Convert to Theorem</span>
                                    <span>&rarr;</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-semibold px-2 py-1.5 hover:bg-neutral-100 rounded-lg cursor-pointer">
                                    <span>🛑 Deduplicate hand-waving</span>
                                </div>
                            </div>

                            {/* Result block */}
                            <div className="space-y-1.5">
                                <div className="text-[9px] font-mono text-white/40">RIGOROUS NORMALIZATION:</div>
                                <div className="bg-emerald-950/80 border border-emerald-500/20 text-emerald-300 rounded-xl px-3 py-2 text-[11px] font-mono">
                                    g &asymp; 9.81 m/s&sup2; exerts gravitational force F = G(m&sup1;m&sup2;)/r&sup2;
                                </div>
                            </div>
                        </div>

                        {/* Bottom Info */}
                        <div className="mt-8 space-y-3">
                            <span className="inline-block bg-[#3b0764] text-[#d8b4fe] px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold">
                                Rigor Translation
                            </span>
                            <h3 className="font-logo text-2xl font-bold tracking-tight text-white leading-tight">
                                Clean and format your scientific assumptions in seconds
                            </h3>
                            <p className="text-xs text-white/70 leading-relaxed font-sans">
                                Use our parser to transform any hand-waving explanation into strict, axiom-backed statements. Eliminate ambiguity, ensure mathematical precision, and strip out unnecessary adjectives.
                            </p>
                        </div>
                    </motion.div>

                    {/* Card 4: Deep Blue Card (Conditional Logic Steps) */}
                    <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-[#1e3a8a] text-white rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative border border-[#1d4ed8] shadow-md min-h-[580px] lg:min-h-[620px]"
                    >
                        {/* Mock UI Container */}
                        <div className="bg-[#172554]/80 border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden h-72">
                            <div className="flex items-center justify-between text-[9px] font-mono text-white/40 border-b border-white/5 pb-2">
                                <span>RESPONSE MATRIX</span>
                                <span>RULE #42</span>
                            </div>

                            {/* Rules */}
                            <div className="bg-[#1e3a8a] border border-white/10 rounded-xl p-3 space-y-2 text-[11px] font-mono">
                                <div className="flex items-center gap-1.5 text-white/60">
                                    <span>Evaluate student proof if:</span>
                                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">Workspace</span>
                                    <span>is active</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/60">
                                    <span>and</span>
                                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">Proof Logic</span>
                                    <span>contains hand-waving</span>
                                </div>
                            </div>

                            {/* Rule Action */}
                            <div className="bg-rose-950/60 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-[11px] font-mono space-y-1">
                                <div className="text-[9px] text-rose-400 font-bold uppercase tracking-wider">AI-Generated Outcome:</div>
                                <div>!sarcasm_modifier &amp;&amp; trigger_cooper_laughter(&ldquo;ha-ha&rdquo;)</div>
                            </div>
                        </div>

                        {/* Bottom Info */}
                        <div className="mt-8 space-y-3">
                            <span className="inline-block bg-[#172554] text-[#93c5fd] px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold">
                                Academic Conditionals
                            </span>
                            <h3 className="font-logo text-2xl font-bold tracking-tight text-white leading-tight">
                                Run response pipelines conditionally &mdash; no engineering needed
                            </h3>
                            <p className="text-xs text-white/70 leading-relaxed font-sans">
                                Design custom learning maps that adapt to your inputs automatically. Direct correct proof paths straight to advanced topics, and trigger targeted remediation pipelines for logical fallacies.
                            </p>
                        </div>
                    </motion.div>
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
                            <Button onClick={() => setIsTermsOpen(true)} color="secondary" size="xl">
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
                                <Link href="/terms" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
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

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </div>
    );
}
