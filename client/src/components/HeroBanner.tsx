"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/base/buttons/button";
import { ArrowRight } from "@untitledui/icons";

interface HeroBannerProps {
    name?: string;
    onStartLearning?: () => void;
}

export default function HeroBanner({ name, onStartLearning }: HeroBannerProps) {
    const greeting = name ? `Welcome back, ${name}` : "Welcome back";

    return (
        <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-secondary bg-primary p-6 sm:p-8"
        >
            <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-brand-secondary opacity-60 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-2/3 bg-[#FEF08A]/20 blur-3xl" />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">Your dashboard</p>
                    <h2 className="mt-1 font-display text-display-xs font-bold text-primary sm:text-display-sm">{greeting}</h2>
                    <p className="mt-2 max-w-xl text-md text-tertiary">
                        Pick up where you left off or start a new topic. Your AI tutor is standing by.
                    </p>
                </div>
                {onStartLearning && (
                    <Button color="primary" size="md" iconTrailing={ArrowRight} onClick={onStartLearning} className="shrink-0">
                        Browse topics
                    </Button>
                )}
            </div>
        </motion.section>
    );
}
