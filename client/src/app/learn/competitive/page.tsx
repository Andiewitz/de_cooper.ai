"use client";

import { Atom01 } from "@untitledui/icons";
import { LearnPlaceholderPage } from "@/components/learn/learn-placeholder-page";

export default function LearnCompetitivePage() {
    return (
        <LearnPlaceholderPage
            title="Competitive for Nerds"
            subtitle="Science and math challenges, LeetCode-style"
            description="Timed problems across physics, math, and more — ranked runs, hints from the AI tutor, and bragging rights. We're building the arena now."
            icon={Atom01}
        />
    );
}
