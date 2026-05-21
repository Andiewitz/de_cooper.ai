"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Atom, 
    Check, 
    Lock,
    Calendar,
    Volume2
} from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const { register, error, clearError, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        display_name: "",
    });

    const [showBanner, setShowBanner] = useState(true);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        setIsSubmitting(true);

        try {
            await register(formData);
            router.push("/learn");
        } catch {
            // Error is handled by auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAF8] text-neutral-900 overflow-hidden font-sans flex flex-col justify-between selection:bg-brand-primary selection:text-white">
            
            {/* FIGMA-STYLE BRAND HEADER */}
            <header className="relative z-30 w-full px-6 py-4 flex items-center justify-between border-b border-neutral-200/80 bg-white/70 backdrop-blur-md">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="size-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white transition-transform group-hover:rotate-12 duration-300 shadow-sm">
                            <Atom className="size-4.5 stroke-[2.25]" />
                        </div>
                        <span className="font-logo text-lg font-black tracking-tight text-neutral-900">
                            de_cooper<span className="text-neutral-500 font-mono text-xs ml-0.5">.ai</span>
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-neutral-600">
                        <a href="#curriculum" className="hover:text-black transition-colors">Curriculum</a>
                        <a href="#ai-tutor" className="hover:text-black transition-colors">AI Tutor</a>
                        <a href="#flashcards" className="hover:text-black transition-colors">Flashcards</a>
                        <a href="#scheduler" className="hover:text-black transition-colors">Study Planner</a>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[13px] font-medium text-neutral-900 hidden sm:inline-block">
                        Already have an account?
                    </span>
                    <button 
                        onClick={() => router.push("/login")}
                        className="px-4 py-2 text-[13px] font-bold text-neutral-800 border border-neutral-300 rounded-full bg-white hover:bg-neutral-50 active:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
                    >
                        Log In
                    </button>
                </div>
            </header>

            {/* DYNAMIC SCROLLING BACKGROUND SHOWCASE */}
            <div className="absolute inset-0 z-0 flex flex-col justify-center pointer-events-none select-none overflow-hidden opacity-35 lg:opacity-50">
                {/* Horizontal Sliding Track 1 (Left to Right) */}
                <div className="flex gap-8 w-[250%] animate-[infinite-scroll_60s_linear_infinite] whitespace-nowrap mb-8 pl-12">
                    {mockupCardsGroup1.map((card, idx) => (
                        <BackgroundMockCard key={idx} {...card} />
                    ))}
                    {mockupCardsGroup1.map((card, idx) => (
                        <BackgroundMockCard key={`dup-${idx}`} {...card} />
                    ))}
                </div>

                {/* Horizontal Sliding Track 2 (Right to Left) */}
                <div className="flex gap-8 w-[250%] animate-[infinite-scroll-reverse_70s_linear_infinite] whitespace-nowrap">
                    {mockupCardsGroup2.map((card, idx) => (
                        <BackgroundMockCard key={idx} {...card} />
                    ))}
                    {mockupCardsGroup2.map((card, idx) => (
                        <BackgroundMockCard key={`dup-${idx}`} {...card} />
                    ))}
                </div>
            </div>

            {/* CENTRAL REGISTER CARD CONTAINER */}
            <main className="relative z-20 flex-1 flex items-center justify-center p-4 py-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[420px] bg-white border border-neutral-200 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-8 relative"
                >
                    {/* Top right close button */}
                    <button 
                        onClick={() => router.push("/")}
                        className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full p-1 hover:bg-neutral-50 cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>

                    {/* Logo/Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-700 font-bold">
                            <span className="size-1 rounded-full bg-neutral-600 animate-ping" />
                            Enroll in the academy
                        </div>
                    </div>

                    <h1 className="text-xl font-bold tracking-tight text-center text-neutral-900 mb-2">
                        Create your account
                    </h1>
                    <p className="text-xs text-neutral-500 text-center mb-6 max-w-xs mx-auto leading-relaxed">
                        Start your tailored study plan today with fully interactive spaced-repetition tracking.
                    </p>

                    {/* Error display */}
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold leading-relaxed">
                            {error}
                        </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        
                        {/* DISPLAY NAME INPUT (Figma Style) */}
                        <div className="relative bg-[#F2F2F2] hover:bg-[#EAEAEA] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-transparent focus-within:border-transparent px-4 py-2.5 rounded-lg transition-all duration-150 text-left">
                            <label className="block text-[9px] font-black text-neutral-500 tracking-wider uppercase mb-0.5 select-none">
                                Display Name
                            </label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 font-semibold placeholder:text-neutral-400 p-0 focus:ring-0"
                                value={formData.display_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                            />
                        </div>

                        {/* USERNAME INPUT (Figma Style) */}
                        <div className="relative bg-[#F2F2F2] hover:bg-[#EAEAEA] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-transparent focus-within:border-transparent px-4 py-2.5 rounded-lg transition-all duration-150 text-left">
                            <label className="block text-[9px] font-black text-neutral-500 tracking-wider uppercase mb-0.5 select-none">
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="username"
                                className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 font-semibold placeholder:text-neutral-400 p-0 focus:ring-0"
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                required
                            />
                        </div>

                        {/* EMAIL INPUT (Figma Style) */}
                        <div className="relative bg-[#F2F2F2] hover:bg-[#EAEAEA] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-transparent focus-within:border-transparent px-4 py-2.5 rounded-lg transition-all duration-150 text-left">
                            <label className="block text-[9px] font-black text-neutral-500 tracking-wider uppercase mb-0.5 select-none">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 font-semibold placeholder:text-neutral-400 p-0 focus:ring-0"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                required
                            />
                        </div>

                        {/* PASSWORD INPUT (Figma Style) */}
                        <div className="relative bg-[#F2F2F2] hover:bg-[#EAEAEA] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-transparent focus-within:border-transparent px-4 py-2.5 rounded-lg transition-all duration-150 text-left">
                            <label className="block text-[9px] font-black text-neutral-500 tracking-wider uppercase mb-0.5 select-none">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="At least 8 characters"
                                className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 font-semibold placeholder:text-neutral-400 p-0 focus:ring-0"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="flex items-start gap-2 text-[10px] text-neutral-500 leading-normal bg-neutral-50 border border-neutral-100 rounded-lg p-2.5">
                            <Lock className="size-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                            <span>Ensure your password is at least 8 characters with letters, numbers, and symbols.</span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full h-11 bg-neutral-950 text-white rounded-lg flex items-center justify-center text-[14px] font-bold hover:bg-neutral-800 active:bg-black transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isSubmitting || isLoading ? "Registering..." : "Create Account"}
                        </button>
                    </form>

                    {/* Bottom Action Links */}
                    <div className="mt-6 text-center text-[12px]">
                        <span className="text-neutral-400 font-normal">
                            Already have an account?{" "}
                            <Link href="/login" className="font-bold text-neutral-900 hover:text-neutral-700 underline underline-offset-4 decoration-1">
                                Sign in
                            </Link>
                        </span>
                    </div>
                </motion.div>
            </main>

            {/* HIGH FIDELITY PRODUCTIVITY BANNER */}
            <AnimatePresence>
                {showBanner && (
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-30 w-full bg-neutral-900 border-t border-neutral-800 text-white px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                            <span className="bg-emerald-500 text-neutral-950 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
                                New Feature
                            </span>
                            <p className="text-[12px] font-medium text-neutral-300">
                                Smart Spaced Repetition model now automatically schedules card reviews aligned with your personal memory decay curves.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => router.push("/register")}
                                className="px-3.5 py-1 text-[11px] font-extrabold text-neutral-950 bg-white hover:bg-neutral-100 active:bg-neutral-200 rounded transition-colors cursor-pointer shadow-sm"
                            >
                                Register Today
                            </button>
                            <button 
                                onClick={() => setShowBanner(false)}
                                className="text-neutral-400 hover:text-white transition-colors p-1 cursor-pointer"
                                aria-label="Dismiss banner"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Background Mockup Cards Styling & Content
interface MockupCardProps {
    title: string;
    subtitle?: string;
    badge?: string;
    details: React.ReactNode;
    color: string;
    width?: string;
}

function BackgroundMockCard({ title, subtitle, badge, details, color, width = "w-[280px]" }: MockupCardProps) {
    return (
        <div className={`flex-shrink-0 ${width} rounded-2xl border p-5 shadow-sm select-none ${color} transition-all duration-300`}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h5 className="text-[11px] font-black tracking-wider uppercase opacity-40 leading-none mb-1">
                        {subtitle}
                    </h5>
                    <h4 className="text-[14px] font-bold tracking-tight leading-tight">
                        {title}
                    </h4>
                </div>
                {badge && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-neutral-200/50 text-neutral-700">
                        {badge}
                    </span>
                )}
            </div>
            <div className="mt-2 text-xs">
                {details}
            </div>
        </div>
    );
}

// Actual educational/edtech mockup cards
const mockupCardsGroup1: MockupCardProps[] = [
    {
        title: "Study Schedule Allocation",
        subtitle: "AI Calendar",
        badge: "Smart Allocation",
        color: "bg-white border-neutral-200 text-neutral-900",
        details: (
            <div className="space-y-2 mt-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500">
                    <span className="flex items-center gap-1.5"><Calendar className="size-3 text-neutral-600" /> Quantum Physics</span>
                    <span className="text-neutral-800">4.5 hrs / wk</span>
                </div>
                <div className="h-2 rounded bg-neutral-100 overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-neutral-900 w-[80%]" />
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] font-semibold text-neutral-600">
                    <span>Next Review Block:</span>
                    <span className="text-emerald-700 font-bold">Tomorrow, 9:00 AM</span>
                </div>
            </div>
        )
    },
    {
        title: "Active Learning Deck",
        subtitle: "Flashcard Stack",
        badge: "Spaced-Rep",
        color: "bg-[#FFFDF4] border-[#F2ECC2] text-neutral-950",
        details: (
            <div className="space-y-2 mt-1">
                <div className="flex items-center gap-2.5 p-1.5 bg-[#FBF6D5] rounded-lg border border-[#EDE29F]">
                    <div className="size-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                        12
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold truncate">Special Relativity Equations</div>
                        <div className="text-[8px] text-amber-800 leading-none">Lorenz transformation focus</div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold text-amber-900/80 px-1">
                    <span>Cards Studied Today</span>
                    <span>14 / 20</span>
                </div>
            </div>
        )
    },
    {
        title: "Dr. Cooper AI Chat",
        subtitle: "AI Tutor Interaction",
        badge: "Interactive Chat",
        color: "bg-white border-neutral-200 text-neutral-900",
        width: "w-[300px]",
        details: (
            <div className="space-y-2 text-[9px] text-neutral-500 font-mono mt-1">
                <p className="bg-neutral-50 p-2 rounded leading-relaxed border border-neutral-100 text-neutral-700">
                    "Let's be clear: a basic understanding of Newtonian mechanics is a prerequisite for this course. Shall we proceed?"
                </p>
                <div className="flex items-center gap-1.5 text-neutral-800 font-bold">
                    <Check className="size-3 text-emerald-600 stroke-[3]" />
                    <span>Response Generated: Highly Analytical</span>
                </div>
            </div>
        )
    },
    {
        title: "Memory Retention Curve",
        subtitle: "Student Analytics",
        badge: "Active Recall",
        color: "bg-emerald-950 border-emerald-900 text-emerald-100",
        details: (
            <div className="space-y-2 mt-1">
                <div className="flex items-center justify-between text-[10px]">
                    <span className="opacity-70 font-semibold">Retention Rate</span>
                    <span className="font-bold text-emerald-400">94.2%</span>
                </div>
                <div className="bg-emerald-900/60 p-2 rounded border border-emerald-800 text-[10px] font-bold text-center">
                    Review Interval: 4 Days
                </div>
                <div className="text-[8px] text-emerald-300 text-center font-bold tracking-wide uppercase">
                    Memory Decay Delayed Successfully
                </div>
            </div>
        )
    }
];

const mockupCardsGroup2: MockupCardProps[] = [
    {
        title: "Calculus Limits & Theory",
        subtitle: "Tutor Equations",
        badge: "LaTeX Engine",
        color: "bg-neutral-950 border-neutral-800 text-white",
        details: (
            <div className="space-y-2 mt-1 font-mono">
                <div className="bg-neutral-900 p-2 rounded border border-neutral-800 text-[9px] text-emerald-400">
                    {"f'(x) = lim (h -> 0) [f(x+h) - f(x)] / h"}
                </div>
                <div className="flex items-center justify-between text-[9px] text-neutral-400">
                    <span>Rendering Precision</span>
                    <span className="text-emerald-400 font-bold">Vector SVG</span>
                </div>
            </div>
        )
    },
    {
        title: "Daily Focus Metrics",
        subtitle: "Performance Index",
        badge: "Focus Tracker",
        color: "bg-indigo-950 border-indigo-900 text-indigo-100",
        details: (
            <div className="space-y-2 mt-1">
                <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="opacity-70 font-semibold">Peak Productivity</span>
                    <span className="font-bold text-indigo-300">9:00 PM - 11:30 PM</span>
                </div>
                <div className="flex justify-between items-center text-[9px] border-t border-indigo-900 pt-1.5">
                    <span className="opacity-70">Weekly Study Hours</span>
                    <span className="font-bold">28.4 hrs</span>
                </div>
            </div>
        )
    },
    {
        title: "Knowledge Map Coverage",
        subtitle: "Syllabus Track",
        badge: "100% Curated",
        color: "bg-white border-neutral-200 text-neutral-900",
        details: (
            <div className="space-y-2 mt-1">
                <div className="flex justify-between items-center text-[10px] font-semibold text-neutral-700">
                    <span>Maths Fundamentals</span>
                    <span className="font-bold text-neutral-900">100%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold text-neutral-700">
                    <span>Quantum Mechanics</span>
                    <span className="font-bold text-neutral-900">45%</span>
                </div>
                <div className="bg-neutral-50 p-1.5 text-[9px] rounded text-center border border-neutral-100 font-bold text-neutral-600">
                    4 new modules unlocked today
                </div>
            </div>
        )
    }
];
