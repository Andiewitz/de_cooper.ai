"use client";

import { Calendar } from "@untitledui/icons";
import { LearnPlaceholderPage } from "@/components/learn/learn-placeholder-page";

export default function LearnCalendarPage() {
    return (
        <LearnPlaceholderPage
            title="Calendar"
            subtitle="Plan and track your study sessions"
            description="Your study calendar and session scheduling will live here. For now, pick a topic from Home or Sandbox."
            icon={Calendar}
        />
    );
}
