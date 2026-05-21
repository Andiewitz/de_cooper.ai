"use client";

import { Trophy01 } from "@untitledui/icons";
import { LearnPlaceholderPage } from "@/components/learn/learn-placeholder-page";

export default function LearnLeaderboardsPage() {
    return (
        <LearnPlaceholderPage
            title="Leaderboards"
            subtitle="See how you rank against other learners"
            description="Leaderboards and streak competitions are on the way. Complete lessons in Sandbox to build your stats."
            icon={Trophy01}
        />
    );
}
